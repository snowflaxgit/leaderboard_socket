
/*
 * GET home page.
 */
// import database
var mongo = require('mongodb');

//create database server
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
//var io = require('socket.io').listen(server, { log: false });

// create cartdb Database
db = new Db('players_db', server);

// open database
db.open(function(err, db) {
    if(!err) {
        db.collection('users', {safe:true}, function(err, collection) {

           if (err) {
                console.log("The 'users' collection doesn't exist. Creating it with sample data..."+err);
                populateDB();
            }
			else{
				populateDB();
				console.log("The 'user' collection exists.. "+collection);

				collection.find().toArray(function(err, items) {
					 if(items.length == 0){
					  	populateDB();
					 	//console.log("Length-1:::"+items.length);
					 	//console.log(items);
					 }else{
					 	//console.log("Length-2:::"+items.length);
					 }
				});
			}
        });
    }
});

exports.list = function(req, res){

	db.collection('users', function(err, collection) {
		collection.find({}).sort({rate: -1}).limit(10).toArray(function(err, items) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.json(items);
		});
	});
};



/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
	console.log("call List....");

    var user = [
    {
		name: "Ada Lovelace",
		rate: 0,
		date:new Date()
	},
    {
		name: "Grace Hopper",
		rate: 0,
		date:new Date()
	},
    {
		name: "Marie Curie",
		rate: 0,
		date:new Date()
	},
    {
		name: "Claude Shannon",
		rate: 0,
		date:new Date()
	},
    {
		name: "Nikola Tesla",
		rate: 0,
		date:new Date()
	}
	];

    db.collection('users', function(err, collection) {

		collection.remove(); //remove database

		collection.insert(user, {safe:true}, function(err, result) {
			if(err){
				console.log(err);
			}
			else{
				//console.log(result);
			}
		});
    });

};