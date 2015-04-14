GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // TODO
}]);

GNM.factory('currencyService', function ($http, $emerge) {
    return {
        query: function () {
            return $emerge.query("currencies");
        },
        add: function (currency) {
            // TODO Remove when USR Module ready
            return $emerge.add("currencies", currency);
        },
        update: function (data) {
            return $emerge.update("currencies", data.currencyId, data);
        },
        delete: function (id) {
            // TODO Remove when USR Module ready
            return $emerge.delete("currencies", id);
        }
    };
});

/*
Get all the Currenciess information
+ $scope.deleteFn is called to delete a particular Currencies
+ CurrenciesId is stored once user click on delete button
*/
GNM.controller('CurrenciesCtrl', function ($scope, $http, currencyService) {

});

GNM.controller('CurrenciesAddCtrl', function ($scope, $http, $location, currencyService) {
});

/*
Handle customer update
+ init to get the existing customer information
+ existing customer id is pass through when user click on edit button
+ new customer information is saved on $scope.new_customer
*/
GNM.controller('CurrenciesUpdateCtrl', function ($scope, $http, $location, currencyService) {
    $scope.Currencies = {};
});

GNM.directive('currenciesDropdown', function ($modal, $log, currencyService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addCurrency()">' +
                '<option value="">Loading Currency</option>' +
                '<option ng-repeat="c in CurrenciesArr" value="{{c.currencyId}}">{{c.code}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.CurrenciesArr = [];

            currencyService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    //alert('Please add a Currency first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.CurrenciesArr = (data.data);
            });
            var dialog;
            scope.addCurrency = function () {
                dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'GNM/Currencies/CurrencyModalNew.html?a=a',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.Currencies = {};
                        $scope.CurrenciesArr = scope.CurrenciesArr;

                        $scope.save = function () {
                            $scope.submitted = true;
                            if (!$scope.Currencies.code) {
                                return false;
                            }
                            $scope.busy = true;

                            if (!$scope.Currencies.currencyId) {
                                currencyService.add($scope.Currencies)
                                    .success(function (data) {
                                        scope.CurrenciesArr.push(data);
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
                                currencyService.update($scope.Currencies)
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
                                currencyService.delete(id)
                                    .success(function() {
                                        $scope.CurrenciesArr.splice(index, 1);
                                        //alert('Successfully Deleted');
                                    })
                                    .error(function(data) {
                                        alert(data);
                                    });
                            });
                        }

                        $scope.editItem = function (item) {
                            $scope.Currencies = item;
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