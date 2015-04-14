

ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/discount-period', { templateUrl: 'ECM/DiscountPeriod/discountPeriod.html', controller: 'DiscountPeriodCtrl' })
}]);


ECM.factory('discountPeriodService', function ($rootScope, $http, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var DiscountPeriodBaseService = {
        getDiscountFor24H: function () {
            return $emerge.query('ecm/DiscountFor24H');
        },
        updateDiscountFor24H: function (id, data) {
            return $emerge.update('ecm/DiscountFor24H', id, data);
        }
    };

    return DiscountPeriodBaseService;
});
