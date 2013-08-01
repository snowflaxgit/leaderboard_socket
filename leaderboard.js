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

	var myReturn ;
	db.collection('users', function(err, collection) {
					collection.find().limit(10).sort( { rate: -1 } ).toArray(function(err, items) {
						myReturn = JSON.stringify(items);
						socket.send( myReturn );

					});
				})


	app.get('/',function(req, res){
		console.log("call index....");
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.render('index');
	});

	app.get('/list', routes.list);

	socket.on('addnew', function(data) {
		console.log("hello"+data.name);
		console.log(data);
		//data.length = 6;
	//	console.log(data);
		/*var myJs = JSON.parse(data);
		console.log(myJs);*/
		db.collection('users', function(err, collection) {
			var resLength;
			collection.find().count( function(err, res) {
				if (err) {
					console.log('error: '+err);
				} else {
					//socket.emit('addnew_ack', result[0]);
					data.length = res;
					collection.insert(data, {safe: true }, function(err, result) {
						if (err) {
							console.log('error: '+err);
						} else {
							//socket.emit('addnew_ack', result[0]);
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
					//res.send({'error':'An error has occurred'});
						console.log(err);
				} else {
					//console.log('' + result + ' document(s) updated');
					 collection.find({'_id':new BSON.ObjectID(id)}).toArray(function(err, items) {
						//socket.emit('update',items[0]);
						io.sockets.emit('update_score_ack',items[0]);
						//console.log(socket.emit('update',{items : items}));
					});
					 if(sortBy == "score"){
						 collection.find().limit(10).sort( { rate: -1 } ).toArray(function(err, items) {
							//socket.emit('update',items[0]);
							io.sockets.emit('update_score_ack',items);
							//console.log(socket.emit('update',{items : items}));
						});
					}
					else if(sortBy == "update"){
						 collection.find().limit(10).sort( { length: -1 } ).toArray(function(err, items) {
							//socket.emit('update',items[0]);
							io.sockets.emit('update_score_ack',items);
							//console.log(socket.emit('update',{items : items}));
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


	socket.on('new',function(data){
		 sortBy =  data;

		console.log("HERE is ........."+sortBy);
			switch(sortBy){
				case "score":
				console.log("score....Runs");
				db.collection('users', function(err, collection) {
					collection.find().limit(10).sort( { rate: -1 } ).toArray(function(err, items) {
						//console.log(items);
						//socket.broadcast.emit('update',{items : items});
						socket.emit('update',{items : items});
					});
				});
				break;

				case "update":
				console.log("update....Runs");
				db.collection('users', function(err, collection) {
					collection.find().limit(10).sort( { length: -1 } ).toArray(function(err, items) {
						//console.log(items);
						//socket.broadcast.emit('update',{items : items});
						socket.emit('update',{items : items});
					});
				});
				break;

				default:
				console.log("default....Runs");
				db.collection('users', function(err, collection) {
					collection.find().toArray(function(err, items) {
						//console.log(items);
						//socket.broadcast.emit('update',{items : items});
						socket.emit('update',{items : items});
					});
				})


			}


	});

});