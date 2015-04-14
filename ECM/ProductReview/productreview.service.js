//var ECM = angular.module('ECM', ['ngEmerge', 'ajoslin.promise-tracker']);

ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/product-review', { templateUrl: 'ECM/ProductReview/productreview.html' })
        .when('/product-review/new', { templateUrl: 'ECM/ProductReview/productreviewForm.html' })
        .when('/product-review/:id', { templateUrl: 'ECM/ProductReview/productreviewForm.html' })
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


ECM.factory('productreviewService', function ($rootScope, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var ProductReviewServiceBase = {

        query: function () {
            return $emerge.query("ecm/productreview");
        },
        queryProductReviewList : function () {
            return $emerge.query("ecm/productreview/GetAllProductReview");
        },
        queryProductReviewById: function (id) {
            return $emerge.query("ecm/productreview/GetProductReviewById?productReviewId=" + id);
        },
        updateProductReview: function (updateInfo) {
            return $emerge.update("ecm/productreview", updateInfo.productId, updateInfo);
        },
        deleteProductReview: function (id) {
            return $emerge.delete("ecm/productreview", id);
        },
        add: function (reviewInfo) {
            return $emerge.add("ecm/productreview", reviewInfo);
        },
        queryCustomer: function (q, step, page) {
            return $emerge.query('customers' + "?q=" + (q || "") + (step ? "&step=" + step : "") + (page ? "&page=" + page : ""));
        }

    };

    return ProductReviewServiceBase;
});