GNM.factory('returnReasonService', function ($http, $emerge) {

    return {
        query: function () {
            return $emerge.query("ecm/returnReason");
        },
        get: function (id) {
            return $emerge.get("ecm/returnReason", id);
        },
        add: function (returnReason) {
            return $emerge.add("ecm/returnReason", returnReason);
        },
        update: function (returnReason) {
            return $emerge.update("ecm/returnReason", returnReason.returnReasonId, returnReason);
        },
        delete: function (returnReasonId) {
            return $emerge.delete("ecm/returnReason", returnReasonId);
        }
    };
});

/*
Get all the returnReason information
- $scope.deleteFn is called to delete a particular returnReason
- returnReasonId is stored once user click on delete button
*/
GNM.controller('ReturnReasonCtrl', function ($scope, $http, returnReasonService) {

});

GNM.controller('ReturnReasonAddCtrl', function ($scope, $http, $location, returnReasonService) {
});

GNM.controller('ReturnReasonUpdateCtrl', function ($scope, $http, $location, returnReasonService) {
    $scope.returnReason = {};
});

GNM.directive('returnreasonDropdown', function ($modal, $log, returnReasonService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addReturnReason()">' + // footer="Add" footerfn="addReturnReason()">' +
                '<option value="">Loading Return Reason</option>' +
                '<option ng-repeat="c in returnReasonArr" value="{{c.returnReasonId}}">{{c.code}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.returnReasonArr = [];

            // Function for Modal
            scope.addReturnReason = function () {
                var dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'GNM/ReturnReason/ReturnReasonModal.html',
                    controller: function ($scope, $modalInstance) {

                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.returnReason = {};
                        $scope.returnReasonArr = scope.returnReasonArr;

                        //save
                        $scope.save = function () {
                            $scope.submitted = true;
                            if (!$scope.returnReason.code) {
                                return false;
                            }
                            $scope.busy = true;

                            if (!$scope.returnReason.returnReasonId) {
                                returnReasonService.add($scope.returnReason)
                                    .success(function (data) {
                                        scope.returnReasonArr.push(data);
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                    $scope.submitted = false;
                                });
                            } else {
                                returnReasonService.update($scope.returnReason)
                                    .success(function (data) {
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                    $scope.submitted = false;
                                });
                            }
                        };

                        //remove
                        $scope.removeItem = function (index, id) {
                            $modalInstance.close();
                            bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                                returnReasonService.delete(id)
                                    .success(function () {
                                        $scope.returnReasonArr.splice(index, 1);
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    });
                            });
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                });
                dialog.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }

            returnReasonService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.returnReasonArr = (data.data);
            });
        }
    };
});