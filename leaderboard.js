/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();
var sortBy = "score";
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

	db.collection('users', function(err, collection) {
		collection .find() .limit(10) .sort({rate: -1 }) .toArray(function(err, items) {
			if (!err) {
				socket.emit('connect', items);
			}
		});
	})


	app.get('/', function(req, res) {
		console.log("call index....");
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.render('index');
	});
	app.get('/list', routes.list);

	socket.on('addnew', function(data) {
		console.log(data);

		db.collection('users', function(err, collection) {
			var resLength;
			collection.find().count( function(err, res) {
				if (err) {
					console.log('error: '+err);
				} else {
					data.length = res;
					collection.insert(data, {safe: true }, function(err, result) {
						if (err) {
							console.log('error: '+err);
						} else {
							io.sockets.emit('addnew_ack',result[0]);
						}
					});
				}
			});

		});
	});

	socket.on('update_score', function (data) {
		//console.log(data.user_id);
		var id = data.user_id;

		db.collection('users', function(err, collection) {
			collection.update({'_id':new BSON.ObjectID(id)}, {$inc:{rate : 5}} , {safe:true}, function(err, result) {
				if (err) {
					console.log(err);
				} else {
					 collection.find({'_id':new BSON.ObjectID(id)}).toArray(function(err, items) {
						io.sockets.emit('update_score_ack',items[0]);
					});
					 if(sortBy == "score"){
						 collection.find().limit(10).sort( { rate: -1 } ).toArray(function(err, items) {
							io.sockets.emit('update_score_ack',items);
						});
					}
					else if(sortBy == "update"){
						 collection.find().limit(10).sort( { length: -1 } ).toArray(function(err, items) {
							io.sockets.emit('update_score_ack',items);
						});
					}
				}
			});
		});
	});

	socket.on('delete_single', function(data){
		var id = data;
		db.collection('users', function(err, collection){
			collection.remove({'_id':new BSON.ObjectID(id)}, function(err, result){
				if(err){
					console.log('error: '+err);
				} else{
					//socket.emit('delete_single_ack', id);
					io.sockets.emit('delete_single_ack', id);
				}
			});
		});
	});


	socket.on('doSend',function(data){
		sortBy =  data;

		switch(sortBy){
			case "score":
			console.log("score....Runs");
			db.collection('users', function(err, collection) {
				collection.find().limit(10).sort( { rate: -1 } ).toArray(function(err, items) {
					socket.emit('doSend_ack',items);
				});
			});
			break;

			case "update":
			console.log("update....Runs");
			db.collection('users', function(err, collection) {
				collection.find().limit(10).sort( { length: -1 } ).toArray(function(err, items) {
					socket.emit('update',{items : items});
				});
			});
			break;

			default:
			console.log("default....Runs");
			db.collection('users', function(err, collection) {
				collection.find().toArray(function(err, items) {
					socket.emit('update',{items : items});
				});
			})
		}


	});

});