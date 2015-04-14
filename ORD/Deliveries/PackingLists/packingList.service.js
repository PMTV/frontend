
ORD.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/packingList', { templateUrl: 'ORD/Deliveries/PackingLists/packingList.html' })
        .when('/packingList/new', { templateUrl: 'ORD/Deliveries/PackingLists/PackingListEdit/packingListEdit.html',controller: 'PackingListEditCtrl' })
        .when('/packingList/:id', { templateUrl: 'ORD/Deliveries/PackingLists/PackingListEdit/packingListEdit.html',controller: 'PackingListEditCtrl' })
        .when('/packingList/:id/preview', { templateUrl: 'ORD/Deliveries/PackingLists/PackingListEdit/packingListPrint.html',controller: 'PackingListEditCtrl'});
}]);

var oDatatable;

// FACTORY
ORD.factory('packingListService', function ($http, $emerge) {

    return {
        query: function () {
            return $emerge.query("packingLists");
        },
        get: function(packingListId){

            return $emerge.get("packingLists", packingListId);
        },
        getPackingDefinition: function () 
        {
            return $emerge.query("PackingDefinitions");
        },
        getbySOID: function(salesOrderId)
        {
            return $emerge.get("SalesOrders", salesOrderId+"/Packinglist");
        },
        add: function (packingList) {
            // Exclude properties to update
            packingList.customer = null;
            angular.forEach(packingList.packingSectionDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
                // key.salesOrderDetailsComponentsList = null;
            });

            return $emerge.add("packingLists", packingList);
        },
        update: function (packingListId, packingList) {
            // Exclude properties to update
            packingList.customer = null;
            angular.forEach(packingList.packingSectionDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
            });

            return $emerge.update("packingList", packingListId, packingList);
        },
        delete: function (packingListId) {
            return $emerge.delete("packingList", packingListId);
        }
    };
});