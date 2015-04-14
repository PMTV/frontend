ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/timeSlots', { templateUrl: 'ECM/TimeSlots/timeSlot.html' })
}]);

ECM.factory('timeSlotService', function ($rootScope, $http, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var TimeSlotServiceBase = {

//        query: function () {
//            return $emerge.query("ecm/TimeSlot");
//        },
        query: function () {
            return $emerge.query("ecm/TimeSlot/GetAllTimeSlot");
        },
        queryDayOfWeek : function () {
            return $emerge.query("ecm/TimeSlot/GetDayInWeek");
        },
        get: function (id) {
            return $emerge.query("ecm/TimeSlot", id);
        },
        add: function (data) {
            return $emerge.add("ecm/TimeSlot", data);
        },
        update: function (id, data) {
            return $emerge.update("ecm/TimeSlot", id, data);
        },
        delete: function (id) {
            return $emerge.delete("ecm/TimeSlot", id);
        }


    }

    return TimeSlotServiceBase;
});
