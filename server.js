/*
Require calls for the server
Express - the express server framework, handles POST and GET commands.
FS - file system module. Allows for direct disk writing
path - Allows for handling of common directory structure
bodyparser - Handles object conversion of incoming data, converting JSON to JavaScript objects. 
mongdb - All connecting to a remote MongoDB server
*/
const express = require('express');
const fs = require('fs');
//var path = require('path');  // Don't use these, DELETE
const bodyParser = require('body-parser'); // Don't use these, ??
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;


/*
This establishes the connection settings for MongoDB Atlas remote database and saves them in "client".
Code from MongoDB website.
*/
const CONNECTION_URL = "mongodb+srv://Mutator:9u9jXTp43eSQ8mHc@unidev-gnlpy.gcp.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "webDB";


/*
Content files
Note - require does NOT dynamically update. It calls once at the start of operation. Dynamic updates would
require a new operation
faq - pre-saved faq items
*/
var faq = require('./faqs.json');


/*
Instance our express environment by calling its constructor and assinging to a variable
*/
var app  = express();


/*
Define static and JSON operation. 
static - Tells express where to find usable files. Since the structure is simple it assigns root. This would be different if there were protected / inaccessible resources.
json - Tells express to use the JSON handler / bodyparser for requests
*/
app.use(express.static("./"));
app.use(bodyParser.json());   
app.use(bodyParser.urlencoded({ extended:true }));

/*
Define some database variables to use in our CRUD operations
*/
var database; 
var collection;


/*
Sets the listen port for the server. Note that in this case the server watches port 3000, NOT port 8000. 
Also sets up the MongDB connection, so it can be used in all the CRUD operations.
*/
app.listen(3000, function (){ 
    console.log("Listening on port 3000");
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("news");
        console.log("Connected to `" + DATABASE_NAME + "`!");
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
        res.send(result.result);
    });

   // handlePost(req, res); Don't use this anymore
});


/*
Sets an AJAX POST route for /writenews route. Called when an AJAX request is made by $http service in the url (e.g. localhost:3000/writenews). 
It connects to a MongoDB database and DELETES a news item.
Code adapted from the MongoDB website and https://www.thepolyglotdeveloper.com/2018/09/developing-restful-api-nodejs-mongodb-atlas/
There is currently no validation set up!!!
*/
app.delete("/deletenews/", function(req, res) {
    //delete
   collection.deleteOne({ "_id": new ObjectId(req.body._id)}, function(err, result){
        if(err) {
            return res.status(500).send(error);
        } 
        res.send(result.result);
    });
});

/*
I didn't create an Update function for news items due to time constraints. Would need a whole new editing page, probably similar to the create page. 
*/

/*
THIS METHOD IS NO LONGER USED - kept as an example for saving and retreiving from server directory files
Method to take the POST data, add it to the json file and rewrite it.
IMPORTANT: This is not a good way to store data, but is being used to avoid setting up database management. 

function handlePost(req, res){
    var data = fs.readFileSync('./default_news.json');
    var json = JSON.parse(data);
    var nd = req.body;
    console.log("Request Object...");
    console.log(req.body);
    json.arr.push(nd)
    console.log("Rebuild...");
    console.log(json);
    dn = json;
    fs.writeFile('./default_news.json', JSON.stringify(json), (err) => {
        if (err) throw err;
        console.log("New JSON saved");
    });
}

*/