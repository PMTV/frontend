
INV.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/stockTakes', { templateUrl: 'INV/StockTakes/stockTake.html' })
        .when('/stockTakes/new', { templateUrl: 'INV/StockTakes/StockTakeEdit/stockTakeEdit.html' })
        .when('/stockTakes/:id', { templateUrl: 'INV/StockTakes/StockTakeEdit/stockTakeEdit.html' });
}]);

var stocksDatatable;

INV.service('sharedStockService', function() {

    var stockList;

    return {
        
        putStock: function(stock)
        {
            stockList = stock;
            console.log(stockList);
        },
        toggleSelection: function(productId)
        {
            console.log(productId);
        },
        removeStock: function(productId)
        {

        },
        retrieveStock: function()
        {
            // alert(angular.toJson(imagesData));
            return stockList;
        }

    }
});

// FACTORY
INV.factory('stockService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("StockTakes");
        },
        get: function(stockId){
            return $emerge.get("StockTakes", stockId);
        },
        add: function (stock) {
            // Exclude properties to update
            stock.supplier = null;

            return $emerge.add("StockTakes", stock);
        },
        put: function (stockId, stock) {
            // Exclude properties to update
            stock.supplier = null;
           
            return $emerge.update("StockTakes", stockId, stock);
        },
        delete: function (stockId) {
            return $emerge.delete("StockTakes" ,stockId);
        },
        getUrl: function () {
            return $emerge.getUrl("StockTakes");
        },
        queryStock: function (q, step, page, sort, asc, options) {
             var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc,
                // includeInactiveUser: 'false'
            }
            return $emerge.query("StockTakes/1/GetStock", params, options);
        }
    };
});