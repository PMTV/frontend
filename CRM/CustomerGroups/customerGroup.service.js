CRM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/customerGroups', { templateUrl: 'CRM/CustomerGroups/customerGroup.html' })
}]);

CRM.factory('customerGroupService', function ($rootScope, $http, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var CustomerGroupServiceBase = {

        query: function () {
            return $emerge.query("customergroups");
        },
        add: function (data) {
            return $emerge.add("customergroups", data);
        },
        update: function (id, data) {
            return $emerge.update("customergroups", id, data)
        },
        delete: function (id) {
            return $emerge.delete("customergroups", id);
        }

    }

    return CustomerGroupServiceBase;
});
