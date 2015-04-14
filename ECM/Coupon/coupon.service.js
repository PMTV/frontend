
ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/coupon', { templateUrl: 'ECM/Coupon/coupon.html' })
        .when('/coupon/new', { templateUrl: 'ECM/Coupon/couponEdit.html' })
}]);



ECM.factory('couponService', function ($rootScope, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });


    var CouponServiceBase = {
        query: function(q, step, page, status, type) {
            return $emerge.query("ecm/Coupon" + "?q=" + (q || "") + (step ? "&step=" + step : "") + (page ? "&page=" + page : "") + (status ? "&status=" + status : "") + (type ? "&type=" + type : ""));
        },

        get: function(id) {
            return $emerge.get('ecm/Coupon', id);
        },

        add: function(coupon) {
            return $emerge.add('ecm/Coupon', coupon);
        },

        dateFromDMYToMDY: function(obj) {
            var date = obj.substring(0, 2);
            var month = obj.substring(3, 5);
            var year = obj.substr(6);
            var rs = month + '/' + date + '/' + year;
            return rs;
        }
    };

    return CouponServiceBase;
});