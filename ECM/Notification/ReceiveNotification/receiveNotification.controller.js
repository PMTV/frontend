ECM.controller('ReceiveNotificationListCtrl', function ($scope, $rootScope, receiveNotificationService) {

    $scope.loadReceiveNotificationList = function () {
        receiveNotificationService.getAllRecipientList()
            .success(function (data, status) {
                $scope.receiveNotificationDatatable = data.results;
            })
            .error(function(){ console.log('Load list receive notifications error'); })
            .finally(function(){});
    };

    var _init = function () {
      $scope.loadReceiveNotificationList();
    };

    _init();

});

ECM.controller('ReceiveNotificationEditCtrl', function ($scope, $rootScope, $routeParams, $location, receiveNotificationService, InitServices) {
    var notificationId = null;

    var _init = function () {
        notificationId = $routeParams.id;

        if(notificationId!=null){
            receiveNotificationService.getDetailsEachNotification(notificationId)
                .success(function (data, status) {
                    var date = new Date(data.dateCreated);
                    var m_names = ["Jan", "Feb", "Mar","Apr", "May", "June", "July", "Aug", "Sept","Oct", "Nov", "Dec"];
                    date = date.getDate() + '-' + m_names[date.getMonth()] + '-' + date.getFullYear();
                    $scope.notification = data;
                    $scope.notification.dateTime = date;

                    InitServices.getNumOfNotification()
                        .success(function (data, status) {
                            $rootScope.numOfNotification = data;
                        })
                        .error()
                        .finally();
                })
                .error(function(){ console.log('Error load receive notification information!') })
                .finally();
        }
    };

    _init();
});