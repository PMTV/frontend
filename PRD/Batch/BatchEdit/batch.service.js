PRD.factory("productBatchService", function ($http, $rootScope, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    //var dataSvc = $emerge.dataService();
    return {

    }
});

//PRD.run(['productService', '$emerge', '$log', function (productService, $emerge, $log) {
//    angular.extend(productService, {
//        query: function () {
//            alert("asd");
//        },

//        // extend new method
//        test: function () {
//            alert("asdaa");
//        },

//        // this will override the getUrl base method
//        getUrl: function () {
//            $log.log("This method has been overriden");
//            return $emerge.getUrl("products");
//        }
//    })
//}]);