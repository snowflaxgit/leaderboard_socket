/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

//database
var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

// all environments
app.set('port', process.env.PORT || 3460);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

 var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server, { log: false });

io.sockets.on('connection', function (socket) {
	app.get('/',function(req, res){
		console.log("call index....");
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.render('index');
	});

	app.get('/list', routes.list);

	socket.on('addnew', function(data) {
		db.collection('users', function(err, collection) {
			collection.insert(data, {safe: true }, function(err, result) {
				if (err) {
					console.log(err);
				} else {
					socket.emit('addnew_ack', result[0]);
				}
			});
		});
	});
	socket.on('update_score', function (data) {
		//console.log(data.user_id);
		var id = data.user_id;
		console.log(id);

		db.collection('users', function(err, collection) {
			collection.update({'_id':new BSON.ObjectID(id)}, {$inc:{rate : 5}} , {safe:true}, function(err, result) {
				if (err) {
					//res.send({'error':'An error has occurred'});
						console.log(err);
				} else {
					//console.log('' + result + ' document(s) updated');
					 collection.find({'_id':new BSON.ObjectID(id)}).toArray(function(err, items) {
						socket.emit('update',items[0]);
						//console.log(socket.emit('update',{items : items}));
					});
				}
			});
		});
	});

	socket.on('new',function(data){
		db.collection('users', function(err, collection) {
			collection.find().toArray(function(err, items) {
				//console.log(items);

				//socket.broadcast.emit('update',{items : items});
				socket.emit('update',{items : items});
			});
		});
	});

});