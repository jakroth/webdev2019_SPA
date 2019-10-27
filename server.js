/*
Require calls for the server
Express - the express server framework, handles POST and GET commands.
FS - file system module. Allows for direct disk writing
path - Allows for handling of common directory structure
bodyparser - Handles object conversion of incoming data, converting JSON to JavaScript objects. 
mongdb - All connecting to a remote MongoDB server
*/
var express = require('express');
var fs = require('fs');
//var path = require('path');  // Don't use these, DELETE
//var bodyParser = require('body-parser'); // Don't use these, DELETE
const MongoClient = require('mongodb').MongoClient;


/*
Content files
Note - require does NOT dynamically update. It calls once at the start of operation. Dynamic updates would
require a new operation
dn - pre-saved news items
faq - pre-saved faq items
*/
//var dn = require('./default_news.json');  -- don't need this anymore, DELETE
var faq = require('./faqs.json');


/*
The MongoDB database connection. 
*/
MongoClient.connect("mongodb+srv://Mutator:9u9jXTp43eSQ8mHc@unidev-gnlpy.gcp.mongodb.net/test?retryWrites=true&w=majority", function(err, client) {
    if (err) throw err

    var db = client.db('webDB')
});


/*
Initial CRUD operations


*/



/*
Instance our express environment by calling its constructor and assinging to a variable
*/
var app  = express();


/*
Define static and JSON operation. Tells express where to find usable files. Since the structure is simple it assigns root. 
This would be different if there were protected / inaccessible resources.

Tells express to use the JSON handler / bodyparser for requests
*/
app.use(express.static("./"));
app.use(express.json());   


/*
Sets an AJAX route for root operation. When root route is accessed the index.html page is served. This way our index would not need to be in the root location
it just happens that in this instance it is.
Note that in an express environment routes control our server side access. Provided files can access resources to send that are included in the static declaration above
*/
app.get("/", function(req, res) {
    res.sendFile("./index.html"); //index.html file of your angularjs application
});


/*
Sets an AJAX GET route for the /getnews route. This is the route called by Angular when using the $http service in the url (e.g. localhost:3000/getnews)
It returns the default_news.json contents to the request
*/
app.get("/getnews", function(req, res) {
    //getJSON
    res.send(dn);
});


/*
Sets an AJAX GET route for the /getfaqs route. This is the route called by Angular when using the $http service in the url (e.g. localhost:3000/getfaqs)
It returns the faqs.json contents to the request
*/
app.get("/getfaqs", function(req, res) {
    //getJSON
    db.collection('news').find().toArray(function (err, result) {
        if (err) throw err
        console.log(result)
    })

    res.send(result);
});


/*
Sets an AJAX POST route for /writenews route. Called when an AJAX request is made by $http service and executes the handlePost() function on the request
*/
app.post("/writenews", function(req, res) {
    //write
    handlePost(req, res);
});


/*
Sets the listen port for the server. Note that in this case the server watches port 3000, NOT port 8000
*/
app.listen(3000, function (){ 
    console.log("Listening on port 3000");
});


/*
Method to take the POST data, add it to the json file and rewrite it.
IMPORTANT: This is not a good way to store data, but is being used to avoid setting up database management. 
*/
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