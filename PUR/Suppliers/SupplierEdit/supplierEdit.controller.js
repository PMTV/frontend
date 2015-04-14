PUR.controller('SupplierListCtrl', function ($scope, $http, supplierService) {
    $scope.supplierTableData = null;

    var loadSupplier = function () {
        supplierService.query().success(function (data) {
            $scope.supplierTableData = data.results;
        })
    }

    $scope.deleteSupplier = function (customerId) {
        supplierService.delete(customerId)
            .success(function (data) {
                loadSupplier();
            })
            .error(function (error) {
                console.log(error);
            })
    };

    loadSupplier();
});

PUR.controller('SupplierCtrl', function ($scope, $timeout, $emerge, $rootScope, $firebase, Firebase, $interval, $http, $routeParams, $route, $location, $log, $translate, hotkeys, supplierService, errorDisplay) {

    var supplierId = $routeParams.id;

    $scope.supplier = {};

    $scope.supplier.contactList = [];
    $scope.supplier.addressList = [];

    // Address
    $scope.newAddress = {};
    $scope.showAddressForm = false;
    $scope.mode = null;

    // Numbers
    $scope.num = {};
    $scope.num.quotations = 0;
    $scope.num.salesorders = 0;
    $scope.num.notes = 0;
    $scope.num.tasks = 0;
    $scope.num.documents = 0;

    $scope.disableInput = true;

    var userName = $rootScope.appUser.userName,
        userId = $rootScope.appUser.userId;

    // or pass it arguments:
    hotkeys.add({
        combo: 'ctrl+s',
        description: 'Save Supplier',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            $scope.saveSupplier();
            event.preventDefault();
        }
    });

    var _init = function () {
        if (supplierId) {
            supplierService.get(supplierId)
                .success(function (data) {
                    $scope.supplier = data;

                    if ($emerge.firebaseRealTimeEnabled) {
                        $scope.firebaseSupplier(data);
                    }
                })
            .error(function (data, status, headers, config) {
                errorDisplay.show(data, status, headers, config);
            });
        }
    }

    $scope.firebaseSupplier = function (data) {
        //Firebase reference
        var suppliersRef = new Firebase($emerge.firebaseUrl + "/suppliers/");
        var suppliersRef2 = suppliersRef.child("SUP_" + supplierId);
        var suppliersRef3 = suppliersRef2.child("viewing");
        $scope.firebaseObj = {};
        $scope.firebaseObj2 = {};
        $scope.userList = [];

        $scope.firebaseObj = $firebase(suppliersRef2);
        $scope.firebaseObj.$on("loaded", function (data2) {

            if (!data2) {
                $log.log('Room not found, creating room.');
                $scope.userList = $firebase(suppliersRef3);
                suppliersRef3.child(userId).set(userName);

                $interval(
                    function () {
                        suppliersRef2.child('SUP').set(angular.fromJson(angular.toJson(data)));
                    }
                , 1000);
            }
            else {
                $log.log('Room found, listening.');
                $scope.userList = $firebase(suppliersRef3);
                suppliersRef3.child(userId).set(userName, function (result) { });

                _reSet = function () {
                    $timeout(function () {
                        suppliersRef2.once("value", function (data3) {
                            if (data3.val() != null) {
                                $scope.supplier = data3.val().SUP;
                            }
                            _reSet();
                        });
                    }, 1000)
                };
                _reSet();

                $scope.supplier = data2.SUP;
            }

            suppliersRef2.child("viewing").child(userId).onDisconnect().remove();
            suppliersRef3.on("child_removed", function (data) {
                suppliersRef3.once("value", function (data) {
                    var userList = _.filter(data.val(), function (e) {
                        return e;
                    });

                    if ((userList.length - 1) < 1) {
                        suppliersRef2.onDisconnect().remove();
                    }
                });
            });

            suppliersRef3.on("value", function (data) {
                var userList = _.filter(data.val(), function (e) {
                    return e;
                });

                if ((userList.length) == 1) {
                    suppliersRef2.onDisconnect().remove();
                } else {
                    suppliersRef2.onDisconnect().cancel();
                    suppliersRef2.child("viewing").child(userId).onDisconnect().remove();
                }
            });
        });
    }

    $scope.onChangedStatus = function (status) {
        if (status) {
            $scope.supplier.status = 1;
        }
        else {
            $scope.supplier.status = 0;
        }
    }

    $scope.saveSupplier = function () {
        $scope.submitted = true;

        if (!$scope.myForm.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }

        $scope.busy = true;

        if (supplierId) {
            supplierService.update($scope.supplier)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                    $route.reload();
                })
                .error(function (d) {
                    errorDisplay.show(d);
                })
            .finally(function () {
                $scope.busy = false;
            });
        }
        else {
            supplierService.add($scope.supplier)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('/suppliers/' + data.supplierId);
                })
                .error(function (d) {
                    errorDisplay.show(d);
                })
            .finally(function () {
                $scope.busy = false;
            });
        }
    };
    _init();
});

//CRM.controller('SupplierContactCtrl', function ($scope, $routeParams, supplierService) {
//    $scope.showContactForm = false;
//    var supplierId = $routeParams.id;

//    $scope.deleteContact = function (contact) {
//        var index = $scope.supplier.contactList.indexOf(contact);

//        if (contact.contactId) {
//            if (confirm('Do you want to proceed to Delete?')) {
//                supplierService.deleteContact(supplierId, contact.contactId).success(function () {
//                    $scope.supplier.contactList.splice(index, 1);
//                });
//            }
//        } else {
//            $scope.supplier.contactList.splice(index, 1);
//        }
//    };

//    $scope.editContact = function (contact) {
//        var contactToEdit = angular.copy(contact);
//        // reset newAddress scope to null
//        $scope.newContact = contact;
//        $scope.showContactForm = true;
//        $scope.mode = "edit";
//    };

//    $scope.addContact = function () {
//        $scope.submitted = true;

//        if (!$scope.contactForm.$valid) {
//            return false;
//        }

//        // Hide the edit address form
//        $scope.showContactForm = false;

//        var contactToAdd = angular.copy($scope.newContact);

//        var index = $scope.supplier.contactList.indexOf($scope.newContact);

//        // if address not in addressList, add it in so that there's no duplicates
//        if (index < 0) {
//            $scope.supplier.contactList.push(contactToAdd);
//        }

//        // reset newAddress scope to null
//        $scope.newContact = {};
//        $scope.mode = "";
//        $scope.submitted = false;
//    };
//})

//CRM.controller('SupplierAddressCtrl', function ($scope, supplierService) {
//    $scope.showAddressForm = false;

//    $scope.deleteAddress = function (address) {
//        var index = $scope.supplier.addressList.indexOf(address);

//        if (address.addressId) {
//            if (confirm($translate.instant('ALERT.DELETING'))) {
//                supplierService.deleteAddress($scope.supplier.supplierId, address.addressId).success(function () {
//                    $scope.supplier.addressList.splice(index, 1);
//                });
//            }
//        } else {
//            $scope.supplier.addressList.splice(index, 1);
//        }
//    };

//    $scope.editAddress = function (address) {
//        var addressToEdit = angular.copy(address);
//        // reset newAddress scope to null
//        $scope.newAddress = address;
//        $scope.showAddressForm = true;
//        $scope.mode = "edit";
//    };

//    $scope.addAddress = function () {
//        $scope.submitted = true;

//        if (!$scope.addressForm.$valid) {
//            return false;
//        }

//        // Hide the edit address form
//        $scope.showAddressForm = false;

//        var addressToAdd = angular.copy($scope.newAddress);

//        var index = $scope.supplier.addressList.indexOf($scope.newAddress);

//        // if address not in addressList, add it in so that there's no duplicates
//        if (index < 0) {
//            $scope.supplier.addressList.push(addressToAdd);
//        }

//        // reset newAddress scope to null
//        $scope.newAddress = {};
//        $scope.mode = "";
//        $scope.submitted = false;
//    };
//})

PUR.controller('SupplierAsideCtrl', function ($scope, $debounce, supplierService) {
    $scope.saveInfoInprogress = false;
    var saveFinished = function () { $scope.saveInfoInprogress = false; };

    var saveDiscription = function (newVal, oldVal) {
        if (newVal === oldVal || oldVal == undefined) {
            return;
        }
        if ((newVal != oldVal) && (!$scope.saveInfoInprogress)) {
            var supplier = $scope.supplier;
            var saveSupplier = {
                supplier: supplier.SupplierId,
                remarks: newVal
            }
            $scope.saveInfoInprogress = true;
            supplierService.patch(saveSupplier, supplier.supplierId).then(saveFinished, saveFinished); // both success and error promises
        }
    };

    // 1000 = 1 second
    // The 'true' argument signifies that I want to do a 'deep' watch of my model.
    $scope.$watch('supplier.remarks', $debounce(saveDiscription, 1000), true);
});

PUR.controller('SupplierPurchaseListCtrl', function ($scope, $http, $routeParams, $location, supplierService) {

    var customerId = null;
    $scope.purchaseArr = [];
    $scope.purchaseSelected = {};

    var _init = function () {
        customerId = $routeParams.id;

        if (customerId) {
            supplierService.get(customerId + "/purchases")
                .then(function (data) {
                    $scope.purchaseArr = data.data;

                    $scope.num.purchases = $scope.purchaseArr.length;
                })
        }
    }

    _init();
});

PUR.controller('SupplierImportCtrl', function ($scope, $controller, importExcelService, $http, $translate, errorDisplay) {
    $controller('ImportExcelCtrl', { $scope: $scope });

    var suppliersData = $scope.suppliersData = null;
    $scope.dropdownLoad = "Supplier";
    $scope.linkAll = "#/suppliers";

    $scope.tabTable = 'PUR/Suppliers/SupplierEdit/Import/tabTable.html?a=a';

    $scope.mappingNext = function () {
        var supplier = $scope.excelColumnList;
        importExcelService.getExcelData($scope.uploadFileName, $scope.dropdownLoad, supplier)
            .success(function (data) {
                $scope.suppliersData = data;
                suppliersData = data;
                $scope.loadNewLayout(3);
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
        ;
    };

    $scope.tableNext = function () {
        var i = $scope.suppliersData.length;
        while (i--) {
            if ($scope.suppliersData[i].isCheck == true) {
                $scope.suppliersData.splice(i, 1);
            }
        }
        importExcelService.importSuppliers($scope.suppliersData)
            .success(function (data) {
                $scope.notify = data;
                $scope.loadNewLayout(4);
            });
    };

});