'use strict';

EmergeApp.factory('InitServices', function ($emerge) {

    var InitEmergeAppService = {
        getTenNotifications: function () {
            return $emerge.query("ecm/Notification/getTenRecipientNotifications");
        },
        getNumOfNotification: function () {
            return $emerge.query("ecm/Notification/GetNumOfNotification");
        },
        getNotificationById: function (id) {
            return $emerge.query("ecm/Notification/" + id + "/getRecipientNotification");
        }
    };

    return InitEmergeAppService;
});

EmergeApp.controller('InitCtrl', function ($scope, $rootScope, $routeParams, $location, $cookieStore, InitServices) {
    $rootScope.numOfNotification = 0;
    $scope.recipientList = {};

    var _init = function () {
        InitServices.getNumOfNotification()
            .success(function (data, status) {
                $rootScope.numOfNotification = data;
            })
            .error()
            .finally();

        InitServices.getTenNotifications()
            .success(function (data, status) {
                angular.forEach(data, function (key, value) {
                    var date = new Date(key.dateCreated);
                    var m_names = ["Jan", "Feb", "Mar","Apr", "May", "June", "July", "Aug", "Sept","Oct", "Nov", "Dec"];
                    date = date.getDate() + ' ' + m_names[date.getMonth()] + ' ' + date.getFullYear();
                    data[value].dateConverted = date;
                });
                $scope.recipientList = data;

            })
            .error()
            .finally();
    };

    _init();
});
