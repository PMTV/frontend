GNM.directive('panelAddress', function ($http, $translate, $timeout, supplierService, customerService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            customer: '=',
            supplier: '='
        },
        templateUrl: 'GNM/Addresses/address.partial.html?a=aaaa',
        link: function (scope, element, attrs) {
            scope.$watch('newAddress.postalCode', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.length == 6) {
                    $http.jsonp("http://www.gothere.sg/maps/geo?output=&q=" + newVal + "&client=&sensor=false&callback=JSON_CALLBACK").success(function (data) {
                        if (data && data.Status.code !== 603 && !scope.newAddress.streetName) {
                            scope.newAddress.streetName = data.Placemark[0].AddressDetails.Country.Thoroughfare.ThoroughfareName;
                        }
                    });
                }
            })
        },

        // the variable is available in directive controller,
        // and can be fetched as done in link function
        controller: ['$scope', function ($scope) {
            $scope.showAddressForm = false;

            $scope.$watch('supplier', function (val) {
                if (val)
                    $scope.model = $scope.supplier;
            }, true);

            $scope.$watch('customer', function (val) {
                if (val)
                    $scope.model = $scope.customer;
            }, true);

            $scope.deleteAddress = function (index) {
                var address = $scope.model.addressList[index];

                if (address.addressId) {
                    if (confirm($translate.instant('ALERT.DELETING'))) {
                        if ($scope.model.supplierId) {
                            supplierService.deleteAddress($scope.model.supplierId, address.addressId)
                                .success(function () {
                                    $scope.model.addressList.splice(index, 1);
                            });

                        } else if ($scope.model.customerId) {
                            customerService.deleteAddress($scope.model.customerId, address.addressId)
                                .success(function () {
                                    $scope.model.addressList.splice(index, 1);
                            });
                        }
                    }
                } else {
                    $scope.model.addressList.splice(index, 1);
                }
            };

            $scope.setDefault = function(contact)
            {   
                // console.log(contact);
                _.filter($scope.model.addressList, function(item){
                    // console.log(item);
                    item.default = false;
                });
                contact.default = true;
                // console.log($scope.model.contactList);
            }
            
            $scope.addAddress = function () {
                $scope.submitted = true;

                if (!$scope.addressForm.$valid) {
                    return false;
                }

                // Hide the edit address form
                $scope.showAddressForm = false;

                var addressToAdd = angular.copy($scope.newAddress);

                var index = $scope.model.addressList.indexOf($scope.newAddress);

                // if address not in addressList, add it in so that there's no duplicates
                if (index < 0) {
                    $scope.model.addressList.push(addressToAdd);
                }

                // reset newAddress scope to null
                $scope.newAddress = {};
                $scope.mode = "";
                $scope.submitted = false;
            };

            $scope.editAddress = function (address) {
                var addressToEdit = angular.copy(address);
                // reset newAddress scope to null
                $scope.newAddress = address;
                $scope.showAddressForm = true;
                $scope.mode = "edit";
            };

            $scope.findAddress = function (postal) {
                $scope.findingAddress = true;
                $http.jsonp("http://www.gothere.sg/maps/geo?output=&q=" + postal + "&client=&sensor=false&callback=JSON_CALLBACK").success(function (data) {
                    if (data && data.Status.code !== 603) {
                        $scope.newAddress.streetName = data.Placemark[0].AddressDetails.Country.Thoroughfare.ThoroughfareName;
                    } else {
                        alert($translate.instant('ALERT.NOT_FOUND_TYPE'));
                    }

                    $scope.findingAddress = false;
                });
            }
        }]
    };
})
