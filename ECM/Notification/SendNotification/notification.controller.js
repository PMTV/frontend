ECM.controller('NotificationListCtrl', function ($scope, $rootScope, notificationService) {

    $scope.loadNotificationList = function () {
        notificationService.getAllNotifications()
            .success(function (data, status) {
                $scope.notificationDatatable = data.results;
            })
            .error(function(){ console.log('Load list notifications error'); })
            .finally(function(){});
    };

    $scope.deleteNotification = function (id) {
        notificationService.deleteNotificationById(id)
            .success(function (data, status) {
                alert('Delete notification successfull!');
                $scope.loadNotificationList();
            })
            .error(function(){console.log('Error delete notification!')})
            .finally();
    };

    var _init = function () {
      $scope.loadNotificationList();
    };

    _init();

});

ECM.controller('NotificationEditCtrl', function ($scope, $rootScope, $routeParams, $location, notificationService) {
    var notificationId = null;
    $scope.selectedUser = null;
    $scope.notification = {};
    $scope.notificationUserList = [];
    $scope.selectedUserList = [];
    $scope.notification.recipientIdList = [];
    $scope.submitted = false;
    $scope.checkEdit=false;

    var _init = function () {
        notificationId = $routeParams.id;

        if(notificationId!=null){
            $scope.checkEdit = false;
            notificationService.getNotificationDetailById(notificationId)
                .success(function (data, status) {
                    $scope.notification = data;
                    if(data.isSendToAll){
                        $scope.selectedUserList.push({id:-1, name: 'Send to all Users'});
                    }else{
                        if(data.isSendToCustomers){
                            $scope.selectedUserList.push({id:-2, name: 'Send to all Customers'});
                        }else{
                            if(data.isSendToEmployees){
                                $scope.selectedUserList.push({id:-3, name: 'Send to all Employees'});
                            }else{
                                angular.forEach(data.recipientIdList, function (key, value) {
                                    console.log(key);
                                    console.log(value);
                                    console.log(data.recipienNametList[value]);
                                    $scope.selectedUserList.push({id: key, name : data.recipienNametList[value]});
                                });
                                console.log('aaaaaaaaaaa');
                                console.log($scope.selectedUserList);
                            }
                        }
                    }
//                            $scope.selectedUserList = data.recipientIdList;
                })
                .error(function(){ console.log('Error load notification information!') })
                .finally();
        }else{
            $scope.checkEdit = true;
            notificationService.getAllUsers()
                .success(function (data, status) {
                    $scope.notificationUserList = data;
                    if(notificationId!=null){
                        console.log('edit case');
                    }
                })
                .error(function(){ console.log('Error load list users') })
                .finally(function(){});
        }
    };

    $scope.updateSelectedUserList = function (id) {
        var exist = false;
        var newUser = {};
        if(parseInt(id) > 0){
            $scope.notification.isSendToAll = false;
            $scope.notification.isSendToCustomers = false;
            $scope.notification.isSendToEmployees = false;
            //check have already special options
            angular.forEach($scope.selectedUserList, function (key, value) {
                if(key.id < 0) {
                    $scope.selectedUserList = [];
                    return false;
                }
                if(key.id == id){
                    exist = true;
                }
            });
            angular.forEach($scope.notificationUserList, function (key, value) {
                if(key.id == id){
                    newUser.id = id;
                    newUser.name = key.firstName + ' ' + key.lastName;
                    return false;
                }
            });

        }else{
            $scope.selectedUserList = [];
            exist = false;
            switch(id){
                case undefined:
                    exist = true;
                    break;
                case '-1':
                    $scope.notification.isSendToAll = true;
                    $scope.notification.isSendToCustomers = false;
                    $scope.notification.isSendToEmployees = false;
                    newUser.id = id;
                    newUser.name = 'Send to all Users';
                    break;
                case '-2':
                    $scope.notification.isSendToAll = false;
                    $scope.notification.isSendToCustomers = true;
                    $scope.notification.isSendToEmployees = false;
                    newUser.id = id;
                    newUser.name = 'Send to all Customers';
                    break;
                case '-3':
                    $scope.notification.isSendToAll = false;
                    $scope.notification.isSendToCustomers = false;
                    $scope.notification.isSendToEmployees = true;
                    newUser.id = id;
                    newUser.name = 'Send to all Employees';
                    break;
            }
        }
        if(!exist){
            $scope.selectedUserList.push(newUser);
        }
    };

    $scope.removeUsers = function (index) {
        if($scope.checkEdit){
            $scope.selectedUserList.splice(index, 1);
        }
    };

    $scope.save = function (notificationData) {
        $scope.submitted = true;
        if(!$scope.myForm.$valid){
            alert('Please check your input data!');
            return false;
        }

        if(notificationId != null){
            $scope.busy = true;
            notificationService.updateNotificationById(notificationData)
                .success(function(data, status){
                    alert('Update notification successfull!');
                    $location.url('/notification');
                })
                .error(function(){alert('Update notification fail!');})
                .finally(function(){ $scope.busy = false; $scope.submitted = false;} );
        }else{
            angular.forEach($scope.selectedUserList, function (key, value) {
                if(key.id > 0){
                    $scope.notification.recipientIdList.push(key.id);
                }
            });
            $scope.busy = true;
            notificationService.addNewNotification(notificationData)
                .success(function (data, status) {
                    $location.url('/notification');
                })
                .error(function() { alert('Create new notification fail!'); })
                .finally(function() {$scope.busy = false; $scope.submitted = false; });
        }
    };

    _init();
});