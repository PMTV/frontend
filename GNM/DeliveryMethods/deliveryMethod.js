GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // TODO
}]);

GNM.factory('deliveryMethodService', function ($http, $emerge) {

    return {
        query: function () {
            return $emerge.query("deliveryMethods");
        },
        add: function (deliveryMethod) {
            // TODO Remove when USR Module ready
            return $emerge.add("deliveryMethods", deliveryMethod);
        },
        update: function (data) {
            return $emerge.update("deliveryMethods", data.deliveryMethodId, data);
        },
        delete: function (id) {
            // TODO Remove when USR Module ready
            return $emerge.delete("deliveryMethods", id);
        }
    };
});

/*
Get all the deliveryMethods information
- $scope.deleteFn is called to delete a particular deliveryMethod
- deliveryMethodId is stored once user click on delete button
*/
GNM.controller('DeliveryMethodCtrl', function ($scope, $http, deliveryMethodService) {

});

GNM.controller('DeliveryMethodAddCtrl', function ($scope, $http, $location, deliveryMethodService) {
});
/*
Handle customer update
- init to get the existing customer information
- existing customer id is pass through when user click on edit button
- new customer information is saved on $scope.new_customer
*/
GNM.controller('DeliveryMethodUpdateCtrl', function ($scope, $http, $location, deliveryMethodService) {
    $scope.deliveryMethod = {};
});

GNM.directive('deliverymethodsDropdown', function (deliveryMethodService, $modal, $log) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addDeliveryMethod()" >' + //footer="Add" footerfn="addDeliveryMethod()"
                '<option value="">Loading Delivery Method</option>' +
                '<option ng-repeat="c in DeliveryMethodArr" value="{{c.deliveryMethodId}}">{{c.code}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.DeliveryMethodArr = [];

            deliveryMethodService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    //alert('Please add a Currency first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.DeliveryMethodArr = (data.data);
            });
            var dialog;
            scope.addDeliveryMethod = function () {
                dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'GNM/DeliveryMethods/DeliveryMethodModalNew.html?a=a',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.deliveryMethod = {};
                        $scope.DeliveryMethodArr = scope.DeliveryMethodArr;

                        $scope.save = function () {
                            $scope.submitted = true;
                            if (!$scope.deliveryMethod.code) {
                                return false;
                            }
                            $scope.busy = true;

                            if (!$scope.deliveryMethod.deliveryMethodId) {
                                deliveryMethodService.add($scope.deliveryMethod)
                                    .success(function (data) {
                                        scope.DeliveryMethodArr.push(data);
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                });
                            } else {
                                deliveryMethodService.update($scope.deliveryMethod)
                                    .success(function (data) {
                                        //scope.creditTermsArr.push(data);
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                });
                            }
                        };

                        $scope.removeItem = function (index, id) {
                            bootstrapDialogConfirm('Do you want to proceed to Delete?', function() {
                                deliveryMethodService.delete(id)
                                    .success(function() {
                                        scope.DeliveryMethodArr.splice(index, 1);
                                        $scope.DeliveryMethodArr.splice(index, 1);
                                        alert('Successfully Deleted');
                                    })
                                    .error(function(data) {
                                        alert(data);
                                    });
                            });
                        }

                        $scope.editItem = function (item) {
                            $scope.deliveryMethod = item;
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