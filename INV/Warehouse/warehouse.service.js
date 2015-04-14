
INV.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/warehouse', { templateUrl: 'INV/Warehouse/warehouse.html' })
        .when('/warehouse/new', { templateUrl: 'INV/Warehouse/WarehouseEdit/warehouseEdit.html' })
        .when('/warehouse/:id', { templateUrl: 'INV/Warehouse/WarehouseEdit/warehouseEdit.html' });
}]);

//INV.factory('warehouseService', function ($rootScope, $http, $emerge, promiseTracker) {
//    $rootScope.tracker = promiseTracker('globalTracker', {
//        minDuration: 1000 //add this so we can actually see it come up
//    });

//    var WarehouseServiceBase = {

//        query: function () {
//            return $emerge.query("ecm/TimeSlot/GetAllTimeSlot");
//        }

//    }

//    return WarehouseServiceBase;
//});