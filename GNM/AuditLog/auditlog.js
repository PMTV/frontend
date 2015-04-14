GNM.factory('auditLogService', function ($http, $emerge) {

    return {
        query: function (module, recordId) {
            return $emerge.query(module + "/" + recordId + "/AuditLog");
        },
        add: function (country) {
            // TODO Remove when USR Module ready
            return $emerge.add("countries", country);
        },
        getEventTypes: function () {
            var status = [
                { name: 'Added', value: 0 },
                { name: 'Deleted', value: 1 },
                { name: 'Modified', value: 2 }
            ];

            return status;
        },
    };
});

GNM.directive('auditLog', function ($http, $modal) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {
        },
        // the variable is available in directive controller,
        // and can be fetched as done in link function
        controller: ['$scope', function ($scope) {
            $scope.openAuditLog = function (module, recordId) {
                var dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'xx-dialog',
                    templateUrl: 'GNM/AuditLog/auditLogModal.html?a=aaaaaa',
                    controller: function ($scope, $modalInstance, $modal, auditLogService) {
                        $scope.auditLogs = [];

                        auditLogService.query(module, recordId).success(function (data) {
                            $scope.auditLogs = data;
                        })

                        $scope.getEventType = function (id) {
                            var arr = auditLogService.getEventTypes();
                            var status = _.find(arr, function (e) { return e.value == id; });
                            console.log(status);

                            if (status) {
                                return status.name;
                            } else {
                                return "";
                            }
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                });

                dialog.result.then(function () {
                }, function () {

                });

                dialog.opened.then(function () {
                });
            }
        }]
    };
})