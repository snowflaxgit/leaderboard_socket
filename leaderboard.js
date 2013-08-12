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
						console.log(myReturn);

					});
				collection.find().limit(10).sort( { rate: -1 } ).toArray(function(err, items) {
					collection.find().limit(10).sort( { length: -1 } ).toArray(function(err, itemsUpdate) {
						 	server_code_emmit('clientOn',{option:"scoreSort",values:{score:items,update:itemsUpdate}});
						});
					});
				})
	
	
	app.get('/',function(req, res){
		console.log("call index....");
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.render('index');
	});

	app.get('/list', routes.list);

	/////********************** USER Define Socket *************************/////

	socket.on('serverOn',function(data){
		db.collection('users', function(err, collection) {	 
			var socketOnSwitch = data.option;
			switch(socketOnSwitch){
				/*case "score":
					sortBy =  data.option;
					console.log("score....Runs");
					
						collection.find().limit(10).sort( { rate: -1 } ).toArray(function(err, items) {
							server_code_emmit('update',{items : items});
						});
				break;

				case "update":
					sortBy =  data.option;
					console.log("update....Runs");
					collection.find().limit(10).sort( { length: -1 } ).toArray(function(err, items) {
							server_code_emmit('update',{items : items});
						});
					break;
*/
				case "update_score":
				
					var id = data.values.user_id;

					collection.update({'_id':new BSON.ObjectID(id)}, {$inc:{rate : 5}} , {safe:true}, function(err, result) {
							if (err) {
								console.log(err);
							} else {
								collection.find({'_id':new BSON.ObjectID(id)}).toArray(function(err, items) {
									server_code_emmit('clientOn',{option:"update_score_ack",values:items[0]});
								});
								 if(sortBy == "score"){
								 	collection.find().limit(10).sort( { rate: -1 } ).toArray(function(err, items) {
									 	collection.find().limit(10).sort( { length: -1 } ).toArray(function(err, itemsUpdate) {
										 	server_code_emmit('clientOn',{option:"scoreSort",values:{score:items,update:itemsUpdate}});
										});
									});
								}
								
							}
						});
				break;

				case "addnew":
					var resLength;
						collection.find().count( function(err, res) {
							if (err) {
								console.log('error: '+err);
							} else {
								data.values.length = res;
								collection.insert(data.values, {safe: true }, function(err, result) {
									if (err) {
										console.log('error: '+err);
									} else {
										server_code_emmit('clientOn',{option:"addnew_ack",values:result[0]});
									}
								});
							}
						});
						
				break;

				default:
					console.log("default....Runs");
					collection.find().toArray(function(err, items) {
							server_code_emmit('update',{items : items});
						});
				
				break;

					
			}
		});

		
	});

});
///////**************Socket emmit ****************///////
function server_code_emmit(option,data){
	io.sockets.emit(option,data);
}