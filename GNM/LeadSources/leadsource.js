GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // TODO
}]);

GNM.factory('leadsourceService', function ($http, $emerge) {
    return {
        query: function () {
            return $emerge.query("leadsources");
        },
        add: function (leadsource) {
            // TODO Remove when USR Module ready
            return $emerge.add("leadsources", leadsource);
        },
        update: function (leadsource) {
            return $emerge.update("leadsources", leadsource.leadsourceId, leadsource);
        },
        delete: function (id) {
            return $emerge.delete("leadsources", id);
        }
    };
});

GNM.directive('leadsourcesDropdown', function ($translate, $modal, $log, errorDisplay, leadsourceService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addLeadsource()">' +
                '<option value="">Please Select</option>' +
                '<option ng-repeat="c in leadsourceArr" value="{{c.leadSourceId}}">{{c.name}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.leadsourceArr = [];

            leadsourceService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    //alert('Please add a Currency first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.leadsourceArr = (data.data);
            });

            var dialog;

            scope.addLeadsource = function () {
                dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass:'modal-preview',
                    templateUrl: 'GNM/LeadSources/LeadsourceModal.html?a=a',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.leadsource = {};
                        $scope.leadsourceArr = scope.leadsourceArr;

                        $scope.save = function () {
                            $scope.busy = true;

                            if (!$scope.leadsource.leadsourceId) {
                                leadsourceService.add($scope.leadsource)
                                    .success(function (data) {
                                        scope.leadsourceArr.push(data);
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        errorDisplay.show(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                });
                            } else {
                                leadsourceService.update($scope.leadsource)
                                    .success(function (data) {
                                        //scope.creditTermsArr.push(data);
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        errorDisplay.show(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                });
                            }
                        };

                        $scope.removeItem = function (index, id) {
                            if (confirm($translate.instant('ALERT.DELETING'))) {
                                leadsourceService.delete(id)
                                    .success(function () {
                                        scope.leadsourceArr.splice(index, 1);
                                        $scope.leadsourceArr.splice(index, 1);
                                        alert($translate.instant('ALERT.DELETED'));
                                    })
                                    .error(function (data) {
                                        errorDisplay.show(data);
                                    });
                            }
                        }

                        $scope.editItem = function (item) {
                            $scope.leadsource = item;
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                    //resolve: {
                    //    items: function () {
                    //        return $scope.items;
                    //    }
                    //}
                });
                dialog.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }

            
        }
    };
});