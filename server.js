/*
Require calls for the server:
Express - the express server framework, handles POST and GET commands.
bodyparser - Handles object conversion of incoming data, converting JSON to JavaScript objects. 
MongoClient - Allows connecting to a remote MongoDB database
ObjectID - Allows creation of ID type objects for the MongoDB database
sqlite3 - Allows connecting to a local SQLite database
*/
const express = require('express');
const bodyParser = require('body-parser'); 
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;
const sqlite3 = require('sqlite3').verbose();


/*
This establishes the connection settings for the MongoDB Atlas remote database. 
Code from mongodb website.
*/
const CONNECTION_URL = "mongodb+srv://Mutator:9u9jXTp43eSQ8mHc@unidev-gnlpy.gcp.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "webDB";


/*
Content files:
Note - require does NOT dynamically update. It calls once at the start of operation. Dynamic updates would require a new operation.
faq - pre-saved faq items
*/
const faq = require('./json/faqs.json');


/*
Instance our express environment by calling its constructor and assinging to a variable.
*/
const app  = express();


/*
Define static and JSON operation. 
static - Tells express where to find usable files. Since the structure is simple it assigns root. This would be different if there were protected / inaccessible resources.
json - Tells express to use the bodyparser / JSON handler for GET and POST requests
urlencoded - Tells express to use bodyparser / URL ENCODED for GET and POST requests
*/
app.use(express.static("./"));
app.use(bodyParser.json());   
app.use(bodyParser.urlencoded({ extended:true }));

/*
Define some database variables to use in our CRUD operations
*/
var collection; // this will be the MongoDB collection that contains the database
var database; // this will be the MongoDB database
var sqldb; // this will be the SQLite database


/*
Sets the listen port for the server. Note that in this case the server watches port 3000, NOT port 8000. 
Also sets up the MongDB connection, so it can be used in CRUD operations.
Also sets up the SQLite connection, so it can be used in CRUD operations.
Mongo connect Code adapted from MongoDB website and https://www.thepolyglotdeveloper.com/2018/09/developing-restful-api-nodejs-mongodb-atlas/
SQLite connection code adapted from https://www.sqlitetutorial.net/sqlite-nodejs/connect/.
*/
app.listen(3000, function (){ 
    console.log("Listening on port 3000");

    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("news");
        console.log("Connected to '" + DATABASE_NAME + "'");
    });

    sqldb = new sqlite3.Database('./sql/users.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log("Connected to 'users.db'");
    });
});



// **** AJAX and CRUD Server<->Database operations ********
/*
Sets an AJAX GET route for root operation. When root route is accessed the index.html page is served. 
This way our index would not need to be in the root location it just happens that in this instance it is.
Note that in an express environment routes control our server side access. Provided files can access resources to send that are included in the static declaration above
*/
app.get("/", function(req, res) {
    res.sendFile("./index.html"); //index.html file of your angularjs application
});


/*
Sets an AJAX GET route for the /getfaqs route. This is the route called by Angular when using the $http service in the url (e.g. localhost:3000/getfaqs).
It returns the faqs.json content from the local server directory.
*/
app.get("/getfaqs", function(req, res) {
    //getJSON
    res.send(faq);
    console.log("Retrieved FAQs from server file 'faqs.json'")
});


/*
Sets an AJAX GET route for the /getnews route. This is the route called by Angular when using the $http service in the url (e.g. localhost:3000/getnews)
It connects to a MongoDB database and READS the whole news collections as a JSON array from the MongoDB database.
This array is then passed back to the browser through the response function. 
Code adapted from MongoDB website and https://www.thepolyglotdeveloper.com/2018/09/developing-restful-api-nodejs-mongodb-atlas/
There is currently no validation set up!!!
*/
app.get("/getnews", function(req, res) { 
    //read
    collection.find({}).toArray(function(err, result) {
        if(err) {
            return response.status(500).send(error);
        }
        console.log("Retrieved News items from MongoDB")
        res.send(result);
    });
});


/*
Sets an AJAX POST route for /writenews route. Called when an AJAX request is made by $http service in the url (e.g. localhost:3000/writenews). 
It connects to a MongoDB database and CREATES a news item.
Code adapted from the MongoDB website and https://www.thepolyglotdeveloper.com/2018/09/developing-restful-api-nodejs-mongodb-atlas/
There is currently no validation set up!!!
*/
app.post("/writenews", function(req, res) {
    //create
   collection.insertOne(req.body, function(err, result){
        if(err) {
            return res.status(500).send(error);
        } 
        console.log("Added news item to MongoDB")
        res.send(result.result);
    });
});


/*
Sets an AJAX POST route for /writenews route. Called when an AJAX request is made by $http service in the url (e.g. localhost:3000/writenews). 
It connects to a MongoDB database and DELETES a news item.
Code adapted from the MongoDB website and https://www.thepolyglotdeveloper.com/2018/09/developing-restful-api-nodejs-mongodb-atlas/
There is currently no validation set up!!!
*/
app.delete("/deletenews/", function(req, res) {
    //delete
    // Need to turn _id into a Mongo Object to be able to find it in the database
   collection.deleteOne({ "_id": new ObjectId(req.body._id)}, function(err, result){
        if(err) {
            return res.status(500).send(error);
        } 
        console.log("Deleted news item from MongoDB")
        res.send(result.result);
    });
});


/*
I didn't create an Update function for news items due to time constraints. Would need a whole new editing page, probably similar to the create page. 
*/


/*
Sets an AJAX GET route for the /checklogin route. This is the route called by Angular when using the $http service in the url (e.g. localhost:3000/checklogin)
It checks whether the username and password match in an sqlite database on the sever, and returns user details if found. 
Code adapated from https://www.sqlitetutorial.net/sqlite-nodejs/query/.
There is currently no validation set up!!!
*/
app.get("/checklogin", function(req, res) { 
    //read
    // Creates an sql query that we can insert into the get function below
    var sql = "SELECT * FROM Users WHERE username = ?"; 
    
    sqldb.get(sql, [req.query.username], function(err, row) {
        if(err) {
            console.error(err.message);
            return res.sendStatus(500).send(error);
        } 
        if(row.password.localeCompare(req.query.password)==0){
            console.log("Login successful - validated against sqlite database 'users.db'")
            var data = {"username": row.username,"title": row.title, "fname": row.fName, "lname": row.lName, "email": row.email};
            res.send(data);
        }
        else {
            return res.sendStatus(500).send("Incorrect password");
        } 
    });
});
