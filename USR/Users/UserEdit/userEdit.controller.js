/*
 Get all the user information
 - $scope.deleteFn is called to delete a particular user
 - user id is stored once user click on delete button
 */
USR.controller('UserListCtrl', function ($scope, $http, userService) {
    $scope.userTableData = null;

    $scope.loadUser = function () {
//        userService.query().success(function (data) {
//            $scope.userTableData = data;
//        })
        userService.queryUsersList().success(function (data) {
            $scope.userTableData = data;
        })
    };

    $scope.deleteUser = function (userId) {
        userService.deleteUser(userId)
            .success(function (data) {
                $scope.loadUser();
            })
            .error(function (error) {
                console.log(error);
            })
    };

    $scope.loadUser();
});

USR.controller('UserEditCtrl', function ($scope, $http, $route, $routeParams, $location, userService, errorDisplay) {
    $scope.user = {};
    $scope.employee = {};
    $scope.roles = [];
    $scope.selectedRoles = [];

    // Numbers
    $scope.num = {};
    $scope.num.quotations = 0;
    $scope.num.salesorders = 0;
    $scope.num.notes = 0;
    $scope.num.tasks = 0;
    $scope.num.documents = 0;

    $scope.checkEmployee = false;
    $scope.checkEdit = true;
    $scope.checkChangePass = false;
    $scope.busy = false;

    var userId = null;

    $scope.$watch(function(){return $scope.user.password;}, function (newVal, oldVal) {
        if(newVal != null){
            $scope.checkChangePass = true;
        }else{
            $scope.checkChangePass = false;
            return false;
        }
    }, true);

    var _init = function () {
        userId = $routeParams.id;
        if (userId) {
            $scope.checkEdit = true;
            userService.queryRoles().success(function (result) {
                $scope.roles = result;

                userService.getUserInfoById(userId)
                    .success(function (data) {
                        if(data.employeeId == -1){
                            $scope.checkEmployee = true;
                        }else{
                            $scope.checkEmployee = false;
                        }

                        if(data!= null){
                            angular.forEach(data.roles, function (dataRoles, key) {
                                $scope.selectedRoles[dataRoles.roleId - 1] = ({roleId: dataRoles.roleId, selected: true});
                            });
                        }else{
                            angular.forEach(result, function (value, key) {
                                $scope.selectedRoles.push({roleId: value.id, selected: false});
                            });
                        }

                        angular.copy(data, $scope.user);
                        $scope.employee = data.employee;
                    });
            });
        }else{
            $scope.checkEdit = false;
            userService.queryRoles().success(function (data) {
                $scope.roles = data;
                angular.forEach($scope.roles, function (result, key) {
                    $scope.selectedRoles.push({roleId: result.id, id: result.id, selected: false});
                });
            }).error(function(){ alert('Error load role list!'); });
        }
    };

    _init();

    $scope.toggleRole = function (name, id, index) {
        if(!$scope.selectedRoles[index]){
            $scope.selectedRoles[index] = {roleId: id, selected: true};
        }else{
            if($scope.selectedRoles[index].selected){
                $scope.selectedRoles[index].selected = false;
            }else{
                $scope.selectedRoles[index].selected = true;
            }
        }
    };

    $scope.saveUser = function (userData) {
        // Remove properties
        $scope.user.userCreated = null;
        $scope.user.mobile = null;
        $scope.submitted = true;

        if (!$scope.userForm.$valid) {
            alert('Please check your data input');
            $scope.busy = false;
            return false;
        }

        $scope.user.roles = [];
        angular.forEach($scope.selectedRoles,function (data, value) {
            if(data.selected){
                $scope.user.roles.push({roleId: data.roleId});
            }
        });

        if (userId) {
            $scope.busy = true;
            userService.updateUser(userData, userId)
                .success(function (data) {
                    alert('Succcessfully Updated!');
                    $location.path('/users');
                })
                .error(function(err){ errorDisplay.show(err); })
                .finally(function() {$scope.busy = false;} );
        }
        else {
            if(!$scope.user.password){
                $scope.checkChangePass = true;
                $scope.busy = false;
                return false;
            }
            $scope.user.mobile = $scope.user.phoneNumber;
            userService.addNewUser(userData)
                .success(function (data) {
                    $location.url('/users/' + data.id);
                })
                .error(function (err) {
                    alert(err);
                })
                .finally(function () {
                    $scope.busy = false;
                });
        }
    };

    // Load Employee on dropdown select change
    $scope.onSelectEmployee = function (employeeId) {
        var currentId = !$scope.user.employeeId ? null : $scope.user.employeeId;
        if (!currentId) {
            $scope.user.employeeId = null;
            return false;
        }

        if (employeeId != currentId) {
            // clear supplier object
            $scope.employee = null;

            if (employeeId) {
                supplierService.get(employeeId)
                    .success(function (data) {
                        $scope.employee = data;
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    }
});

USR.controller('UserAddressCtrl', function ($scope, $routeParams, userService) {
    $scope.showAddressForm = false;
    var userId = $routeParams.id;

    $scope.deleteAddress = function (address) {
        var index = $scope.user.addressList.indexOf(address);

        if (address.addressId) {
            bootstrapConfirm('Do you want to proceed to Delete?', function() {
                userService.deleteAddress(userId, address.addressId).success(function() {
                    $scope.user.addressList.splice(index, 1);
                });
            });
        } else {
            $scope.user.addressList.splice(index, 1);
        }
    };

    $scope.editAddress = function (address) {
        var addressToEdit = angular.copy(address);
        // reset newAddress scope to null
        $scope.newAddress = address;
        $scope.showAddressForm = true;
        $scope.mode = "edit";
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

        var index = $scope.user.addressList.indexOf($scope.newAddress);

        // if address not in addressList, add it in so that there's no duplicates
        if (index < 0) {
            $scope.user.addressList.push(addressToAdd);
        }

        // reset newAddress scope to null
        $scope.newAddress = {};
        $scope.mode = "";
        $scope.submitted = false;
    };
})

USR.controller('UserAsideCtrl', function ($scope, $debounce, userService) {
    $scope.saveInfoInprogress = false;
    var saveFinished = function () { $scope.saveInfoInprogress = false; };

    var saveDiscription = function (newVal, oldVal) {
        if (newVal === oldVal || oldVal == undefined) {
            return;
        }
        if ((newVal != oldVal) && (!$scope.saveInfoInprogress)) {
            var user = $scope.user;
            var saveUser = {
                userId: user.userId,
                description: newVal
            }
            $scope.saveInfoInprogress = true;
            userService.patch(saveUser, user.userId).then(saveFinished, saveFinished); // both success and error promises
        }
    };

    // 1000 = 1 second
    // The 'true' argument signifies that I want to do a 'deep' watch of my model.
    $scope.$watch('user.description', $debounce(saveDiscription, 1000), true);
});

///*
//Handle user update
//- init to get the existing user information
//- existing user id is pass through when user click on edit button
//- new user information is saved on $scope.new_user
//*/
//USR.controller('UserEditCtrl', function ($scope, $http, $routeParams, $location, errorDisplay, userService) {
//});

USR.controller('UserQuotationListCtrl', function ($scope, $http, $routeParams, $location, userService) {

    var userId = null;
    $scope.quotationArr = [];
    $scope.quotationSelected = {};

    var _init = function () {
        userId = $routeParams.id;

        if (userId) {
            userService.get(userId + "/quotations")
                .then(function (data) {
                    $scope.quotationArr = data.data;
                    $scope.num.quotations = $scope.quotationArr.length;
                })

            $scope.loadSalesorder = function (quotation) {
                $scope.selectedQuotation = quotation;
                $scope.loaded = true;
            };
        }
    }

    _init();
});

USR.controller('UserSalesOrderListCtrl', function ($scope, $http, $location, $routeParams, userService) {
    var userId = null;
    $scope.salesOrderArr = [];
    $scope.salesOrderSelected = {};

    var _init = function () {
        userId = $routeParams.id;

        if (userId) {
            userService.get(userId + "/salesOrders")
                .then(function (data) {
                    $scope.salesOrderArr = data.data;

                    // override root scope numbers
                    $scope.num.salesorders = $scope.salesOrderArr.length;
                })

            //$scope.loadSalesorder = function (salesorder) {
            //    $scope.selectedSalesorder = salesorder;
            //    $scope.loaded = true;
            //};
        }
    }

    _init();
});