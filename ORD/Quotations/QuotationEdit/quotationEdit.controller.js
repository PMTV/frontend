// CONTROLLERS

// Quotation Order List Controller
ORD.controller('QuotationListCtrl', function ($scope, $http, quotationService, errorDisplay) {

    $scope.quotations = [];
    var selectedQuotations = $scope.selectedQuotations = [];

    $scope.columnDefs = [
            { field: 'salesOrderId', displayName: '', cellTemplate: '<div class="ngCellText"><a href="#/sales/{{row.entity.salesOrderId}}" tooltip="View Sales Order" tooltip-placement="right" tooltip-append-to-body="true" ng-show="{{row.entity.salesOrderId}}"><i class="fa fa-file-text fa-large" /></a></div>', sortable: false, headerClass: 'unsortable', width: '3%' },
            { field: 'quotationNumber', displayName: '#Quotation Number' },
            { field: 'customer.companyName', displayName: 'Company Name' },
            { field: 'quotationStatusId', displayName: 'Status', cellTemplate: '<div class="ngCellText">{{row.entity.quotationStatusId | quotationStatus:row.entity.settings.isApproved}}</div>' },
            { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date', visible: false },
            { field: 'quotationId', displayName: 'Actions', cellTemplate: '<a href="#/quotations/{{row.entity.quotationId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.quotationId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false
    };
});

// Quotation Order Edit Controller
ORD.controller('QuotationEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $filter, $log, $modal, $translate, hotkeys, errorDisplay, quotationService, customerService, productService) {
    var quotationId;

    $scope.selected = {}; // to use with customersDropdown directive

    $scope.busy = false;
    $scope.converting = false;

    hotkeys.add({
        combo: 'ctrl+s',
        description: 'Save Quotation',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            $scope.saveQuotation();
            event.preventDefault();
        }
    });

    $scope.selectStatus = function (statusId) {
        $scope.changingStatus = true;

        quotationService.updateStatus(quotationId, statusId)
            .success(function (data) {
                // if status set back to "Pending Approval", set "isApproved" to false
                if (statusId == 3) {
                    $scope.quotation.settings.isApproved = false;
                };
                $scope.quotation.quotationStatusId = statusId;
                alert($translate.instant('ALERT.UPDATED'));
            })
            .error(function (error, status) {
                // if error is 403 (forbidden), set "isApproved" to false
                if (status == 403) {
                    $scope.quotation.settings.isApproved = false;
                };
                errorDisplay.show(error);
                $log.error(error);
            })
        .finally(function () {
            $scope.changingStatus = false;
        });
    };

    $scope.onChangedTaxable = function(status)
    {
        if (status)
        {
            $scope.quotation.isTaxable = 1;
        }
        else
        {
            $scope.quotation.isTaxable = 0;
        }
    }

    var _init = function () {
        quotationId = $routeParams.id;
        $scope.quotation = {};
        $scope.quotation.tags;
        $scope.quotation.tax = 0;
        $scope.totalQuantity = 0;
        $scope.totalPrice = 0;
        $scope.totalGST = 0;
        $scope.totalGrand = 0;

        $scope.statusArr = quotationService.getAllStatus();

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (quotationId) {
            // Load Quotation with quotationId
            quotationService.get(quotationId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.quotation);
                $scope.quotation.tax = $filter('number')(($scope.quotation.tax * 100), 2);

                // explicitly set details as result details
                if (data.quotationDetailsList.length) {
                    $scope.quotation.quotationDetailsList = data.quotationDetailsList;
                } else {
                    $scope.quotation.quotationDetailsList = [{}];
                }

                // assign customer object to scope, this will show the customer sidebar
                $scope.busy = false;
            })
            .error(function (data, status, headers, config) {
                errorDisplay.show(data, status, headers, config);
            });
        } else {
            $scope.quotation.quotationDetailsList = [{}];
            $scope.busy = false;
        }
    }

    $scope.sendApproval = function () {
        if (confirm($translate.instant('ALERT.APPROVAL_SEND'))) {
            $scope.approving = true;
            quotationService.sendApproval(quotationId).success(function (data) {
                alert($translate.instant('ALERT.SENT'));
                $location.url('quotations');
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
            quotationService.approve(quotationId).success(function (data) {
                alert($translate.instant('ALERT.APPROVAL_APPROVED'));
                $location.url('quotations');
            })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.approving = false;
                });
        }
    };

    var excludeUsercreated = function (data) {
        if (data != null) {
            //data.userCreated = null;
            //data.creditTerm.userCreated = null;
            //data.creditTerm.userCreatedId = null;
            if (data.quotationDetailsList.length > 0) {
                angular.forEach(data.quotationDetailsList, function(value, key) {
                    value.userCreated = null;
                    value.userCreatedId = null;
                    if (value.product != null) {
                        value.product.userCreated = null;
                        value.product.userCreatedId = null;
                    }
                });
            }
        }
        return data;
    };
    $scope.saveQuotation = function () {
        var i = $scope.quotation.quotationDetailsList.length;
        while (i--) {
            if (!$scope.quotation.quotationDetailsList[i].productId) {
                $scope.quotation.quotationDetailsList.splice(i, 1);
            }
        }

        var newQuotation = {};
        var tags = $scope.quotation.tags;
        angular.copy($scope.quotation, newQuotation);
        newQuotation.tax = newQuotation.tax/100;
        $timeout(function () {
            // join the array back to string
            if (angular.isArray(tags)) {
                newQuotation.tags = tags.join();
            }

            $scope.busy = true;
            // set scope variable submitted to true to force validation
            $scope.submitted = true;

            // check if the form is valid
            if (!$scope.myForm.$valid) {
                $scope.busy = false;
                alert($translate.instant('ALERT.FORM_ERROR'));
                return false;
            }

            // if quotationId not empty update, else add
            if (quotationId) {
                // Check if isApprovalRequired and if isApproved, if yes, prompt saving will resend for Approval process
                if (newQuotation.settings.isApprovalRequired && newQuotation.settings.isApproved) {
                    if (confirm($translate.instant('ALERT.APPROVAL_RESEND', { type: 'Quotation' }))) {

                    } else {
                        $scope.busy = false;
                        return;
                    }
                }

                newQuotation = excludeUsercreated(newQuotation);
                quotationService.put(quotationId, newQuotation)
                    .success(function (data) {
                        alert($translate.instant('ALERT.UPDATED'));
                        $route.reload();
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                quotationService.add(newQuotation)
                    .success(function (data) {
                        alert($translate.instant('ALERT.CREATED'));
                        $location.url('quotations/' + data.quotationId);
                    })
                    .error(function (error) {
                        alert(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        })
    };

    $scope.cancelQuotation = function (quotationId) {

        if (confirm($translate.instant('ALERT.CANCELLING'))) {
            $scope.cancelling = true;
            quotationService.delete(quotationId)
                .success(function (data) {
                    alert($translate.instant('ALERT.CANCELLED'));
                    $location.url('quotations');
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.cancelling = false;
                });
        }
    };

    $scope.convertQuotation = function () {
        var newQuotation = {};

        angular.copy($scope.quotation, newQuotation);

        if (confirm($translate.instant('ALERT.CONVERTING'))) {
            $scope.converting = true;

            newQuotation = excludeUsercreated(newQuotation);
            quotationService.convertToSO(quotationId, newQuotation)
                .success(function (data) {
                    alert($translate.instant('ALERT.CONVERTED'));
                    $location.url('sales/' + data.salesOrderId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.converting = false;
                });
        }
    }

    $scope.copyQuotation = function () {
        if ($translate.instant('ALERT.DUPLICATING')) {
            $scope.duplicating = true;
            quotationService.duplicate(quotationId)
                .success(function (data) {
                    // alert(data.salesOrderId);
                    alert($translate.instant('ALERT.DUPLICATED'));
                    $location.url('/quotations/' + data.quotationId);
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

    $scope.preview = function (quotation) {
        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-preview',
            keyboard: true,
            templateUrl: 'ORD/Quotations/quotation.print.html?a=a',
            controller: function ($scope, $log, $modalInstance, productService, $filter, getTotalPrice, getTotalQuantity) {

                $scope.quotation = quotation;

                $scope.getTotalPrice = function () {
                    return getTotalPrice;
                }
                $scope.getTotalQuantity = function () {
                    return getTotalQuantity;
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

    $scope.openQuotationPDF = function (quotation) {
        var quotationId = quotation.quotationId;

        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'ORD/Quotations/QuotationEdit/quotationPDF.modal.html?a=aaaa',
            controller: function ($scope, $log, $modalInstance, quotationService, $filter, $sce, errorDisplay) {
                // assign new $scope.quotation to show in modal frontend for PDF Customized
                $scope.quotation = quotation;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    quotationService.getPDF(quotation.quotationId)
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

                $scope.saveCustomized = function (quotation) {
                    quotationService.patch(quotationId, quotation)
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
                        templateUrl: 'ORD/Quotations/QuotationEdit/quotationPDFEmail.modal.html?a=a',
                        controller: function ($scope, $log, $modalInstance, errorDisplay) {
                            $scope.email = {};
                            // set the initial message for the email body
                            $scope.email.body = "Dear Sir / Madam, <br/><br/>Attached is a copy of Quotation.<br/><br/><br/>For additional enquires, please contact Us <br/><br/>Thank you.<br/><br/><br/>";

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
                                quotationService.emailPDF(quotationId, $scope.email)
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
        $http.jsonp("http://www.gothere.sg/maps/geo?output=&q=" + postal + "&client=&sensor=false&callback=JSON_CALLBACK").success(function (data) {
            if (data && data.Status.code !== 603) {
                if (type === "Billing") {
                    $scope.quotation.billAddress = data.Placemark[0].AddressDetails.Country.Thoroughfare.ThoroughfareName;
                } else {
                    $scope.quotation.shipAddress = data.Placemark[0].AddressDetails.Country.Thoroughfare.ThoroughfareName;
                }
            } else {
                alert($translate.instant('ALERT.NOT_FOUND_TYPE'));
            }
        });
    }

    $scope.selectAddress = function (address, addressType) {
        var quotation = $scope.quotation;

        if (addressType == 'Shipping') {
            quotation.shipName = $scope.customer.companyName;
            quotation.shipAddress = address.fullAddress;
            quotation.shipCity = address.countryCity;
            quotation.shipState = address.countryState;
            quotation.shipPostalCode = address.postalCode;
            quotation.shipCountry = address.country.name;

        } else if (addressType == 'Billing') {
            quotation.billName = $scope.customer.companyName;
            quotation.billAddress = address.fullAddress;
            quotation.billCity = address.countryCity;
            quotation.billState = address.countryState;
            quotation.billPostalCode = address.postalCode;
            quotation.billCountry = address.country.name;
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
        var quotation = $scope.quotation;

        if (addressType == 'Shipping') {
            quotation.shipName = null;
            quotation.shipAddress = null;
            quotation.shipCity = null;
            //quotation.shipRegion = address.
            quotation.shipPostalCode = null;
            quotation.shipCountry = null;

        } else if (addressType == 'Billing') {
            quotation.billName = null;
            quotation.billAddress = null;
            quotation.billCity = null;
            //quotation.shipRegion = address.
            quotation.billPostalCode = null;
            quotation.billCountry = null;
        }
    }

    // Add item into $scope.quotation.quotationDetailsList
    $scope.addItem = function () {
        $scope.quotation.quotationDetailsList.push({});
    }

    // Remove item from $scope.quotation.quotationDetailsList
    $scope.removeItem = function (index, quotationDetailsId) {
        var quotationId = $routeParams.id;
        // check if quotationDetailsId is null, if not null, call delete item API
        if (quotationDetailsId) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                quotationService.deleteItem(quotationId, quotationDetailsId)
                    .success(function (data) {
                        $scope.quotation.quotationDetailsList.splice(index, 1);
                    })
                    .error(function (data) {
                        errorDisplay.show(data);
                    });
            }
        } else {
            $scope.quotation.quotationDetailsList.splice(index, 1);
        }
    }

    // Load Customer on dropdown select change, for existing record use the current object in scope
    $scope.onChangedCustomer = function (customerId) {
        if (isNaN(customerId)) {
            return;
        }

        if ($scope.selected.customer != null) {
            $scope.customer = $scope.selected.customer;
        }

        var currentId = $scope.customer != null ? $scope.customer.customerId : null;
        if (customerId != currentId) {
            // clear customer object
            $scope.customer = null;

            if (customerId) {
                customerService.get(customerId, { tracker: 'none' })
                    .success(function (data) {
                        $scope.customer = data;

                        // If the quotation order is new, use the supplier default data
                        if (!quotationId) {
                            prefillData(data);
                        }
                    });
            }
        }
    }

    var prefillData = function (customer) {
        $scope.quotation.creditTermId = customer.defaultCreditTermId;
        $scope.quotation.currencyId = customer.defaultCurrencyId || $scope.quotation.currencyId;
        $scope.quotation.discountAmount = customer.defaultDiscountAmount;
        $scope.quotation.discountTypeId = customer.defaultDiscountTypeId;
    }

    $scope.onChangedProduct = function (index, item) {
        var newItem = {};
        newItem.product = {};

        // Get the quotationDetailsId so able to update the line item
        newItem.quotationDetailsId = $scope.quotation.quotationDetailsList[index].quotationDetailsId || 0;

        newItem.productId = item.productId;
        newItem.productName = item.name;
        newItem.sellingPrice = item.priceCost;
        newItem.description = item.description;
        newItem.qty = 1;

        newItem.product.uom = item.uom;
        newItem.product.productUOMList = item.productUOMList;

        $scope.quotation.quotationDetailsList[index] = newItem;

        $scope.quotation.quotationDetailsList.push({});
    }

    $scope.$watch('quotation', function (oldVal, newVal) {
        var totalQuantity;
        var totalPrice;
        var totalDiscount = 0;
        var totalAdditional;
        var totalGST;
        var totalGrand;
        var quotation = $scope.quotation;

        // Total Quantities of all items
        totalQuantity = _.reduce($scope.quotation.quotationDetailsList, function (memo, num) {
            var _qty = 0;
            if (num) {
                _qty = num.qty;
            }

            return Number(memo) + _qty;
        }, 0);

        // Total Price of all items
        totalPrice = _.reduce($scope.quotation.quotationDetailsList, function (currentTotal, value) {
            var _total = 0;

            if (value.unitPrice && value.qty) {
                _total += (value.unitPrice * value.qty);
            }

            return currentTotal + _total;
        }, 0);

        $scope.totalPrice = totalPrice;

        // get Total Delivery and Additional Charges
        totalAdditional = quotation.additionalCharges + quotation.freight;

        // Include Discount Amount
        if (quotation.discountTypeId && quotation.discountAmount) {
            if (quotation.discountTypeId == 1) {
                // Percentage
                totalDiscount = (totalPrice + totalAdditional) * (quotation.discountAmount) / 100;
            } else {
                // Fixed
                totalDiscount = quotation.discountAmount;
            }
        }

        // Include Delivery Charge and Additional Charge
        totalPrice = totalPrice + totalAdditional - totalDiscount;
        totalGST = $scope.quotation.isTaxable ? (totalPrice * ($scope.quotation.tax / 100) > 0 ? totalPrice * ($scope.quotation.tax / 100) : 0) : 0;
        totalGrand = totalPrice + totalGST;

        $scope.totalQuantity = totalQuantity || 0;
        $scope.totalGST = totalGST;
        $scope.totalGrand = totalGrand;

    }, true);

    _init();
});