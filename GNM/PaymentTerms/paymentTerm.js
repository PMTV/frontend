GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // TODO
}]);

GNM.factory('paymentTermService', function ($http, $emerge) {

    return {
        query: function () {
            return $emerge.query("paymentTerms");
        },
        add: function (paymentTerm) {
            // TODO Remove when USR Module ready
            return $emerge.add("paymentTerms", paymentTerm);
        },
        update: function (paymentTerm) {
            return $emerge.update("paymentTerms", paymentTerm.paymentTermId, paymentTerm);
        },
        delete: function (id) {
            return $emerge.delete("paymentTerms", id);
        }
    };

});

/*
Get all the paymentTerms information
- $scope.deleteFn is called to delete a particular PaymentTerm
- paymentTermId is stored once user click on delete button
*/
GNM.controller('PaymentTermCtrl', function ($scope, $http, paymentTermService) {

});

GNM.controller('PaymentTermAddCtrl', function ($scope, $http, $location, paymentTermService) {
});
/*
Handle customer update
- init to get the existing customer information
- existing customer id is pass through when user click on edit button
- new customer information is saved on $scope.new_customer
*/
GNM.controller('PaymentTermUpdateCtrl', function ($scope, $http, $location, paymentTermService) {
    $scope.paymentTerm = {};
});

GNM.directive('paymenttermsDropdown', function ($modal, $log, paymentTermService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addPaymentTerm()">' + //footer="Add" footerfn="addPaymentTerm()"
                '<option value="">Loading Payment Term</option>' +
                '<option ng-repeat="c in PaymentTermArr" value="{{c.paymentTermId}}">{{c.code}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.PaymentTermArr = [];

            paymentTermService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    //alert('Please add a Currency first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.PaymentTermArr = (data.data);
            });

            var dialog;

            scope.addPaymentTerm = function () {
                dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'GNM/PaymentTerms/PaymentTermModalNew.html?a=a',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.paymentTerm = {};
                        $scope.PaymentTermArr = scope.PaymentTermArr;

                        $scope.save = function () {
                            $scope.busy = true;

                            if (!$scope.paymentTerm.paymentTermId) {
                                paymentTermService.add($scope.paymentTerm)
                                    .success(function (data) {
                                        scope.PaymentTermArr.push(data);
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                });
                            } else {
                                paymentTermService.update($scope.paymentTerm)
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
                                paymentTermService.delete(id)
                                    .success(function() {
                                        scope.PaymentTermArr.splice(index, 1);
                                        $scope.PaymentTermArr.splice(index, 1);
                                        alert('Successfully Deleted');
                                    })
                                    .error(function(data) {
                                        alert(data);
                                    });
                            });
                        }

                        $scope.editItem = function (item) {
                            $scope.paymentTerm = item;
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