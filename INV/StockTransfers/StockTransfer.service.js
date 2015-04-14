
INV.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/stockTransfers', { templateUrl: 'INV/StockTransfers/stockTransfer.html' })
        .when('/stockTransfers/new', { templateUrl: 'INV/StockTransfers/stockTransferEdit/stockTransferEdit.html' })
        .when('/stockTransfers/:id', { templateUrl: 'INV/StockTransfers/stockTransferEdit/stockTransferEdit.html' });
}]);

var stockTransferDatatable;

// FACTORY
INV.factory('stockTransferService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("StockTransfers");
        },
        get: function(stockTransferId){
            return $emerge.get("StockTransfers", stockTransferId);
        },
        add: function (stockTransfer) {
            // Exclude properties to update
            stockTransfer.supplier = null;
            

            return $emerge.add("StockTransfers", stockTransfer);
        },
        put: function (stockTransferId, stockTransfer) {
            // Exclude properties to update
            stockTransfer.supplier = null;
           
            return $emerge.update("StockTransfers", stockTransferId, stockTransfer);
        },
        delete: function (stockTransferId) {
            return $emerge.delete("StockTransfers" + stockTransferId);
        },
        getUrl: function () {
            return $emerge.getUrl("StockTransfers");
        }
        // getStock: function () {
        //     return $emerge.query("StockTakes/1/GetStock");
        // }
    };
});