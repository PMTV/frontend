

ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/notification', { templateUrl: 'ECM/Notification/SendNotification/notification.html' })
        .when('/notification/new', { templateUrl: 'ECM/Notification/SendNotification/notificationForm.html' })
        .when('/notification/:id', { templateUrl: 'ECM/Notification/SendNotification/notificationForm.html' })
}]);


ECM.factory('notificationService',  function ($rootScope, $emerge, promiseTracker){
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var NotificationBaseService = {
        getNotificationDetailById: function (id) {
            return $emerge.query("ecm/Notification/"+id+"/getNotification");
        },
        getAllUsers: function () {
            return $emerge.query("ecm/account/GetAllUser");
        },
        getAllNotifications: function () {
            return $emerge.query("ecm/Notification/getAllNotifications");
        },
        addNewNotification: function (data) {
            return $emerge.add("ecm/Notification", data);
        },
        deleteNotificationById: function (id) {
            return $emerge.delete("ecm/Notification", id);
        },
        updateNotificationById: function (data) {
            return $emerge.update("ecm/Notification", data.notificationId, data);
        }
    };

    return NotificationBaseService;
});