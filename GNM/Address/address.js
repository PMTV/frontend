GNM.directive('panelAddress', function (supplierService, customerService, $http) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            customer: '=',
            supplier: '='
        },
        template: '' +
            '<ng-form name="addressForm" novalidate>' +
                '<div ng-show="!showAddressForm && model.addressList.length !=0">' +
                    '<!-- -->' +
                    '<ul class="list-group gutter list-group-sp sortable m-b-lg">' +
                        '<li class="list-group-item hover" ng-repeat="address in model.addressList">' +
                            '<i class="fa fa-home"></i>' +
                            '<a class="btn-link" ng-click="editAddress(address);">({{address.addressType | addressType:addressType}}) Block {{address.blkNo}}, {{address.streetName}}, {{address.unitNo}}, Postal {{address.postalCode}}</a>' +
                            '<a ng-click="deleteAddress(address)" class="btn-link"><i class="fa fa-close fa-remove hover-action pull-right" ng-class="address.addressId ? \'text-danger\' : \'\'"></i></a>' +
                        '</li>' +
                    '</ul>' +
                '</div>' +
                '<div class="m-b-lg" ng-show="showAddressForm == true">' +
                    '<div class="form-group pull-in clearfix">' +
                        '<div class="col-sm-4" ng-class="{ \'has-error\' : addressForm.addressType.$invalid && submitted }">' +
                            '<label>Type</label>' +
                            '<select name="addressType" ng-model="newAddress.addressType" ng-required="showAddressForm" class="form-control input-sm">' +
                                '<option value="">Select</option>' +
                                '<option value="1">Home</option>' +
                                '<option value="2">Office</option>' +
                                '<option value="3">Billing</option>' +
                                '<option value="4">Shipping</option>' +
                            '</select>' +
                            '<div class="error" ng-show="(addressForm.addressType.$dirty && addressForm.addressType.$invalid) && submitted">' +
                                '<small class="error" ng-show="addressForm.addressType.$error.required">Required</small>' +
                            '</div>' +
                        '</div>' +
                        '<div class="col-sm-4" ng-class="{ \'has-error\' : addressForm.blkNo.$invalid && submitted }">' +
                            '<label>Block</label>' +
                            '<input name="blkNo" type="text" ng-model="newAddress.blkNo" ng-required="showAddressForm" class="form-control input-sm" placeholder="Block" maxlength="5">' +
                        '</div>' +
                        '<div class="col-sm-4" ng-class="{ \'has-error\' : addressForm.unitNo.$invalid && submitted }">' +
                            '<label>Unit No.</label>' +
                            '<input name="unitNo" type="text" ng-model="newAddress.unitNo" ng-required="showAddressForm" class="form-control input-sm" placeholder="Unit No" maxlength="7">' +
                        '</div>' +
                    '</div>' +
                    '<div class="form-group" ng-class="{ \'has-error\' : addressForm.streetName.$invalid && submitted }">' +
                        '<label>Street Name</label>' +
                        '<input name="streetName" type="text" ng-model="newAddress.streetName" ng-required="showAddressForm" class="form-control input-sm" placeholder="Street name">' +
                    '</div>' +
                    '<div class="form-group pull-in clearfix">' +
                    '<div class="col-sm-6" ng-class="{ \'has-error\' : addressForm.postalCode.$invalid && submitted }">' +
                            '<label>Postal Code</label>' +
                            '<div class="input-group">' +
                            '<input name="postalCode" type="text" ng-model="newAddress.postalCode" ng-required="showAddressForm" class="form-control input-sm" placeholder="Postal Code" maxlength="6">' +
                              '<span class="input-group-btn" tooltip="Find address">' +
                                '<button class="btn btn-white input-sm" type="button" ng-click="findAddress(newAddress.postalCode)"><i class="fa fa-globe" /></button>' +
                              '</span>' +
                            '</div><!-- /input-group -->' +
                            
                        '</div>' +
                        '<div class="col-sm-6" ng-class="{ \'has-error\' : addressForm.countries.$invalid && submitted }">' +
                            '<label>Country</label>' +
                            '<countries-dropdown name="countries" ng-model="newAddress.countryId" ng-required="showAddressForm"></countries-dropdown>' +
                        '</div>' +
                    '</div>' +
                    '<div class="form-group pull-in clearfix">' +
                        '<div class="col-sm-6">' +
                            '<label>State</label>' +
                            '<input type="text" class="form-control input-sm" placeholder="State" ng-model="newAddress.countryState">' +
                        '</div>' +
                        '<div class="col-sm-6">' +
                            '<label>City</label>' +
                            '<input type="text" class="form-control input-sm" placeholder="City" ng-model="newAddress.countryCity">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<footer class="panel-footer bg-light lter text-right clear-fix m-r-n m-t m-l-n m-b-n">' +
                    '<button type="submit" ng-click="addAddress(); " class="btn btn-info btn-sm" ng-show="mode == \'edit\';">Add</button>' +
                    '<button class="btn btn-sm" ng-click="showAddressForm = false; mode = \'\'; newAddress = {};" ng-show="showAddressForm">Cancel</button>' +
                    '<button class="btn btn-info btn-sm" ng-click="showAddressForm = true; mode=\'edit\';" ng-show="!showAddressForm"><i class="fa fa-plus"></i></button>' +
                '</footer>' +
            '</ng-form>',

        link: function (scope, element, attrs) {
            scope.$watch('newAddress.postalCode', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.length == 6){
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
            $scope.model = $scope.customer || $scope.supplier;

            $scope.deleteAddress = function (address) {
                var index = $scope.model.addressList.indexOf(address);

                if (address.addressId) {
                    bootstrapConfirm('Do you want to proceed to Delete?', function() {
                        if ($scope.model.supplierId) {
                            supplierService.deleteAddress($scope.model.supplierId, address.addressId).success(function() {
                                $scope.model.addressList.splice(index, 1);
                            });

                        } else if ($scope.model.customerId) {
                            customerService.deleteAddress($scope.model.customerId, address.addressId).success(function() {
                                $scope.model.addressList.splice(index, 1);
                            });
                        }
                    });
                } else {
                    $scope.model.addressList.splice(index, 1);
                }
            };

            $scope.addAddress = function () {
                $scope.submitted = true;

                if (!$scope.addressForm.$valid) {
                    return false;
                }

                // Hide the edit address form
                $scope.showAddressForm = false;

                var addressToAdd = angular.copy($scope.newAddress);
                // TODO Remove when User Module ready
                addressToAdd.userId = 1;

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
                $http.jsonp("http://www.gothere.sg/maps/geo?output=&q=" + postal + "&client=&sensor=false&callback=JSON_CALLBACK").success(function (data) {
                    if (data && data.Status.code !== 603) {
                        $scope.newAddress.streetName = data.Placemark[0].AddressDetails.Country.Thoroughfare.ThoroughfareName;
                    } else {
                        alert("Address could not be found");
                    }
                });
            }
        }]
    };
})
