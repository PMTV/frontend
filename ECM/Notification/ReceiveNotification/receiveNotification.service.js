

ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/receive-notification', { templateUrl: 'ECM/Notification/ReceiveNotification/receiveNotification.html' })
        .when('/receive-notification/:id', { templateUrl: 'ECM/Notification/ReceiveNotification/receiveNotificationForm.html' })
}]);


ECM.factory('receiveNotificationService',  function ($rootScope, $emerge, promiseTracker){
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var ReceiveNotificationBaseService = {
        getAllRecipientList: function () {
            return $emerge.query("ecm/Notification/getAllRecipientNotifications");
        },
        getDetailsEachNotification: function (id) {
            return $emerge.query("ecm/Notification/" + id + "/getRecipientNotification");
        }
    };

    return ReceiveNotificationBaseService;
});