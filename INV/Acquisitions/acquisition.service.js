var INV = angular.module('INV', []);

INV.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/acquisitions', { templateUrl: 'INV/acquisitions/acquisition.html' })
        .when('/acquisitions/new', { templateUrl: 'INV/acquisitions/acquisitionEdit/acquisitionEdit.html' })
        .when('/acquisitions/:id', { templateUrl: 'INV/acquisitions/acquisitionEdit/acquisitionEdit.html' });
}]);

var oDatatable;

// FACTORY
INV.factory('acquisitionService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("inventory");
        },
        get: function(acquisitionId){
            return $emerge.get("inventory", acquisitionId);
        },
        add: function (acquisition) {
            // Exclude properties to update
            acquisition.supplier = null;
            angular.forEach(acquisition.inventoryAcquisitionsDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
            });

            return $emerge.add("inventory", acquisition);
        },
        put: function (acquisitionId, acquisition) {
            // Exclude properties to update
            acquisition.supplier = null;
            acquisition.warehouse = null;
            angular.forEach(acquisition.inventoryAcquisitionsDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
                key.purchaseOrderDetails = null;
            });

            return $emerge.update("inventory", acquisitionId, acquisition);
        },
        delete: function (acquisitionId) {
            return $emerge.delete("inventory", acquisitionId);
        },
        deleteItem: function (acquisitionId, AcquisitionDetailsId) {
            return $emerge.delete("inventory", acquisitionId + '/Item?InventoryAcquisitionsDetailsId=' + AcquisitionDetailsId);
        },
        queryWarehouses: function () {
            return $emerge.query("warehouses");
        },
        queryWarehouseSections: function () {
            return $emerge.query("warehouses");
        },
        getUrl: function () {
            return $emerge.getUrl("inventory");
        }
    };
});