GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // TODO
}]);

GNM.factory('deliveryTermService', function ($http, $emerge) {
    return {
        query: function () {
            return $emerge.query("deliveryTerms");
        },
        add: function (deliveryTerm) {
            return $emerge.add("deliveryTerms", deliveryTerm);
        },
        update: function (deliveryTerm) {
            return $emerge.update("deliveryTerms", deliveryTerm.deliveryTermId, deliveryTerm);
        },
        delete: function (id) {
            return $emerge.delete("deliveryTerms", id);
        }
    };
});

/*
Get all the deliveryTerms information
- $scope.deleteFn is called to delete a particular deliveryTerm
- deliveryTermId is stored once user click on delete button
*/
GNM.controller('DeliveryTermCtrl', function ($scope, $http, deliveryTermService) {

});

GNM.controller('DeliveryTermAddCtrl', function ($scope, $http, $location, deliveryTermService) {
});
/*
Handle customer update
- init to get the existing customer information
- existing customer id is pass through when user click on edit button
- new customer information is saved on $scope.new_customer
*/
GNM.controller('DeliveryTermUpdateCtrl', function ($scope, $http, $location, deliveryTermService) {
    $scope.deliveryTerm = {};
});

GNM.directive('deliverytermsDropdown', function (deliveryTermService, $modal, $log) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addDeliveryTerm()">' + //footer="Add" footerfn="addDeliveryTerm()"
                '<option value="">Loading Delivery Term</option>' +
                '<option ng-repeat="c in DeliveryTermArr" value="{{c.deliveryTermId}}">{{c.code}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.DeliveryTermArr = [];

            deliveryTermService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    //alert('Please add a Currency first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.DeliveryTermArr = (data.data);
            });
            var dialog;

            scope.addDeliveryTerm = function () {
                dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'GNM/DeliveryTerms/DeliveryTermModalNew.html?a=a',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.deliveryTerm = {};
                        $scope.DeliveryTermArr = scope.DeliveryTermArr;

                        $scope.save = function () {
                            $scope.submitted = true;
                            if (!$scope.deliveryTerm.code) {
                                return false;
                            }
                            $scope.busy = true;

                            if (!$scope.deliveryTerm.deliveryTermId) {
                                deliveryTermService.add($scope.deliveryTerm)
                                    .success(function (data) {
                                        scope.DeliveryTermArr.push(data);
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
                                deliveryTermService.update($scope.deliveryTerm)
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
                            bootstrapDialogConfirm('Do you want to proceed to Delete?', function() {
                                deliveryTermService.delete(id)
                                    .success(function() {
                                        scope.DeliveryTermArr.splice(index, 1);
                                        $scope.DeliveryTermArr.splice(index, 1);
                                        alert('Successfully Deleted');
                                    })
                                    .error(function(data) {
                                        alert(data);
                                    });
                            });
                        }

                        $scope.editItem = function (item) {
                            $scope.deliveryTerm = item;
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