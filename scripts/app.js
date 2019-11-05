// ----------------INITIAL FUNCTIONS and CONFIGURATION----------------------------

// Defines variable app as an Angular module and inserts the ngRoute service. 
var app = angular.module("topApp", ["ngRoute"]);


// FUNCTION to initiate global/root variables, also check if the user is logged in using cookies
app.run(['$rootScope','cookies',function($rootScope, cookies) {
    $rootScope.visiblepageId = 0; // sets initial menu highlight to "News", unless another page is directly loaded
    $rootScope.userDetails={"username": "","title": "", "fname": "", "lname": "", "email": ""};
    $rootScope.loggedin = cookies.checkCookie(); // checks if user is logged in
    if($rootScope.loggedin == 1) cookies.getUserDetails(); // obtains user details
}]);


//CONFIG --  Configures the ngRouting of the app
app.config(function($routeProvider)
{
    $routeProvider
    .when("/",                  { templateUrl: "views/news.html",   controller: "newsCtrl" })
    .when("/create",            { templateUrl: "views/create.html", controller: "createCtrl"  })
    .when("/about",             { templateUrl: "views/about.html",  controller: "aboutCtrl"  })
    .when("/faq",               { templateUrl: "views/faq.html",    controller: "faqCtrl"  })
    .when("/login",             { templateUrl: "views/login.html",  controller: "loginCtrl"  })
    .when("/profile",           { templateUrl: "views/profile.html",  controller: "profileCtrl"  })
    .when("/register",          { templateUrl: "views/register.html",  controller: "registerCtrl"  })
    .otherwise(                 { template: "<h1>404 error</h1>"})
});


//FUNCTION -- Defines a function for obtaining the current date and time
function getTime(){
    var today = new Date();
    var minutes = today.getMinutes()<10 ? "0" + today.getMinutes() : today.getMinutes();
    var timestamp = today.getHours() + ":" + minutes  + " - " + today.getDate() + "/" + (today.getMonth()+1) + "/" + today.getFullYear(); 
    return timestamp;
};



//-----------------------CONTROLLERS--------------------------


//CONTROLLER -- Top Controller (calls the functions to load the initial data from MongoDB and faqs.json)
app.controller("topController",['$scope','newsFactory',function($scope, newsFactory)
{ 
    newsFactory.load();
    newsFactory.loadFaqs();

}]);

//CONTROLLER --  NavBar Controller (used to control inclusion of website content using ngRouting)
app.controller("navbarController",['$scope','$location',function($scope, $location)
{ 
    $scope.showPage = function(pageId)
    {
        switch (pageId) {
            case 0:
                $location.path("/")
                break
            case 1:
                $location.path("/create")
                break
            case 2:
                $location.path("/about")
                break
            case 3:
                $location.path("/faq")
                break
            case 4:
                $location.path("/login")
                break
            case 5:
                $location.path("/profile")
                 break
            case 6:
                $location.path("/register")
                break
        }
    };
}]);

//CONTROLLER --  News Template Controller (links News content to the Factory data)
app.controller("newsCtrl",['$scope','$rootScope','newsFactory',function($scope, $rootScope, newsFactory)
{ 
    // Specificies which NavBar button to highlight when this controller is called
    $rootScope.visiblepageId=0;
    // Binds the locally scoped newsArray variable to the Factory array
    // This allows ng-repeat in the html to loop through the factory array to display each news item
    $scope.newsArray = newsFactory.arr;
    $scope.deleteNews = function(index)
    {   
        newsFactory.delete(index);
    }; 

}]);

//CONTROLLER --  Create Template Controller (links Create methods to the Factory methods)
app.controller("createCtrl",['$scope','$rootScope','newsFactory',function($scope, $rootScope, newsFactory)
{ 
    // Specificies which NavBar button to highlight when this controller is called
    $rootScope.visiblepageId=1;
    $scope.postNews = function()
    {   
        var data = {"title": $scope.title,"author": $scope.author,"content": $scope.content,"tags": $scope.tags};
        newsFactory.add(data);
        $scope.title = "";
        $scope.author = "";
        $scope.content = "";
        $scope.tags = "";
    }; 
    $scope.dateTime = getTime();
}]);


//CONTROLLER --  About Controller (provides content for the About view)
app.controller("aboutCtrl",['$scope','$rootScope',function($scope, $rootScope)
{ 
    // Specificies which NavBar button to highlight when this controller is called
    $rootScope.visiblepageId=2;
    $scope.aboutHeader = "About";
    $scope.aboutContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ullamcorper neque eu quam viverra euismod. Nulla id libero vel orci porta laoreet et nec enim. Vestibulum eget mi sed urna porttitor blandit non eu tortor. Nunc metus est, placerat at risus eget, fermentum pretium odio. Proin ornare non elit id mattis. Curabitur eget finibus ligula. Ut ullamcorper sollicitudin est, id efficitur urna hendrerit nec. Vivamus a maximus lectus.<br /> Integer mi lacus, aliquam nec facilisis eu, eleifend placerat orci. Proin arcu quam, blandit in tortor ac, aliquam vehicula tellus. Praesent justo massa, posuere in feugiat et, laoreet quis turpis. Mauris quis velit pharetra, pharetra leo non, vehicula lectus. Morbi malesuada tellus ullamcorper felis condimentum pretium. In vulputate erat vitae egestas blandit. Donec ullamcorper varius mi vel interdum. Suspendisse hendrerit posuere aliquet. Vestibulum rutrum dapibus ultrices. Vestibulum semper lectus leo, at ultrices odio gravida ac. Vestibulum placerat odio nec placerat imperdiet. Sed nulla quam, viverra at ornare et, posuere fringilla nisi. Etiam pretium augue eros, sed posuere purus vehicula non. Donec et dolor a erat scelerisque auctor. Vestibulum at nibh lorem.<br />Aliquam suscipit lacus sed aliquet bibendum. Pellentesque vel neque sagittis, venenatis nisi ac, placerat augue. In ullamcorper, dui nec porttitor placerat, metus lacus gravida nibh, id sollicitudin diam ex in augue. Nulla bibendum ante ut turpis ultricies semper. Quisque ac malesuada libero. Etiam mattis sed nisi vitae vestibulum. Donec molestie posuere massa, in sollicitudin erat sagittis sit amet. Maecenas ante mauris, dapibus id tellus a, pellentesque tempus velit. Vestibulum semper odio aliquet orci lobortis scelerisque. Vestibulum vulputate finibus libero non sollicitudin. Morbi varius massa eu efficitur rutrum. Duis nisi ligula, sodales id diam at, porttitor elementum velit. Aliquam tempor a urna ac vehicula.";
}]);

//CONTROLLER --  FAQ Controller (provides content for some local scope variables and links to the FAQ array in the Factory service)
app.controller("faqCtrl",['$scope','$rootScope','newsFactory',function($scope, $rootScope, newsFactory)
{ 
    // Specificies which NavBar button to highlight when this controller is called
    $rootScope.visiblepageId=3;
    $scope.faqArray = newsFactory.faqArr;
    $scope.faqHeader = "FAQs - Frequently Asked Questions";
}]);

//CONTROLLER --  Login Controller (provides the functionality for the login page by linking to the function in the Factory service)
app.controller("loginCtrl",['$scope','$rootScope','newsFactory','cookies',function($scope,$rootScope,newsFactory,cookies)
{ 
    // Specificies which NavBar button to highlight when this controller is called
    $rootScope.visiblepageId=4;

    // Log-in function
    $scope.login = function()
    {  
        var details = {"username": $scope.username,"password": $scope.password};
        newsFactory.checkLogin(details);
        $scope.username = "";
        $scope.password = "";
    }; 
    // Log-out function
    $scope.logout = function()
    {   
        console.log("Log out successful")
        cookies.deleteCookies();
        $rootScope.loggedin = 0;
        $rootScope.userDetails = {}; // clear temporary storage
    }; 
}]);


//CONTROLLER --  Footer Controller (links Footer time data to the getTime function)
app.controller("footerController",function($scope)
{ 
    $scope.dateTime = getTime();
});




// ---------------------SERVICES / FACTORIES---------------------


// NEWSFACTORY -- This service holds the main arrays and functions that operate on them
// Also holds the AJAX HTTP<->server functions
app.factory("newsFactory", ['$http','$rootScope','cookies',function($http,$rootScope,cookies) 
{
    var newsContent = {};

    // instantiates an array for holding news items, and defines a function to add content to it
    newsContent.arr = [];

    // instantiates an array for holding FAQ items
    newsContent.faqArr = [];

    // AJAX - GET faqs from server (which gets it from faqs.json file) and save them in the factory faq array
    newsContent.loadFaqs = function()  
    {
        $http({
            method: "GET",
            url: "/getfaqs"
        }).then(function onSuccess(response)
        {
            console.log("Load initial faq items");
            var raw_data = angular.fromJson(response.data.arr)
            raw_data.forEach((item) => newsContent.faqArr.push(item));
        }, function onError(error)
        {
            console.log(error);
        });
    };


    // AJAX - GET news items from server (which gets it from mongoDB database) and save them in the factory news array
    // this only runs once on each page refresh; it doesn't rerun when switching tabs
    newsContent.load = function()  
    {
        $http({
            method: "GET",
            url: "/getnews"
        }).then(function onSuccess(response)
        {
            console.log("Load initial news items");
            var raw_data = angular.fromJson(response.data);  
            raw_data.forEach((item) => newsContent.arr.push(item));
        }, function onError(error)
        {
            console.log(error);
        });
    };  


    // AJAX - POST data to server (which sends it on to the MongoDB database)
    // this also adds the news item to the factory news array
    // this runs whenever you create a post and click "POST"
    newsContent.add = function(newsItem)
    {
        $http({
            method: "POST",
            url: "/writenews",
            data : newsItem,
            headers: {'Content-Type': 'application/json'}
        }).then(function onSuccess(response)
        {
            console.log("Created news item");
        }, function onError(error)
        {
            console.log(error);
        });
        newsContent.arr.push(newsItem);
    }


    // AJAX - sends DELETE data request to server (which sends it on to the MongoDB database)
    // this also deletes(splices) the news item from the factory news array
    // this runs whenever you click on the little "X" next to a news post
    newsContent.delete = function(index)
    {
        var id = newsContent.arr[index];
        $http({
            method: "DELETE",
            url: "/deletenews",
            data : id,
            headers: {'Content-Type': 'application/json'}
        }).then(function onSuccess(response)
        {
            console.log("Deleted news item");
        }, function onError(error)
        {
            console.log(error);
        });
        newsContent.arr.splice(index,1); //removes this element from the array
    }

    // AJAX - GET login verification from server (which gets it from an sqlite database), changes user status to logged-in and saves the user's details in $rootScope.userDetails
    newsContent.checkLogin = function(details)  
    {
        $http({
            method: "GET",
            url: "/checklogin",
            params: details
        }).then(function onSuccess(response)
        {
            console.log("Log in successful");
            $rootScope.loggedin = 1;
            $rootScope.userDetails = response.data;
            cookies.createCookies();

        }, function onError(error)
        {
            console.log(error);
        });
    };  

    return newsContent;
}]);



// COOKIE FACTORY - adapted from https://www.w3schools.com/js/js_cookies.asp
// These functions are stored in the "cookie" service, which needs to be injected into local controllers to use
app.factory("cookies", function($rootScope) 
{
    var cookieContent = {};

    // Gets the value of a cookie 
    cookieContent.getCookie = function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
    }
  
    // Checks if the "loggedin" cookie is yes or no
    cookieContent.checkCookie = function () { 
    var loggedin=cookieContent.getCookie("loggedin");
    if (loggedin == "yes") return 1; 
    else return 0;
    }

    // Creates a cookie from $rootScope.userDetails and specifies loggedin=yes
    cookieContent.createCookies = function (){
        var d = new Date();
        d.setTime(d.getTime() + (30*24*60*60*1000));  // set cookie to expire in 30 days (if not deleted)
        var expires = "expires=" + d.toGMTString();
        document.cookie = "loggedin=yes;" + expires + ";path=/";
        document.cookie = "user=" + $rootScope.userDetails.username + ";" + expires + ";path=/";
        document.cookie = "title=" + $rootScope.userDetails.title + ";" + expires + ";path=/";
        document.cookie = "fname=" + $rootScope.userDetails.fname + ";" + expires + ";path=/";
        document.cookie = "lname=" + $rootScope.userDetails.lname + ";" + expires + ";path=/";
        document.cookie = "email=" + $rootScope.userDetails.email + ";" + expires + ";path=/";
        console.log("created cookie: " + document.cookie);
    }

    // Deletes all cookies associated with localhost:3000 by setting the expiry date in the past
    cookieContent.deleteCookies = function (){
        document.cookie = "loggedin=no;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        document.cookie = "user='';expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        document.cookie = "title='';expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        document.cookie = "fname='';expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        document.cookie = "lname='';expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        document.cookie = "email='';expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        console.log("deleted cookie");
    }

    // Gets user details from the cookies and inserts them into $rootScope.userDetails
    cookieContent.getUserDetails = function () { 
        $rootScope.userDetails.username = cookieContent.getCookie("user");
        $rootScope.userDetails.title = cookieContent.getCookie("title"); 
        $rootScope.userDetails.fname = cookieContent.getCookie("fname"); 
        $rootScope.userDetails.lname = cookieContent.getCookie("lname"); 
        $rootScope.userDetails.email = cookieContent.getCookie("email"); 
    }

    // ALWAYS remember to have a return statement in a service!!!
    return cookieContent;
});
