//var ECM = angular.module('ECM', ['ngEmerge', 'ajoslin.promise-tracker']);

ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/delivery-date', { templateUrl: 'ECM/DeliveryDate/deliverydate.html' })
        .when('/delivery-date/new', { templateUrl: 'ECM/DeliveryDate/deliverydateForm.html' })
        .when('/delivery-date/:id', { templateUrl: 'ECM/DeliveryDate/deliverydateForm.html' })
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


ECM.factory('deliverydateService', function ($rootScope, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var DeliveryDateServiceBase = {

        getAllTimingDisable: function (step, page) {
            return $emerge.query("ecm/deliveryTimingDisable/GetAllDeliveryTimingDisable?step=" + step + '&page=' + page);
        },
        getTimeSlotsByDate: function (date) {
            return $emerge.query("ecm/TimeSlot/GetTimeSlotByOrderDate?orderDate=" + date);
        },
        getTimeSlotList: function (date) {
            return $emerge.query("ecm/TimeSlot/GetTimeSlotByCurDate?curDate=" + date);
        },
        getInfoTimingDisableById: function (id) {
            return $emerge.query("ecm/deliveryTimingDisable/" + id);
        },
        updateTimingDisable: function (data) {
            return $emerge.update("ecm/deliveryTimingDisable", data.deliveryTimingDisableId, data);
        },
        addNewTimingDisable : function (data) {
            return $emerge.add("ecm/deliveryTimingDisable", data);
        },
        deleteTimingDisable: function (id) {
            return $emerge.delete("ecm/deliveryTimingDisable", id);
        }

    };

    return DeliveryDateServiceBase;
});