var PUR = angular.module('PUR', []);

PUR.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/purchases', { templateUrl: 'PUR/purchases/purchase.html' })
        .when('/purchases/new', { templateUrl: 'PUR/purchases/purchaseEdit/purchaseEdit.html' })
        .when('/purchases/:id', { templateUrl: 'PUR/purchases/purchaseEdit/purchaseEdit.html' });
}]);

var oDatatable;


PUR.factory('FireRef', function ($emerge){

});

// FACTORY
PUR.factory('purchaseService', function ($rootScope, $http, $emerge, promiseTracker,$firebase) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function (q, step, page, sort, asc, options) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort
//                sortDirection: 'asc'
            };

            return $emerge.query("purchaseOrders", params, options);
        },
        get: function (purchaseId, options) {
            return $emerge.get("purchaseOrders", purchaseId, options);
        },
        add: function (purchase) {
            // Exclude properties to update
            purchase.supplier = null;
            angular.forEach(purchase.purchaseOrderDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
            });

            return $emerge.add("purchaseOrders", purchase);
        },
        put: function (purchaseId, purchase) {
            // Exclude properties to update
            purchase.supplier = null;
            angular.forEach(purchase.purchaseOrderDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
                key.inventoryAcquisitionsDetailsList = null;
            });

            return $emerge.update("purchaseOrders", purchaseId, purchase);
        },
        convert: function (purchaseId) {
            // Exclude properties to update
            // purchase.supplier = null;
            // angular.forEach(purchase.purchaseOrderDetailsList, function (key, value) {
            //     key.product = null;
            //     key.productUOM = null;
            //     key.productUOMId = key.productUOMId || null;
            //     key.inventoryAcquisitionsDetailsList = null;
            // });

            return $emerge.update("purchaseOrders", purchaseId+"/convertToAcquisition");
        },
        delete: function (purchaseId) {
            return $emerge.delete("purchaseOrders", purchaseId);
        },
        deleteItem: function (purchaseId, PurchaseOrderDetailsId) {
            return $emerge.delete("purchaseOrders", purchaseId + '/Item?PurchaseOrderDetailsId=' + PurchaseOrderDetailsId);
        },
        approve: function (purchaseId) {
            return $emerge.update("purchaseOrders", purchaseId + "/Approve");
        },
        sendApproval: function (purchaseId) {
            return $emerge.update("purchaseOrders", purchaseId + "/SendApproval");
        },

        duplicate: function (purchaseId) {
            return $emerge.update("purchaseOrders", purchaseId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("purchaseOrders");
        },
        getPDF: function (quotationId) {
            return $emerge.get("purchaseOrders", quotationId + "/pdf", { responseType: 'arraybuffer', tracker: 'null' });
        },
        emailPDF: function (quotationId, email) {
            return $emerge.post("purchaseOrders/" + quotationId + "/email", email);
        }
    };
});