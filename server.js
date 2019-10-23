/*
Require calls for the server
Express - the express server framework, handles POST and GET commands.
FS - file system module. Allows for direct disk writing
path - Allows for handling of common directory structure
bodyparser - Handles object conversion of incoming data, converting JSON to JavaScript objects. 
*/
var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser')

/*
The "database" file. In a proper implementation this would not be used.
Note - require does NOT dynamically update. It calls once at the start of operation. Dynamic updates would
require a new operation
*/
var dn = require('./default_news.json');


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