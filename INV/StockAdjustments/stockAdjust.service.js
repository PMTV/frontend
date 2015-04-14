
INV.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/stockAdjusts', { templateUrl: 'INV/StockAdjustments/stockAdjust.html' })
        .when('/stockAdjusts/new', { templateUrl: 'INV/StockAdjustments/stockAdjustEdit/stockAdjustEdit.html' })
        .when('/stockAdjusts/:id', { templateUrl: 'INV/StockAdjustments/stockAdjustEdit/stockAdjustEdit.html' });
}]);

var stockAdjustDatatable;

// FACTORY
INV.factory('stockAdjustService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("stockAdjustments");
        },
        get: function(stockAdjustId){
            return $emerge.get("stockAdjustments", stockAdjustId);
        },
        add: function (stockAdjust) {
            // Exclude properties to update
            stockAdjust.supplier = null;
            

            return $emerge.add("stockAdjustments", stockAdjust);
        },
        put: function (stockAdjustId, stockAdjust) {
            // Exclude properties to update
            stockAdjust.supplier = null;
           
            return $emerge.update("stockAdjustments", stockAdjustId, stockAdjust);
        },
        delete: function (stockAdjustId) {
            return $emerge.delete("stockAdjustments" + stockAdjustId);
        },
        getUrl: function () {
            return $emerge.getUrl("stockAdjustments");
        }
        // getStock: function () {
        //     return $emerge.query("StockTakes/1/GetStock");
        // }
    };
});