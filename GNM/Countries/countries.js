//GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
//    // TODO
//    $routeProvider
//        .when('/countries', { templateUrl: 'GNM/Countries/country.html' })
//        .when('/countries/new', { templateUrl: 'GNM/Countries/CountryEdit/countryEdit.html' })
//        .when('/countries/:id', { templateUrl: 'GNM/Countries/CountryEdit/countryEdit.html' });
//}]);

GNM.factory('countryService', function ($http, $emerge) {

    return {
        query: function () {
            return $emerge.query("countries");
        },
        get: function (id) {
            return $emerge.get("countries", id);
        },
        add: function (country) {
            // TODO Remove when USR Module ready
            return $emerge.add("countries", country);
        },
        update: function (country) {
            return $emerge.update("countries", country.countryId, country);
        },
        delete: function (id) {
            return $emerge.delete("countries", id);
        }
    };
});

/*
Get all the countrys information
- $scope.deleteFn is called to delete a particular country
- countryId is stored once user click on delete button
*/
GNM.controller('CountryCtrl', function ($scope, $http, countryService) {

});

GNM.controller('CountryAddCtrl', function ($scope, $http, $location, countryService) {
});
/*
Handle customer update
- init to get the existing customer information
- existing customer id is pass through when user click on edit button
- new customer information is saved on $scope.new_customer
*/
GNM.controller('CountryUpdateCtrl', function ($scope, $http, $location, countryService) {
    $scope.country = {};
});

GNM.directive('countriesDropdown', function ($modal, $log, countryService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addCountry()">' + // footer="Add" footerfn="addCountry()">' +
                '<option value="">Loading Countries</option>' +
                '<option ng-repeat="c in countryArr" value="{{c.countryId}}">{{c.name}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.countrysArr = [];

            // Function for Modal
            scope.addCountry = function () {
                var dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    templateUrl: 'GNM/Countries/CountryModalNew.html',
                    controller: function ($scope, $modalInstance) {

                        $scope.submitted = true;
                        if (!$scope.country.code) {
                            return false;
                        }
                        $scope.busy = true;
                        // MODAL SCOPE
                        $scope.country = {};

//                        $scope.save = function () {
//                            countryService.add($scope.country).success(function (data) {
//                                scope.countryArr.push(data);
//                                $modalInstance.close();
//                            });
//                        };

                        if (!$scope.country.countryId) {
                            countryService.add($scope.country)
                                .success(function (data) {
                                    $scope.countrysArr.push(data);
                                    alert("Country Successfully created!");
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
                            countryService.update($scope.country)
                                .success(function (data) {
                                    alert("Country updated!");
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

                        $scope.removeItem = function (index, id) {
                            $modalInstance.close();
                            bootstrapDialogConfirm('Do you want to proceed to Delete?', function() {
                                countryService.delete(id)
                                    .success(function() {
                                        // scope.CurrenciesArr.splice(index, 1);
                                        $scope.countrysArr.splice(index, 1);
                                        //alert('Successfully Deleted');
                                    })
                                    .error(function(data) {
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

            countryService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    // alert('Please add a Delivery Term first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.countryArr = (data.data);
            });
        }
    };
});