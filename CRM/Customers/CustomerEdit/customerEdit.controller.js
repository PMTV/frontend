/*
Get all the customer information
- $scope.deleteFn is called to delete a particular customer
- customer id is stored once user click on delete button
*/
CRM.controller('CustomerListCtrl', function ($upload, $scope, $http, customerService, mediaService, $translate, errorDisplay) {
    $scope.customers = [];

    var selectedCustomers = $scope.selectedCustomers = [];

    $scope.columnDefs = [
            { field: 'customerId', displayName: '', cellTemplate: '<div class="ngCellText btn-link" tooltip="Quick Preview" tooltip-placement="top" tooltip-append-to-body="true"><button-customer-preview customer-id="{{row.entity.customerId}}"><i class="fa fa-search-plus"></i></button-customer-preview></div>', sortable: false, headerClass: 'unsortable', width: '2%' },
            { field: 'companyName', displayName: 'Company Name' },
            { field: 'code', displayName: 'Customer Code' },
            { field: 'firstName', displayName: 'First Name' },
            { field: 'lastName', displayName: 'Last Name' },
            { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date', visible: false },
            { field: 'customerId', displayName: 'Actions', cellTemplate: '<a href="#/customers/{{row.entity.customerId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.customerId)">Delete</a>', sortable: false, headerClass: 'unsortable' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
//        checkboxHeaderTemplate: '<input class="ngSelectionHeader" type="checkbox" ng-model="checkAll" ng-change="doCheckAll(checkAll)"/>',
        checkboxCellTemplate: '<input class="ngSelectionHeader" type="checkbox" ng-model="selectedRow" ng-change="getCustomerLocation(row.entity)"/>'
    };

});

CRM.controller('CustomerEditCtrl', function ($scope, $timeout, $emerge, $rootScope, $interval, Firebase, $firebase, $http, $route, $modal, $routeParams, $location, $translate, hotkeys, customerService, errorDisplay, $log) {
    $scope.customer = {};
    $scope.customer.contactList = [];
    $scope.customer.addressList = [];
    var customerId = $routeParams.id;
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

    $scope.userList = [];

    $scope.disableInput = true;
    var userName = $rootScope.appUser.userName,
        userId = $rootScope.appUser.userId;

    $scope.firebaseObj = {};
    $scope.firebaseObj2 = {};

    hotkeys.add({
        combo: 'ctrl+s',
        description: 'Save Customer',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            $scope.saveCustomer();
            event.preventDefault();
        }
    });

    var _init = function () {
        customerId = $routeParams.id;

        // If route has customer Id, proceed to load Customer
        if (customerId) {
            customerService.get(customerId)
                .success(function (data) {
                    $scope.customer = data;

                    if ($emerge.firebaseRealTimeEnabled) {
                        console.info('Enter firebase');
                        $scope.firebaseCustomer(data);
                    }
                })
            .error(function (data, status, headers, config) {
                errorDisplay.show(data, status, headers, config);
            });
        }
    }

    $scope.firebaseCustomer = function (data) {
            console.log('enter function')
        //Firebase reference
        var customersRef = new Firebase($emerge.firebaseUrl + "/customers/");
        var customersRef2 = customersRef.child("CRM_" + customerId);
        var customersRef3 = customersRef2.child("viewing");
        var idRef = customersRef.child("id");

        $scope.firebaseObj = $firebase(customersRef2);
        $scope.firebaseObj.$on("loaded", function (data2) {

            if (!data2) {
                $log.log('Room not found, creating room.');
                $scope.userList = $firebase(customersRef3);
                customersRef3.child(userId).set(userName);

                customersRef2.child('CRM').set(data);
                $interval(
        function () {
            customersRef2.child('CRM').set($scope.customer);
        }
                , 2000);
            }
            else {
                $log.log('Room found, listening.');
                $scope.userList = $firebase(customersRef3);
                customersRef3.child(userId).set(userName, function (result) { });

                _reSet = function () {
                    $timeout(function () {
                        customersRef2.once("value", function (data3) {
                            alert(data3);
                            if (data3.val() != null) {
                                $scope.customer = data3.val().CRM;
                                // $scope.supplier.supplierId = data3.val().SUP.supplier;
                            }
                            _reSet();
                        });
                    }, 1000)
                };
                _reSet();
                // alert(angular.toJson(data2.SUP));
                $scope.customer = data2.CRM;

            }

            customersRef2.child("viewing").child(userId).onDisconnect().remove();
            customersRef3.on("child_removed", function (data) {
                customersRef3.once("value", function (data) {
                    var userList = _.filter(data.val(), function (e) {
                        return e;
                    });

                    if ((userList.length - 1) < 1) {
                        customersRef2.onDisconnect().remove();
                    }
                });
            });

            customersRef3.on("value", function (data) {
                var userList = _.filter(data.val(), function (e) {
                    return e;
                });

                if ((userList.length) == 1) {
                    customersRef2.onDisconnect().remove();
                } else {
                    customersRef2.onDisconnect().cancel();
                    customersRef2.child("viewing").child(userId).onDisconnect().remove();
                }
            });
        });
    }

    $scope.onChangedStatus = function (status) {
        // console.log(status);
        if (status) {
            $scope.customer.status = 1;
        }
        else {
            $scope.customer.status = 0;
        }
        // alert(status);
    }

    $scope.saveCustomer = function () {
        $scope.submitted = true;

        // Remove properties
        $scope.customer.userCreated = null;
        $scope.customer.quotationsList = null;
        $scope.customer.salesOrdersList = null;

        //if (!$scope.customerForm.$valid) {
        //    alert($translate.instant('ALERT.FORM_ERROR'));
        //    return false;
        //}

        $scope.busy = true;

        if (customerId) {
            customerService.update($scope.customer)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                    $route.reload();
                })
                .error(function (err) {
                    errorDisplay.show(err);
                })
            .finally(function () {
                $scope.busy = false;
            });
        }
        else {
            customerService.add($scope.customer)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('/customers/' + data.customerId);
                })
                .error(function (err) {
                    errorDisplay.show(err);
                })
            .finally(function () {
                $scope.busy = false;
            });
        }
    };

    $scope.deleteCustomer = function (id) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            customerService.delete(id)
                    .success(function (data) {
                        $location.url('/customers');
                    })
                    .error(function (error) {
                        //console.log(error);
                    })
        }
    };

    $scope.addCreditNote = function () {
        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-preview',
            keyboard: true,
            templateUrl: 'CRM/Customers/CustomerEdit/Modal/customerCreditNote.modal.html?a=a',
            controller: function ($scope, $log, $modalInstance, invoiceService, receiptService, customer, openCreditNoteService, $filter) {

                $scope.customer = customer;
                $scope.newCustomer = {};
                $scope.newCustomer.customerId = customer.customerId;

                $scope.onChangedCustomer = function (customerId) {
                    $scope.newCustomer.customerId = customerId;
                }

                $scope.onChangedCurrencies = function (currencyId) {
                    $scope.newCustomer.currencyId = currencyId;
                }

                $scope.ok = function () {
                    openCreditNoteService.add($scope.newCustomer)
                        .success(function (data) {
                            alert($translate.instant('ALERT.CREATED'));
                            $modalInstance.close();
                        })
                        .error(function (error) {
                            errorDisplay.show(error);
                        })
                        .finally(function () {
                            $scope.busy = false;
                        });

                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                customer: function () {
                    return $scope.customer;
                }
            }
        });
    }
    _init();
});

//CRM.controller('CustomerAddressCtrl', function ($scope, $routeParams, customerService) {
//    $scope.showAddressForm = false;
//    var customerId = $routeParams.id;

//    $scope.deleteAddress = function (address) {
//        var index = $scope.customer.addressList.indexOf(address);

//        if (address.addressId) {
//            if (confirm($translate.instant('ALERT.DELETING'))) {
//                customerService.deleteAddress(customerId, address.addressId).success(function () {
//                    $scope.customer.addressList.splice(index, 1);
//                });
//            }
//        } else {
//            $scope.customer.addressList.splice(index, 1);
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

//        var index = $scope.customer.addressList.indexOf($scope.newAddress);

//        // if address not in addressList, add it in so that there's no duplicates
//        if (index < 0) {
//            $scope.customer.addressList.push(addressToAdd);
//        }

//        // reset newAddress scope to null
//        $scope.newAddress = {};
//        $scope.mode = "";
//        $scope.submitted = false;
//    };
//});

//CRM.controller('CustomerContactCtrl', function ($scope, $routeParams, customerService) {
//    $scope.showContactForm = false;
//    var customerId = $routeParams.id;

//    $scope.deleteContact = function (contact) {
//        var index = $scope.customer.contactList.indexOf(contact);

//        if (contact.contactId) {
//            if (confirm($translate.instant('ALERT.DELETING'))) {
//                customerService.deleteContact(customerId, contact.contactId).success(function () {
//                    $scope.customer.contactList.splice(index, 1);
//                });
//            }
//        } else {
//            $scope.customer.contactList.splice(index, 1);
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

//        var index = $scope.customer.contactList.indexOf($scope.newContact);

//        // if address not in addressList, add it in so that there's no duplicates
//        if (index < 0) {
//            $scope.customer.contactList.push(contactToAdd);
//        }

//        // reset newAddress scope to null
//        $scope.newContact = {};
//        $scope.mode = "";
//        $scope.submitted = false;
//    };
//})

CRM.controller('CustomerAsideCtrl', function ($scope, $debounce, customerService) {
    $scope.saveInfoInprogress = false;
    var saveFinished = function () { $scope.saveInfoInprogress = false; };

    var saveDiscription = function (newVal, oldVal) {
        if (newVal === oldVal || oldVal == undefined) {
            return;
        }
        if ((newVal != oldVal) && (!$scope.saveInfoInprogress)) {
            var customer = $scope.customer;
            var saveCustomer = {
                customerId: customer.customerId,
                description: newVal
            }
            $scope.saveInfoInprogress = true;
            customerService.patch(saveCustomer, customer.customerId).then(saveFinished, saveFinished); // both success and error promises
        }
    };

    // 1000 = 1 second
    // The 'true' argument signifies that I want to do a 'deep' watch of my model.
    $scope.$watch('customer.description', $debounce(saveDiscription, 1000), true);
});

///*
//Handle customer update
//- init to get the existing customer information
//- existing customer id is pass through when user click on edit button
//- new customer information is saved on $scope.new_customer
//*/
//CRM.controller('CustomerEditCtrl', function ($scope, $http, $routeParams, $location, errorDisplay, customerService) {
//});

CRM.controller('CustomerQuotationListCtrl', function ($scope, $http, $routeParams, $location, customerService, quotationService) {

    var customerId = null;
    $scope.quotationArr = [];
    $scope.quotationSelected = {};

    var _init = function () {
        customerId = $routeParams.id;

        if (customerId) {
            customerService.get(customerId + "/quotations")
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

    $scope.getQuotationStatus = function (id) {
        var arr = quotationService.getStatus();
        var status = arr[id - 1];

        if (status) {
            return status.name;
        } else {
            return "";
        }
    }

    _init();
});

CRM.controller('CustomerSalesListCtrl', function ($scope, $http, $location, $routeParams, customerService, salesService) {
    var customerId = null;
    $scope.salesOrderArr = [];
    $scope.quotationsArr = [];
    $scope.salesOrderSelected = {};

    var _init = function () {
        customerId = $routeParams.id;

        if (customerId) {
            customerService.get(customerId + "/salesOrders")
                .then(function (data) {
                    $scope.salesOrderArr = data.data;

                    $scope.num.salesorders = $scope.salesOrderArr.length;
                })

            customerService.get(customerId + "/quotations")
                .then(function (data) {
                    $scope.quotationsArr = data.data;

                    $scope.num.quotations = $scope.quotationsArr.length;
                })
        }
    };

    $scope.getSalesStatus = function (id) {
        var arr = salesService.getStatus(id);
        var status = arr[id - 1];

        if (status) {
            return status.name;
        } else {
            return "";
        }
    };

    _init();
});

CRM.controller('CustomerImportCtrl', function ($scope, $controller, importExcelService, salesService, $http, $translate, errorDisplay) {
    $controller('ImportExcelCtrl', { $scope: $scope });

    var customersData = $scope.customersData = null;
    $scope.dropdownLoad = "Customer";
    $scope.linkAll = "#/customers";

    $scope.tabTable = 'CRM/Customers/CustomerEdit/Import/tabTable.html?a=a';

    $scope.mappingBack = function() {
        $scope.loadNewLayout(3);
    };

    $scope.mappingNext = function () {
        var customer = $scope.excelColumnList;
        importExcelService.getExcelData($scope.uploadFileName, $scope.dropdownLoad, customer)
            .success(function (data) {
                $scope.customersData = data;
                customersData = data;
                $scope.loadNewLayout(3);
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
        ;
    };

    $scope.tableNext = function () {
        var i = $scope.customersData.length;
        while (i--) {
            if ($scope.customersData[i].isCheck == true) {
                $scope.customersData.splice(i, 1);
            }
        }
        importExcelService.importCustomers($scope.customersData)
            .success(function (data) {
                $scope.notify = data;
                $scope.loadNewLayout(4);
        });
    };

});
