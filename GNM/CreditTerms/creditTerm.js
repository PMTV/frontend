var GNM = angular.module('GNM', []);

GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // TODO
}]);

GNM.factory('creditTermService', function ($http, $emerge) {
    return {
        query: function () {
            return $emerge.query("creditTerms");
        },
        add: function (data) {
            // TODO Remove when USR Module ready
            return $emerge.add("creditTerms", data);
        },
        update: function (data) {
            return $emerge.update("creditTerms", data.creditTermId, data);
        },
        delete: function (id) {
            // TODO Remove when USR Module ready
            return $emerge.delete("creditTerms", id);
        }
    };
});

/*
Get all the creditTerms information
- $scope.deleteFn is called to delete a particular creditTerm
- creditTermId is stored once user click on delete button
*/
GNM.controller('CreditTermCtrl', function ($scope, $http, CreditTermService) {

});

GNM.controller('CreditTermAddCtrl', function ($scope, $http, $location, CreditTermService) {
});
/*
Handle customer update
- init to get the existing customer information
- existing customer id is pass through when user click on edit button
- new customer information is saved on $scope.new_customer
*/
GNM.controller('CreditTermUpdateCtrl', function ($scope, $http, $location, CreditTermService) {
    $scope.creditTerm = {};
});

GNM.directive('credittermsDropdown', function ($log, $modal, creditTermService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2">' +
                '<option value="">Loading Credit Terms</option>' +
                '<option ng-repeat="c in creditTermsArr" value="{{c.creditTermId}}">{{c.code}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.creditTermsArr = [];

            creditTermService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    // alert('Please add a Credit Term first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }

                scope.creditTermsArr = (data.data);
            });
            var dialog;
            scope.addCreditTerm = function () {
                dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'GNM/CreditTerms/CreditTermModalNew.html',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.creditTerm = {};
                        $scope.creditTermsArr = scope.creditTermsArr;

                        $scope.save = function () {
                            $scope.submitted = true;
                            if (!$scope.creditTerm.code) {
                                return false;
                            }
                            $scope.busy = true;

                            if (!$scope.creditTerm.creditTermId) {
                                creditTermService.add($scope.creditTerm)
                                    .success(function (data) {
                                        scope.creditTermsArr.push(data);
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
                                creditTermService.update($scope.creditTerm)
                                    .success(function (data) {
                                        //scope.creditTermsArr.push(data);
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

                        $scope.removeItem = function (index, id) {
                            bootstrapConfirm('Do you want to proceed to Delete?', function() {
                                creditTermService.delete(id)
                                    .success(function() {
                                        scope.creditTermsArr.splice(index, 1);
                                        $scope.creditTermsArr.splice(index, 1);
                                        alert('Successfully Deleted');
                                    })
                                    .error(function(data) {
                                        alert(data);
                                    });
                            });
                        }

                        $scope.editItem = function (item) {
                            $scope.creditTerm = item;
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.manage = function () {
                            console.log(dialog);
                        }
                    }
                });
                dialog.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
        }
    };
});