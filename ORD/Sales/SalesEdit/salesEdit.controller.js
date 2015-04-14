// CONTROLLERS

// Sales Order List Controller
ORD.controller('SalesListCtrl', function ($scope, $http, salesService, errorDisplay) {
    $scope.sales = [];
    var selectedSales = $scope.selectedSales = [];

    $scope.columnDefs = [
            { field: 'quotationId', displayName: '', cellTemplate: '<div class="ngCellText"><a href="#/quotations/{{row.entity.quotationId}}" tooltip="View Quotation" tooltip-placement="right" tooltip-append-to-body="true" ng-show="{{row.entity.quotationId}}"><i class="fa fa-file-text fa-large" /></a></div>', sortable: false, headerClass: 'unsortable', width: '3%' },
            { field: 'salesOrderNumber', displayName: '#Sales Order Number' },
            { field: 'customer.companyName', displayName: 'Company Name' },
            { field: 'salesOrderStatusId', displayName: 'Status', cellTemplate: '<div class="ngCellText">{{row.entity.salesOrderStatusId | salesStatus:row.entity.settings.isApproved}}</div>' },
            { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date', visible: false },
            { field: 'salesOrderId', displayName: 'Actions', cellTemplate: '<a href="#/sales/{{row.entity.salesOrderId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.salesOrderId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        showSelectionCheckbox: false
    };
});

// Sales Order Edit Controller
ORD.controller('SalesEditCtrl', function ($scope, $timeout, $emerge, $interval, $rootScope, $firebase, Firebase, $http, $route, $routeParams, $timeout, $location, $filter, $modal, $translate, hotkeys, errorDisplay, salesService, customerService, productService, $log) {
    var salesId = $routeParams.id;
    $scope.customer = {};
    $scope.selected = {}; // to use with customersDropdown directive
    $scope.customerId;

    $scope.totalQuantity = 0;
    $scope.totalPrice = 0;
    $scope.totalGST = 0;
    $scope.totalGrand = 0;

    $scope.busy = false;
    $scope.converting = false;

    $scope.disableInput = true;
    var userName = $rootScope.appUser.userName,
        userId = $rootScope.appUser.userId;

    hotkeys.add({
        combo: 'ctrl+s',
        description: 'Save Sales Order',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            $scope.saveSales();
            event.preventDefault();
        }
    });

    // SELECT2 AJAX EXAMPLE * DO NOT REMOVE
    $scope.select2Tags = {
        minimumInputLength: 3,
        'multiple': true,
        'simple_tags': true,
        'tags': [],  // Can be empty list.
    };

    $scope.selectStatus = function (statusId) {
        $scope.changingStatus = true;

        salesService.updateStatus(salesId, statusId)
            .success(function (data) {
                // if status set back to "Pending Approval", set "isApproved" to false
                if (statusId == 3) {
                    $scope.sales.settings.isApproved = false;
                };
                $scope.sales.salesOrderStatusId = statusId;
                alert($translate.instant('ALERT.UPDATED'));
            })
            .error(function (error, status) {
                // if error is 403 (forbidden), set "isApproved" to false
                if (status == 403) {
                    $scope.sales.settings.isApproved = false;
                };
                errorDisplay.show(error);
                $log.error(error);
            })
        .finally(function () {
            $scope.changingStatus = false;
        });
    };

    var _init = function () {

        $scope.sales = {};
        $scope.newSalesItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        $scope.statusArr = salesService.getAllStatus();

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (salesId) {
            // Load Sales with salesId
            salesService.get(salesId).success(function (data) {
                // copy the result into scope model
                // angular.copy(data, $scope.sales);
                $scope.sales = data;
                $scope.sales.tax = $filter('number')($scope.sales.tax * 100, 2);

                if ($emerge.firebaseRealTimeEnabled) {
                    $scope.firebaseSales(data);
                }

                // explicitly set details as result details
                if (data.salesOrderDetailsList.length) {
                    angular.forEach(data.salesOrderDetailsList, function (value, key) {
                        value.description = value.product.description;
                    });
                    $scope.sales.salesOrderDetailsList = data.salesOrderDetailsList;
                } else {
                    $scope.sales.salesOrderDetailsList = [{}];
                }

                $scope.busy = false;
            })
            .error(function (data, status, headers, config) {
                errorDisplay.show(data, status, headers, config);
            });
        } else {
            $scope.sales.salesOrderDetailsList = [{}];
            $scope.busy = false;
        }
    };

    $scope.changeItemDescription = function (item) {
        console.log(item);
        if(item.product!=undefined && item.product.description){
            return item.product.description;
        }
        return item.description
    };

    $scope.firebaseSales = function (data) {
        //Firebase reference
        var salesRef = new Firebase($emerge.firebaseUrl + "/sales/");
        var salesRef2 = salesRef.child("Sales_" + salesId);
        var salesRef3 = salesRef2.child("viewing");

        $scope.userList = [];

        $scope.firebaseObj = {};
        $scope.firebaseObj2 = {};

                $scope.firebaseObj = $firebase(salesRef2);
                $scope.firebaseObj.$on("loaded", function (data2) {

                    if (!data2) {
                $log.log('Room not found, creating room.');
                        $scope.userList = $firebase(salesRef3);
                        salesRef3.child(userId).set(userName);

                        $interval(
                            function () {
                                salesRef2.child('Sales').set(angular.fromJson(angular.toJson(data)));
                            }
                        , 1000);
                    }
                    else {
                $log.log('Room found, listening.');
                        $scope.userList = $firebase(salesRef3);
                        salesRef3.child(userId).set(userName, function (result) { });

                        _reSet = function () {
                            $timeout(function () {
                                salesRef2.once("value", function (data3) {
                                    if (data3.val() != null) {
                                        $scope.sales = data3.val().Sales;
                                        // $scope.sales.supplierId = data3.val().PO.supplier;
                                    }
                                    _reSet();
                                });
                            }, 1000)
                        };
                        _reSet();

                        $scope.sales = data2.Sales;

                    }

                    salesRef2.child("viewing").child(userId).onDisconnect().remove();
                    salesRef3.on("child_removed", function (data) {
                        salesRef3.once("value", function (data) {
                            var userList = _.filter(data.val(), function (e) {
                                return e;
                            });

                            if ((userList.length - 1) < 1) {
                                salesRef2.onDisconnect().remove();
                            }
                        });
                    });

                    salesRef3.on("value", function (data) {
                        var userList = _.filter(data.val(), function (e) {
                            return e;
                        });

                        if ((userList.length) == 1) {
                            salesRef2.onDisconnect().remove();
                        } else {
                            salesRef2.onDisconnect().cancel();
                            salesRef2.child("viewing").child(userId).onDisconnect().remove();
                        }
                    });
                });
    }

    $scope.cancelSalesOrder = function () {
        if (confirm($translate.instant('ALERT.CANCELLING'))) {
            $scope.cancelling = true;
            salesService.delete(salesId).success(function (data) {
                alert($translate.instant('ALERT.CANCELLED'));
                $location.url('sales');
            })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.cancelling = false;
                });
                }
    };

    $scope.sendApproval = function () {
        if (confirm($translate.instant('ALERT.APPROVAL_SEND'))) {
            $scope.approving = true;
            salesService.sendApproval(salesId).success(function (data) {
                alert($translate.instant('ALERT.SENT'));
                    $location.url('sales');
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.approving = false;
            });
    }
    };

    $scope.approve = function () {
        if (confirm($translate.instant('ALERT.APPROVAL_APPROVING'))) {
            $scope.approving = true;
            salesService.approve(salesId).success(function (data) {
                alert($translate.instant('ALERT.APPROVAL_APPROVED'));
                $location.url('sales');
            })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.approving = false;
            });
        }
    };

    // process the form
    $scope.saveSales = function () {
        var i = $scope.sales.salesOrderDetailsList.length;
        while (i--) {
            if (!$scope.sales.salesOrderDetailsList[i].productId) {
                $scope.sales.salesOrderDetailsList.splice(i, 1);
            }
        }

        $timeout(function () {
            var newSales = {};
            angular.copy($scope.sales, newSales);
            newSales.tax = newSales.tax/100;
            $scope.busy = true;
            // set scope variable submitted to true to force validation
            $scope.submitted = true;
            newSales.tags = $scope.sales.tags ? $scope.sales.tags.join() : '';

            // check if the form is valid
            if (!$scope.myForm.$valid) {
                $scope.busy = false;
                alert($translate.instant('ALERT.FORM_ERROR'));
                return false;
            }

            // if salesId not empty update, else add
            if (salesId) {
                // Check if isApprovalRequired and if isApproved, if yes, prompt saving will resend for Approval process
                if (newSales.settings.isApprovalRequired && newSales.settings.isApproved) {
                    if (confirm($translate.instant('ALERT.APPROVAL_RESEND', { type: 'Sales Order' }))) {

                    } else {
                        $scope.busy = false;
                        return;
                    }
                }

                salesService.put(salesId, newSales)
                    .success(function (data) {
                        alert($translate.instant('ALERT.UPDATED'));
                        $route.reload();
                    })
                    .error(function (error) {
                        console.log(error);
                        errorDisplay.show(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                salesService.add(newSales)
                    .success(function (data) {
                        alert($translate.instant('ALERT.CREATED'));
                        $location.url('sales/' + data.salesOrderId);
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });;
            }
        });
    };

    $scope.createProformaInvoice = function () {
        console.log("creating proforma");
    }

    $scope.onChangedTaxable = function (status) {
        // console.log(status);
        if (status) {
            $scope.sales.isTaxable = 1;
        }
        else {
            $scope.sales.isTaxable = 0;
        }
        // alert(status);
    }

    $scope.openSalesPDF = function (sales) {
        var salesOrderId = sales.salesOrderId;

        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'ORD/Sales/SalesEdit/salesPDF.modal.html?a=aaaa',
            controller: function ($scope, $log, $modalInstance, salesService, $filter, $sce, errorDisplay) {
                // assign new $scope.sales to show in modal frontend for PDF Customized
                $scope.sales = sales;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    salesService.getPDF(sales.salesOrderId)
                        .success(function (data) {
                            // on success, open the pdf in iFrame
                            var file = new Blob([data], { type: 'application/pdf' });
                            var fileURL = URL.createObjectURL(file);
                            $scope.pdfUrl = $sce.trustAsResourceUrl(fileURL);
                        })
                        .error(function (data, status, headers, config) {
                            if (status == 403) {
                                alert($translate.instant('ALERT.APPROVAL_REQUIRED'));
                                return;
                            }

                            errorDisplay.show(data, status, headers, config);
                        })
                        .finally(function () {
                            $scope.loading = false;
                        });
                }

                // init Preview PDF
                $scope.previewPDF();

                $scope.saveCustomized = function (sales) {
                    salesService.patch(salesOrderId, sales)
                        .success(function (data) {
                            alert($translate.instant('ALERT.UPDATED'));
                        })
                        .error(function (error) {
                            errorDisplay.show(error);
                            $log.error(error);
                        });
                }

                // open email dialog
                $scope.openEmail = function () {
                    $modal.open({
                        backdrop: 'static',
                        windowClass: 'modal-md',
                        keyboard: true,
                        templateUrl: 'ORD/Sales/SalesEdit/salesPDFEmail.modal.html?a=a',
                        controller: function ($scope, $log, $modalInstance, errorDisplay) {
                            $scope.email = {};
                            // set the initial message for the email body
                            $scope.email.body = "Dear Sir / Madam, <br/><br/>Attached is a copy of Sales Order.<br/><br/><br/>For additional enquires, please contact Us <br/><br/>Thank you.<br/><br/><br/>";

                            if ($scope.customer)
                                $scope.email.recipientEmail = $scope.customer.email;

                            $scope.sendEmail = function (emailForm) {
                                $scope.busyEmail = true;

                                // check if the form is valid
                                if (!emailForm.$valid) {
                                    $scope.busyEmail = false;
                                    alert($translate.instant('ALERT.FORM_ERROR'));
                                    return false;
                                }

                                // call api to send email
                                salesService.emailPDF(salesOrderId, $scope.email)
                                    .success(function (data) {
                                        alert($translate.instant('ALERT.SENT'));
                                    })
                                    .error(function (error) {
                                        errorDisplay.show(error);
                                        $log.error(error);
                                    })
                                    .finally(function () {
                                        $scope.busyEmail = false;
                                    });
                            }

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };
                        }
                    });
                };

                $scope.ok = function () {
                    $modalInstance.close();
                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        });
    }

    $scope.preview = function (sales) {
        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-preview',
            keyboard: true,
            templateUrl: 'ORD/Sales/sales.print.html?a=a',
            controller: function ($scope, $log, $modalInstance, productService, $filter, getTotalPrice, getTotalQuantity) {

                $scope.sales = sales;

                $scope.getTotalPrice = function () {
                    return getTotalPrice;
                }
                $scope.getTotalQuantity = function () {
                    return getTotalQuantity;
                }

                $scope.ok = function () {
                    $modalInstance.close();
                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                getTotalPrice: function () {
                    return $scope.getTotalPrice();
                },
                getTotalQuantity: function () {
                    return $scope.getTotalQuantity();
                }
            }
        });
    }

    $scope.convertToDeliveryOrder = function () {
        var newSales = {};

        angular.copy($scope.sales, newSales);

        if (confirm('Convert Sales Order to Delivery Order?')) {
            $scope.converting = true;
            salesService.convertToDelivery(salesId, newSales)
                .success(function (data) {
                    alert($translate.instant('ALERT.CONVERTED'));
                    $route.reload();
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.converting = false;
                });
        }
    }

    $scope.convertToInvoice = function () {
        var newSales = {};

        angular.copy($scope.sales, newSales);

        if (confirm('Convert Sales Order to Invoice?')) {
            salesService.convertToInvoice(salesId, newSales)
                .success(function (data) {
                    alert('Successfully Converted');
                    $route.reload();
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });
        }
    }

    $scope.copySalesOrder = function () {

        if ($translate.instant('ALERT.DUPLICATING')) {
            $scope.duplicating = true;
            salesService.duplicate(salesId)
                .success(function (data) {
                    // alert(data.salesOrderId);
                    alert($translate.instant('ALERT.DUPLICATED'));
                    $location.url('/sales/' + data.salesOrderId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.duplicating = false;
                });
        }
    }

    $scope.getUOMNumber = function (uomId, uomList) {
        var returnValue = 1;

        angular.forEach(uomList, function (key, value) {
            if (key.productUOMId == uomId) {
                returnValue = key.value;
                return false;
            };
        });

        return returnValue;
    }

    $scope.findAddress = function (type, postal) {
        $scope.searchBillAddress = true;
        $scope.searchShipAddress = true;

        $http.jsonp("http://www.gothere.sg/maps/geo?output=&q=" + postal + "&client=&sensor=false&callback=JSON_CALLBACK")
            .success(function (data) {
                $scope.searchBillAddress = false;
                $scope.searchShipAddress = false;
                if (data && data.Status.code !== 603) {
                    if (type === "Billing") {
                        $scope.sales.billAddress = data.Placemark[0].AddressDetails.Country.Thoroughfare.ThoroughfareName;
                    } else {
                        $scope.sales.shipAddress = data.Placemark[0].AddressDetails.Country.Thoroughfare.ThoroughfareName;
                    }
                } else {
                    alert($translate.instant('ALERT.NOT_FOUND_TYPE'));
                }
        });
    }

    $scope.selectAddress = function (address, addressType) {
        if (addressType == 'Shipping') {
            $scope.sales.shipName = $scope.customer.companyName;
            $scope.sales.shipAddress = address.fullAddress;
            $scope.sales.shipCity = address.countryCity;
            //$scope.sales.shipRegion = address.
            $scope.sales.shipPostalCode = address.postalCode;
            $scope.sales.shipCountry = address.country.name;

        } else if (addressType == 'Billing') {
            $scope.sales.billName = $scope.customer.companyName;
            $scope.sales.billAddress = address.fullAddress;
            $scope.sales.billCity = address.countryCity;
            //$scope.sales.shipRegion = address.
            $scope.sales.billPostalCode = address.postalCode;
            $scope.sales.billCountry = address.country.name;
        }
    }

    $scope.editAddress = function (addressType) {
        $scope.showEditBilling = false;
        $scope.showEditShipping = false;
        if (addressType == 'Shipping') {
            $scope.showEditBilling = true;
        } else if (addressType == 'Billing') {
            $scope.showEditShipping = true;
        }
    }

    $scope.removeAddress = function (addressType) {
        if (addressType == 'Shipping') {
            $scope.sales.shipName = null;
            $scope.sales.shipAddress = null;
            $scope.sales.shipCity = null;
            //$scope.sales.shipRegion = address.
            $scope.sales.shipPostalCode = null;
            $scope.sales.shipCountry = null;

        } else if (addressType == 'Billing') {
            $scope.sales.billName = null;
            $scope.sales.billAddress = null;
            $scope.sales.billCity = null;
            //$scope.sales.shipRegion = address.
            $scope.sales.billPostalCode = null;
            $scope.sales.billCountry = null;
        }
    }

    // Add item into $scope.sales.salesOrderDetailsList
    $scope.addItem = function () {
        $scope.sales.salesOrderDetailsList.push({});
    }

    // Remove item from $scope.sales.salesOrderDetailsList
    $scope.removeItem = function (index, salesOrderDetailsId) {
        var salesId = $routeParams.id;
        // check if salesOrderDetailsId is null, if not null, call delete item API
        if (salesOrderDetailsId) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                salesService.deleteItem(salesId, salesOrderDetailsId)
                    .success(function (data) {
                        $scope.sales.salesOrderDetailsList.splice(index, 1);
                    })
                    .error(function (data) {
                        errorDisplay.show(data);
                    });
            }
        } else {
            $scope.sales.salesOrderDetailsList.splice(index, 1);
        }
    }

    // Load Customer on dropdown select change
    $scope.onChangedCustomer = function (customerId) {
        if (isNaN(customerId)) {
            return;
        }

        if ($scope.selected.customer != null) {
            $scope.customer = $scope.selected.customer;
        }

        var currentId = $scope.customer != null ? $scope.customer.customerId : null;
        if (customerId != currentId) {
            // clear supplier object
            $scope.customer = null;

            if (customerId) {
                customerService.get(customerId, { tracker: 'none' })
                    .success(function (data) {
                        $scope.customer = data;

                        // If the sales order is new, use the customer's default data
                        if (!salesId) {
                            prefillData(data);
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    }

    var prefillData = function (customer) {
        $scope.sales.creditTermId = customer.defaultCreditTermId || $scope.sales.creditTermId;
        $scope.sales.currencyId = customer.defaultCurrencyId || $scope.sales.currencyId;
        $scope.sales.discountAmount = customer.defaultDiscountAmount || $scope.sales.discountAmount;
        $scope.sales.discountTypeId = customer.defaultdiscountTypeId || $scope.sales.discountTypeId;
    }

    $scope.onChangedProduct = function (index, item) {
        var newItem = {};
        newItem.product = {};
        // Get the salesOrderDetailsId so able to update the line item
        // newItem.salesOrderDetailsId = $scope.sales.salesOrderDetailsList[index].salesOrderDetailsId || null;

        newItem.productId = item.productId;
        newItem.productName = item.name;
        newItem.unitPrice = item.priceSelling;
        newItem.description = item.description;
        newItem.isChilled = item.isChilled;
        newItem.qty = 1;

        newItem.product.uom = item.uom;
        newItem.product.productUOMList = item.productUOMList;

        $scope.sales.salesOrderDetailsList[index] = newItem;

        $scope.sales.salesOrderDetailsList.push({});
    }

    $scope.$watch('sales', function (oldVal, newVal) {
        var totalQuantity;
        var totalPrice;
        var totalDiscount = 0;
        var totalAdditional;
        var totalGST;
        var totalGrand;
        var sales = $scope.sales;
        // Total Quantities of all items
        totalQuantity = _.reduce($scope.sales.salesOrderDetailsList, function (memo, num) {
            var _qty = 0;
            if (num) {
                _qty = num.qty;
            }

            return Number(memo) + _qty;
        }, 0);

        // Total Price of all items
        totalPrice = _.reduce($scope.sales.salesOrderDetailsList, function (currentTotal, value) {
            var _total = 0;

            if (value.unitPrice && value.qty) {
                _total += (value.unitPrice * value.qty);
            }

            return currentTotal + _total;
        }, 0);

        $scope.totalPrice = totalPrice;

        // get Total Delivery and Additional Charges
        totalAdditional = sales.additionalCharges + sales.freight;

        // Include Discount Amount
        if (sales.discountTypeId && sales.discountAmount) {
            if (sales.discountTypeId == 1) {
                // Percentage
                totalDiscount = (totalPrice + totalAdditional) * (sales.discountAmount) / 100;
            } else {
                // Fixed
                totalDiscount = sales.discountAmount;
            }
        }

        // Include Delivery Charge and Additional Charge
        totalPrice = totalPrice + totalAdditional - totalDiscount;
        totalGST = $scope.sales.isTaxable ? (totalPrice * ($scope.sales.tax/100) > 0 ? totalPrice * ($scope.sales.tax/100) : 0) : 0;
        totalGrand = totalPrice + totalGST;

        $scope.totalQuantity = totalQuantity;
        $scope.totalGST = totalGST;
        $scope.totalGrand = totalGrand;

    }, true);

    _init();
});