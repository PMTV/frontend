var ECM = angular.module('ECM', ['ngEmerge', 'ajoslin.promise-tracker']);

ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/payments', { templateUrl: 'ECM/Payments/payments.html' })
}]);


ECM.factory('ecmService', function ($rootScope, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var ECMServiceBase = {

        getCoupon: function (id) {
            return $emerge.get('ecm/coupon', id);
        },

        getTimeSlot: function (id) {
            return $emerge.get('ecm/timeslot', id);
        }

    }

    return ECMServiceBase;
});


ECM.factory('paymentsService', function ($rootScope, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var PaymentsServiceBase = {

        query: function (q, step, page, customerId, paymentStatus, dateFrom, dateTo) {
            return $emerge.query("ecm/payment" + "?q=" + (q || "") + (step ? "&step=" + step : "") + (page ? "&page=" + page : "") + (customerId ? "&customerId=" + customerId : "") + (paymentStatus ? "&status=" + paymentStatus : "") + (dateFrom ? "&dateFrom=" + dateFrom : "") + (dateTo ? "&dateTo=" + dateTo : ""));
        },


        get: function (id) {
            return $emerge.get('ecm/payment', id);
        },


        queryCustomer: function (q, step, page) {
            return $emerge.query('customers' + (q ? "?q=" + q : "") + (step ? "&step=" + step : "") + (page ? "&page=" + page : ""));
        }


    }

    return PaymentsServiceBase;
});