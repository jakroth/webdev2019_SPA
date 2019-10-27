var app = angular.module("topApp", ["ngRoute"]);


// FACTORY -- This service holds the main array and the functions that operate on it
// Also holds the AJAX<->server functions
app.factory("newsFactory", function($http)
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
            console.log("Load news items");
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
            console.log("Added item to mongoDB database");
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
            console.log("Deleted item from mongoDB database");
        }, function onError(error)
        {
            console.log(error);
        });
        newsContent.arr.splice(index,1);
    }


    return newsContent;
});

//CONTROLLER -- Top Controller (just calls the function to load the initial data from default_news.json)
app.controller("topController",['$scope','newsFactory',function($scope, newsFactory)
{ 
    newsFactory.load();
    newsFactory.loadFaqs();

}]);

//CONTROLLER --  NavBar Controller (used to control inclusion of website content using ngRouting)
app.controller("navbarController",function($scope, $location)
{ 
    $scope.visiblePageId = 0;
    $scope.showPage = function(pageId)
    {
        $scope.visiblePageId = pageId;
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
        }
    };
});

//CONTROLLER --  News Template Controller (links News content to the Factory data)
app.controller("newsCtrl",['$scope','newsFactory',function($scope, newsFactory)
{ 
    // Binds the locally scoped newsArray variable to the Factory array
    // This allows ng-repeat in the html to loop through the factory array to display each news item
    $scope.newsArray = newsFactory.arr;
    $scope.deleteNews = function(index)
    {   
        newsFactory.delete(index);
    }; 
}]);

//CONTROLLER --  Create Template Controller (links Create methods to the Factory methods)
app.controller("createCtrl",['$scope','newsFactory',function($scope, newsFactory)
{ 
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


//CONTROLLER --  About Template Controller (provides content for some local scope variables and links to Factory data)
app.controller("aboutCtrl",['$scope','newsFactory',function($scope, newsFactory)
{ 
    $scope.aboutHeader = "About";
    $scope.aboutContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ullamcorper neque eu quam viverra euismod. Nulla id libero vel orci porta laoreet et nec enim. Vestibulum eget mi sed urna porttitor blandit non eu tortor. Nunc metus est, placerat at risus eget, fermentum pretium odio. Proin ornare non elit id mattis. Curabitur eget finibus ligula. Ut ullamcorper sollicitudin est, id efficitur urna hendrerit nec. Vivamus a maximus lectus.<br /> Integer mi lacus, aliquam nec facilisis eu, eleifend placerat orci. Proin arcu quam, blandit in tortor ac, aliquam vehicula tellus. Praesent justo massa, posuere in feugiat et, laoreet quis turpis. Mauris quis velit pharetra, pharetra leo non, vehicula lectus. Morbi malesuada tellus ullamcorper felis condimentum pretium. In vulputate erat vitae egestas blandit. Donec ullamcorper varius mi vel interdum. Suspendisse hendrerit posuere aliquet. Vestibulum rutrum dapibus ultrices. Vestibulum semper lectus leo, at ultrices odio gravida ac. Vestibulum placerat odio nec placerat imperdiet. Sed nulla quam, viverra at ornare et, posuere fringilla nisi. Etiam pretium augue eros, sed posuere purus vehicula non. Donec et dolor a erat scelerisque auctor. Vestibulum at nibh lorem.<br />Aliquam suscipit lacus sed aliquet bibendum. Pellentesque vel neque sagittis, venenatis nisi ac, placerat augue. In ullamcorper, dui nec porttitor placerat, metus lacus gravida nibh, id sollicitudin diam ex in augue. Nulla bibendum ante ut turpis ultricies semper. Quisque ac malesuada libero. Etiam mattis sed nisi vitae vestibulum. Donec molestie posuere massa, in sollicitudin erat sagittis sit amet. Maecenas ante mauris, dapibus id tellus a, pellentesque tempus velit. Vestibulum semper odio aliquet orci lobortis scelerisque. Vestibulum vulputate finibus libero non sollicitudin. Morbi varius massa eu efficitur rutrum. Duis nisi ligula, sodales id diam at, porttitor elementum velit. Aliquam tempor a urna ac vehicula.";
}]);

//CONTROLLER --  FAQ Template Controller (provides content for some local scope variables and links to Factory data)
app.controller("faqCtrl",['$scope','newsFactory',function($scope, newsFactory)
{ 
    $scope.faqArray = newsFactory.faqArr;
    $scope.faqHeader = "FAQs - Frequently Asked Questions";
}]);

//CONTROLLER --  Login Template Controller (links Login content to the Factory data)
app.controller("loginCtrl",['$scope','newsFactory',function($scope, newsFactory)
{ 
}]);


//CONTROLLER --  Footer Template Controller (links Footer time data to the Factory time)
app.controller("footerController",['$scope','newsFactory',function($scope, newsFactory)
{ 
    $scope.dateTime = getTime();
}]);


//CONFIG --  Configures the ngRouting of the app
app.config(function($routeProvider)
{
    $routeProvider
    .when("/",          { templateUrl: "views/news.html",   controller: "newsCtrl" })
    .when("/create",    { templateUrl: "views/create.html", controller: "createCtrl"  })
    .when("/about",     { templateUrl: "views/about.html",  controller: "aboutCtrl"  })
    .when("/faq",       { templateUrl: "views/faq.html",    controller: "faqCtrl"  })
    .when("/login",     { templateUrl: "views/login.html",  controller: "loginCtrl"  })
    .otherwise(         { template: "<h1>404 error</h1>"})
});

//FUNCTION -- Defines a function for obtaining the current date and time
function getTime(){
    var today = new Date();
    var minutes = today.getMinutes()<10 ? "0" + today.getMinutes() : today.getMinutes();
    var timestamp = today.getHours() + ":" + minutes  + " - " + today.getDate() + "/" + (today.getMonth()+1) + "/" + today.getFullYear(); 
    return timestamp;
};
