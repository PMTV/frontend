// CONTROLLERS

// Sales Order List Controller
ACC.controller('InvoiceListCtrl', function ($scope, $http, invoiceService, errorDisplay) {
    $scope.invoiceTableData = null;

    $scope.loadInvoice = function () {
        invoiceService.query().success(function (data) {
            $scope.invoiceTableData = data;
        })
    }
    $scope.deleteInvoice = function (id) {
        invoiceService.delete(id)
            .success(function (data) {
                $scope.loadInvoice();
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
    };

    $scope.loadInvoice();
});



// Sales Order Edit Controller
ACC.controller('InvoiceEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, $filter, errorDisplay, invoiceService, customerService, salesService, productService) {

    var invoiceId = null;
    var salesOrdersTableData = $scope.salesOrdersTableData = null;
    $scope.invoiceDetailsListTemp = null;
    $scope.busy = false;
    $scope.newStart = $routeParams.id ? false : true;
    $scope.tax = 0;
    $scope.isTaxable = false;
    // $scope.converting = false;

    // SELECT2 AJAX EXAMPLE * DO NOT REMOVE
    $scope.select2Tags = {
        minimumInputLength: 3,
        'multiple': true,
        'simple_tags': true,
        'tags': []  // Can be empty list.
    };

    $scope.select2OptionsProduct = {
        minimumInputLength: 3,
        id: function (obj) {
            return obj.productId; // use slug field for id
        },
        query: function (query) {
            productService.query(query.term).success(function (data) {
                query.callback({ results: data.results });
            });
        },
        formatResult: function (data) {
            return data.name;
        }, // omitted for brevity, see the source of this page
        formatSelection: function (data) {
            return data.productName || data.name;
        },
        initSelection: function (element, callback) {
            var data = [];
        },
        escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
    }

    var _init = function () {
        invoiceId = $routeParams.id;
        $scope.invoice = {};
        $scope.invoice.invoiceDetailsList = [];
        // $scope.invoice.tags = "";

        $scope.customer = null;
        $scope.newInvoiceItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (invoiceId) {
            // Load Sales with salesId
            invoiceService.get(invoiceId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.invoice);

                // set tags by scope tags populated via tagsChanged method
                // $scope.invoice.tags = data.tags;
                // explicitly set details as result details
                if (data.invoiceDetailsList.length) {
                    $scope.invoice.invoiceDetailsList = data.invoiceDetailsList;
                }

                // assign customer object to scope, this will show the customer sidebar
                $scope.customer = data.customer;
                $scope.busy = false;
                //$scope.invoice.totalBalance = $filter('number')(($scope.invoice.totalAmount * 1.07),2) + 5;
            });
        } else {
            $scope.invoice.invoiceDetailsList = [];
            $scope.busy = false;
        }
    }

    $scope.createHeader = function (salesOrder) {
        showHeader = (salesOrder != $scope.currentSalesOrder);
        $scope.currentSalesOrder = salesOrder;
        return showHeader;
    }

    $scope.payInvoice = function () {
        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-preview',
            keyboard: true,
            templateUrl: 'ACC/AR/Invoices/InvoiceEdit/invoicePay.modal.html?a=a',
            controller: function ($scope, $log, $modalInstance, invoiceService, receiptService, invoice, salesService, openCreditNoteService, $filter) {

                $scope.invoice = invoice;
                $scope.newInvoice = {};
                $scope.newInvoice.invoiceId = invoice.invoiceId;

                $scope.onChangedCustomer = function (customerId) {
                    $scope.newInvoice.customerId = customerId;
                }

                $scope.onChangedCreditNote = function (creditNoteId) {
                    $scope.newInvoice.openCreditNoteId = creditNoteId;
                }

                $scope.onChangedCurrencies = function (currencyId) {
                    $scope.newInvoice.currencyId = currencyId;
                }

                $scope.ok = function () {
                    receiptService.add($scope.newInvoice)
                        .success(function (data) {
                            alert('Successfully Added');
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
                invoice: function () {
                    return $scope.invoice;
                }
            }
        });
    }

    // process the form
    $scope.saveInvoice = function () {
        var i = $scope.invoice.invoiceDetailsList.length;
        while (i--) {
            if (!$scope.invoice.invoiceDetailsList[i].productId || $scope.invoice.invoiceDetailsList[i].isSelected == false) {
                $scope.invoice.invoiceDetailsList.splice(i, 1);
            }
        }

        $timeout(function () {

            var newInvoice = {};
            angular.copy($scope.invoice, newInvoice);

            $scope.busy = true;
            // set scope variable submitted to true to force validation
            $scope.submitted = true;

            // check if the form is valid
            if (!$scope.myForm.$valid) {
                $scope.busy = false;
                alert('Please check your data input');
                return false;
            }

            // if salesId not empty update, else add
            if (invoiceId) {
                var temArr = newInvoice;
                temArr.invoiceDetailsList = [];
                invoiceService.put(invoiceId, temArr)
                    .success(function (data) {
                        alert('Successfully Updated');
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
                invoiceService.add(newInvoice)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('invoices/' + data.invoiceId);
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });
            }
        });

    };

    $scope.openInvoicePDF = function (invoice) {
        var invoiceId = invoice.invoiceId;

        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'ACC/AR/Invoices/InvoiceEdit/invoicePDF.modal.html?a=aaaaa',
            controller: function ($scope, $log, $modalInstance, invoiceService, $filter, $sce, errorDisplay, $translate) {
                // assign new $scope.invoice to show in modal frontend for PDF Customized
                $scope.invoice = invoice;
                $scope.loading = false;
                $scope.busy = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    invoiceService.getPDF(invoiceId)
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

                $scope.saveCustomized = function (invoice) {
                    $scope.busy = true;
                    invoiceService.patch(invoiceId, invoice)
                        .success(function (data) {
                            alert($translate.instant('ALERT.UPDATED'));
                        })
                        .error(function (error) {
                            errorDisplay.show(error);
                            $log.error(error);
                        })
                    .finally(function () {
                        $scope.busy = false;
                    });
                }

                // open email dialog
                $scope.openEmail = function () {
                    $modal.open({
                        backdrop: 'static',
                        windowClass: 'modal-md',
                        keyboard: true,
                        templateUrl: 'ACC/AR/Invoices/InvoiceEdit/invoicePDFEmail.modal.html?a=a',
                        controller: function ($scope, $log, $modalInstance, errorDisplay) {
                            $scope.email = {};
                            // set the initial message for the email body
                            $scope.email.body = "Dear Sir / Madam, <br/><br/>Attached is a copy of Invoice.<br/><br/><br/>For additional enquires, please contact Us <br/><br/>Thank you.<br/><br/><br/>";

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
                                invoiceService.emailPDF(invoiceId, $scope.email)
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

    $scope.duplicateInvoice = function () {

        bootstrapConfirm('Duplicate Invoice?', function () {
            $scope.duplicating = true;
            invoiceService.duplicate(invoiceId)
                .success(function (data) {
                    // alert(data.salesOrderId);
                    alert('Successfully duplicated');
                    $location.url('/invoices/' + data.invoiceId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.duplicating = false;
                });
        });
    };


    // Add item into $scope.sales.salesOrderDetailsList
    $scope.addItem = function () {
        $scope.invoice.invoiceDetailsList.push({});
    }

    // Remove item from $scope.sales.salesOrderDetailsList
    $scope.removeItem = function (index, invoiceDetailsId) {
        var invoiceId = $routeParams.id;
        // check if salesOrderDetailsId is null, if not null, call delete item API
        if (invoiceDetailsId) {
            bootstrapConfirm('Do you want to proceed to Delete?', function () {
                invoiceService.deleteItem(invoiceId, invoiceDetailsId)
                    .success(function (data) {
                        $scope.invoice.invoiceDetailsList.splice(index, 1);
                    })
                    .error(function (data) {
                        alert(data);
                    });
            });
        } else {
            $scope.invoice.invoiceDetailsList.splice(index, 1);
        }
    };

    $scope.isSelectInvoicesDetails = function (index, invoiceDetails, event) {
        if (event.target.checked) {
            invoiceDetails.isSelected = true;
        }
        else {
            invoiceDetails.isSelected = false;
        }

        $scope.invoice.totalAmount = $scope.getTotalGrand();
    }

    $scope.getTotalQuantity = function () {
        var totalQty = 0;
        if($scope.invoice.invoiceDetailsList.length > 0){
            angular.forEach($scope.invoice.invoiceDetailsList, function (value, key) {
                if (value.qty > 0) {
                    totalQty += value.qty;
                }
            });
        }
        return totalQty;
    };

    $scope.getTotalPrice = function () {
        var totalPrice = 0;
        var totalDiscount = 0;
        var totalDelivery = 0;
        var totalGst = 0;
        var totalGrand = 0;
        var invoice = $scope.invoice;

        if(invoice.invoiceDetailsList.length <= 0) return totalGrand;

        if($scope.newStart){
            //ADDING NEW
            angular.forEach(invoice.invoiceDetailsList, function (value, key) {
                if (value.isSelected) {
                    if (value.unitPrice && value.qty) {
                        totalPrice += (value.unitPrice * value.qty);
                    }
                }
            });
            // Include Delivery Charge and Additional Charge
            totalDelivery = invoice.invoiceDetailsList[0].additionalCharges + invoice.invoiceDetailsList[0].freight;
            // Include Discount Amount
            if (invoice.invoiceDetailsList[0].discountType && invoice.invoiceDetailsList[0].discountAmount && totalPrice > 0) {
                if (invoice.invoiceDetailsList[0].discountType == 1) {
                    // Percentage
                    totalDiscount = (totalPrice + totalDelivery) * (invoice.invoiceDetailsList[0].discountAmount) / 100;
                } else {
                    totalDiscount = invoice.invoiceDetailsList[0].discountAmount;
                }
            }
        }
        else{
            //EDITING
            angular.forEach(invoice.invoiceDetailsList, function (value, key) {
                if (value.price && value.qty) {
                    totalPrice += (value.price * value.qty);
                }
            });
            // Include Delivery Charge and Additional Charge
            totalDelivery = invoice.invoiceDetailsList[0].salesOrderDetails.additionalCharges + invoice.invoiceDetailsList[0].salesOrderDetails.freight;
            // Include Discount Amount
            if (invoice.invoiceDetailsList[0].salesOrderDetails.discountType && invoice.invoiceDetailsList[0].salesOrderDetails.discountAmount && totalPrice > 0) {
                if (invoice.invoiceDetailsList[0].salesOrderDetails.discountType == 1) {
                    // Percentage
                    totalDiscount = (totalPrice + totalDelivery) * (invoice.invoiceDetailsList[0].salesOrderDetails.discountAmount) / 100;
                } else {
                    totalDiscount = invoice.invoiceDetailsList[0].salesOrderDetails.discountAmount;
                }
            }
        }

        totalPrice = totalPrice == 0 ? 0 : totalPrice + totalDelivery - totalDiscount;
        totalGrand = totalPrice;

        return totalGrand;
    };

    $scope.getTotalGST = function () {
        var total = $scope.getTotalPrice();
        var totalGst = 0;
        var invoice = $scope.invoice;

        if(invoice.invoiceDetailsList.length > 0){
            if($scope.newStart){
                totalGst = total * (invoice.invoiceDetailsList[0].tax) > 0 ? total * (invoice.invoiceDetailsList[0].tax) : 0;
            }
            else{
                totalGst = total * (invoice.invoiceDetailsList[0].salesOrderDetails.tax) > 0 ? total * (invoice.invoiceDetailsList[0].salesOrderDetails.tax) : 0;

            }
        }
        return totalGst;
    };

    $scope.getTotalGrand = function () {
        var totalGST = $scope.getTotalGST();
        var totalPrice = $scope.getTotalPrice();
        return totalGST + totalPrice;
    }

    // Load Customer on dropdown select change
    $scope.onChangedSalesOrder = function (salesOrder) {
        if(salesOrder > 0){
            salesService.getGetSalesOrderDetails(salesOrder)
                .success(function (data) {
                    $scope.invoice.invoiceDetailsList = data;
                    $scope.tax = Math.floor(data[0].salesOrder.tax * 100);
                    $scope.isTaxable = data[0].salesOrder.isTaxable;

                    angular.forEach(salesOrder.salesOrderDetailsList, function (v, k) {
                        $scope.invoice.invoiceDetailsList[k].assetMovements = null;
                        $scope.invoice.invoiceDetailsList[k].deliveryOrderDetailsList = null;
                        $scope.invoice.invoiceDetailsList[k].salesOrderDetailsId = v.salesOrderDetailsId;
                    });
                    $scope.invoiceDetailsListTemp = angular.copy($scope.invoice.invoiceDetailsList);
                    angular.forEach($scope.invoice.invoiceDetailsList, function (key, value) {
                        key.isSelected = true;
                    });

                    $scope.invoice.totalAmount = $scope.getTotalGrand();
                }
            );
        }
    }

    $scope.onChangedCustomer = function (customerId) {
//        alert('enter now');
        var currentId = $scope.customer != null ? $scope.customer.customerId : null;
        $scope.invoiceDetailsListTemp = null;
        $scope.invoice.totalAmount = null;
        if (customerId != currentId) {
            // clear supplier object
            $scope.customer = null;

            if (customerId) {
                customerService.getCustomerWithUnPaidSalesOrder(customerId)
                    .success(function (data) {
                        $scope.customer = data;

                        // If the sales order is new, use the customer's default data
                        if (!invoiceId) {
                            $scope.invoice.creditTermId = data.defaultCreditTermId;
                            $scope.invoice.currencyId = data.defaultCurrencyId;
                            $scope.invoice.discountAmount = data.defaultDiscountAmount;
                            $scope.invoice.discountType = data.defaultDiscountType;
                            $scope.invoice.salesOrder = data.salesOrdersList;
                            salesOrdersTableData = data.salesOrdersList;
                            $scope.salesOrdersTableData = data.salesOrdersList;
                            $scope.invoice.salesOrdersList = data.salesOrdersList;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    }

    $scope.$watch(function(){return $scope.invoice;}, function (newVal, oldVal) {

        if(oldVal == undefined || oldVal.length <=0) {
            return false;
        }else{
            if($scope.invoice.invoiceDetailsList.length > 0){
                var totalQuantity;
                var totalPrice;
                var totalDiscount = 0;
                var totalAdditional;
                var totalGST;
                var totalGrand;
                var invoice = $scope.invoice;

                console.log($scope.invoice);
                // Total Quantities of all items
                totalQuantity = _.reduce($scope.invoice.invoiceDetailsList, function (memo, num) {
                    var _qty = 0;
                    if (num) {
                        _qty = num.qty;
                    }

                    return Number(memo) + _qty;
                }, 0);

                // Total Price of all items
                totalPrice = _.reduce($scope.invoice.invoiceDetailsList, function (currentTotal, value) {

                    var _total = 0;
                    if($scope.newStart){
                        if (value.unitPrice && value.qty) {
                            _total += (value.unitPrice * value.qty);
                        }
                    }else{
                        if (value.price && value.qty) {
                            _total += (value.price * value.qty);
                        }
                    }
                    return currentTotal + _total;
                }, 0);

                if($scope.newStart){
                    $scope.editSaleOrderNumber = null;
                    $scope.freight = invoice.invoiceDetailsList[0].freight;
                    totalAdditional = invoice.invoiceDetailsList[0].additionalCharges + invoice.invoiceDetailsList[0].freight;

                    if (invoice.invoiceDetailsList[0].discountType && invoice.invoiceDetailsList[0].discountAmount) {
                        if (invoice.invoiceDetailsList[0].discountType == 1) {
                            // Percentage
                            totalDiscount = (totalPrice + totalAdditional) * (invoice.invoiceDetailsList[0].discountAmount) / 100;
                        } else {
                            // Fixed
                            totalDiscount = invoice.invoiceDetailsList[0].discountAmount;
                        }
                    }

                    if($scope.invoice.invoiceDetailsList[0].tax != undefined){
                        $scope.isTaxable = ($scope.invoice.invoiceDetailsList[0].tax > 0) ? 1 : 0;
                    }
                    totalGST = $scope.invoice.invoiceDetailsList[0].tax;
                    $scope.tax = Math.floor(totalGST * 100);

                    $scope.additionalCharges = invoice.invoiceDetailsList[0].additionalCharges;

                }else{
                    console.warn('edit function');
                    console.info(invoice.invoiceDetailsList[0].salesOrderDetails.salesOrder.salesOrderNumber);
                    $scope.editSaleOrderNumber = invoice.invoiceDetailsList[0].salesOrderDetails.salesOrder.salesOrderNumber;
                    $scope.freight = invoice.invoiceDetailsList[0].salesOrderDetails.freight;
                    totalAdditional = invoice.invoiceDetailsList[0].salesOrderDetails.additionalCharges + invoice.invoiceDetailsList[0].salesOrderDetails.freight;

                    if (invoice.invoiceDetailsList[0].salesOrderDetails.discountType && invoice.invoiceDetailsList[0].salesOrderDetails.discountAmount) {
                        if (invoice.invoiceDetailsList[0].salesOrderDetails.discountType == 1) {
                            // Percentage
                            totalDiscount = (totalPrice + totalAdditional) * (invoice.invoiceDetailsList[0].salesOrderDetails.discountAmount) / 100;
                        } else {
                            // Fixed
                            totalDiscount = invoice.invoiceDetailsList[0].salesOrderDetails.discountAmount;
                        }
                    }

                    if($scope.invoice.invoiceDetailsList[0].salesOrderDetails.tax != undefined){
                        $scope.isTaxable = ($scope.invoice.invoiceDetailsList[0].salesOrderDetails.tax > 0) ? 1 : 0;
                    }
                    totalGST = $scope.invoice.invoiceDetailsList[0].salesOrderDetails.tax;
                    $scope.tax = Math.floor(totalGST * 100);

                    $scope.additionalCharges = invoice.invoiceDetailsList[0].salesOrderDetails.additionalCharges;
                }

                //set on view
                $scope.totalPrice = totalPrice;

                // Include Delivery Charge and Additional Charge
                totalPrice = totalPrice + totalAdditional - totalDiscount;

                totalGST = $scope.isTaxable ? (totalPrice * totalGST > 0 ? totalPrice * totalGST : 0) : 0;

                totalGrand = totalPrice + totalGST;

                $scope.totalDiscount = totalDiscount;
                $scope.totalQuantity = totalQuantity;
                $scope.totalGST = totalGST;
                $scope.totalGrand = totalGrand;
            }else{
                return false;
            }
        }

    }, true);

    _init();
});


/////
ACC.controller('InvoiceEditCtrl_____', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, $filter, errorDisplay, invoiceService, customerService, salesService) {

    var invoiceId = null;
    var salesOrdersTableData = $scope.salesOrdersTableData = null;
    $scope.invoiceDetailsListTemp = null;
    $scope.busy = false;
    $scope.newStart = $routeParams.id ? false : true;
    // $scope.converting = false;

    // SELECT2 AJAX EXAMPLE * DO NOT REMOVE
    $scope.select2Tags = {
        minimumInputLength: 3,
        'multiple': true,
        'simple_tags': true,
        'tags': []  // Can be empty list.
    };

    $scope.select2OptionsProduct = {
        minimumInputLength: 3,
        id: function (obj) {
            return obj.productId; // use slug field for id
        },
        query: function (query) {
            productService.query(query.term).success(function (data) {
                query.callback({ results: data.results });
            });
        },
        formatResult: function (data) {
            return data.name;
        }, // omitted for brevity, see the source of this page
        formatSelection: function (data) {
            return data.productName || data.name;
        },
        initSelection: function (element, callback) {
            var data = [];
        },
        escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
    }

    var _init = function () {
        invoiceId = $routeParams.id;
        $scope.invoice = {};
        // $scope.invoice.tags = "";

        $scope.customer = null;
        $scope.newInvoiceItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (invoiceId) {
            // Load Sales with salesId
            invoiceService.get(invoiceId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.invoice);
                // set tags by scope tags populated via tagsChanged method
                // $scope.invoice.tags = data.tags;
                // explicitly set details as result details
                if (data.invoiceDetailsList.length) {
                    $scope.invoice.invoiceDetailsList = data.invoiceDetailsList;
                } else {
                    $scope.invoice.invoiceDetailsList = [];
                }

                // assign customer object to scope, this will show the customer sidebar
                $scope.customer = data.customer;
                $scope.busy = false;
                //$scope.invoice.totalBalance = $filter('number')(($scope.invoice.totalAmount * 1.07),2) + 5;
            });
        } else {
            $scope.invoice.invoiceDetailsList = [];
            $scope.busy = false;
        }
    }

    $scope.payInvoice = function () {
        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-preview',
            keyboard: true,
            templateUrl: 'ACC/AR/Invoices/InvoiceEdit/payInvoiceModal.html?a=a',
            controller: function ($scope, $log, $modalInstance, invoiceService, receiptService, invoice, salesService, openCreditNoteService, $filter) {

                $scope.invoice = invoice;
                $scope.newInvoice = {};
                $scope.newInvoice.invoiceId = invoice.invoiceId;

                $scope.onChangedCustomer = function (customerId) {
                    $scope.newInvoice.customerId = customerId;
                }

                $scope.onChangedCreditNote = function (creditNoteId) {
                    $scope.newInvoice.openCreditNoteId = creditNoteId;
                }

                $scope.onChangedCurrencies = function (currencyId) {
                    $scope.newInvoice.currencyId = currencyId;
                }

                $scope.ok = function () {
                    receiptService.add($scope.newInvoice)
                        .success(function (data) {
                            alert('Successfully Added');
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
                invoice: function () {
                    return $scope.invoice;
                }
            }
        });
    }

    // process the form
    $scope.saveInvoice = function () {
        var i = $scope.invoice.invoiceDetailsList.length;
        while (i--) {
            if (!$scope.invoice.invoiceDetailsList[i].productId) {
                $scope.invoice.invoiceDetailsList.splice(i, 1);
            }
        }

        $timeout(function () {

            var newInvoice = {};
            angular.copy($scope.invoice, newInvoice);

            $scope.busy = true;
            // set scope variable submitted to true to force validation
            $scope.submitted = true;

            // check if the form is valid
            if (!$scope.myForm.$valid) {
                $scope.busy = false;
                alert('Please check your data input');
                return false;
            }

            // if salesId not empty update, else add
            if (invoiceId) {
                invoiceService.put(invoiceId, newInvoice)
                    .success(function (data) {
                        alert('Successfully Updated');
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
                invoiceService.add(newInvoice)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('invoices/' + data.invoiceId);
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

    $scope.invoicePDF = function (invoiceid) {
        return window.open((invoiceService.printPDF(invoiceid)));
    };

    $scope.duplicateInvoice = function () {

        bootstrapConfirm('Duplicate Invoice?', function () {
            $scope.duplicating = true;
            invoiceService.duplicate(invoiceId)
                .success(function (data) {
                    // alert(data.salesOrderId);
                    alert('Successfully duplicated');
                    $location.url('/invoices/' + data.invoiceId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.duplicating = false;
                });
        });
    };


    // Add item into $scope.sales.salesOrderDetailsList
    $scope.addItem = function () {
        $scope.invoice.invoiceDetailsList.push({});
    }

    // Remove item from $scope.sales.salesOrderDetailsList
    $scope.removeItem = function (index, invoiceDetailsId) {
        var invoiceId = $routeParams.id;
        // check if salesOrderDetailsId is null, if not null, call delete item API
        if (invoiceDetailsId) {
            bootstrapConfirm('Do you want to proceed to Delete?', function () {
                invoiceService.deleteItem(invoiceId, invoiceDetailsId)
                    .success(function (data) {
                        $scope.invoice.invoiceDetailsList.splice(index, 1);
                    })
                    .error(function (data) {
                        alert(data);
                    });
            });
        } else {
            $scope.invoice.invoiceDetailsList.splice(index, 1);
        }
    };

    $scope.isCheckInvoicesDetails = function (index, invoiceDetails, event) {
        if (event.target.checked) {
            $scope.invoice.invoiceDetailsList.push(invoiceDetails);
        }
        else {
            //angular.forEach($scope.invoice.invoiceDetailsList,
            // function (value, key) {
            //     if (value.salesOrderDetailsId = invoiceDetails.salesOrderDetailsId) {
            //         alert(value.salesOrderDetailsId + " " + invoiceDetails.salesOrderDetailsId + " " + $scope.invoice.invoiceDetailsList.indexOf(invoiceDetails));
            //         $scope.invoice.invoiceDetailsList.splice($scope.invoice.invoiceDetailsList.indexOf(value.salesOrderDetailsId) + 1, 1);
            //     }
            // });
            $scope.invoice.invoiceDetailsList.splice($scope.invoice.invoiceDetailsList.indexOf(invoiceDetails), 1);
        }

        $scope.invoice.totalAmount = $scope.getTotalPrice();
    }

    $scope.getTotalQuantity = function () {
        var totalQty = 0;
        if($scope.sales != undefined && $scope.sales.salesOrderDetailsList.length > 0){
            angular.forEach($scope.sales.salesOrderDetailsList,function (value, key) {
                if (value.qty) {
                    totalQty += value.qty;
                }
                else {
                    totalQty = totalQty;
                }
            });
        }

        return totalQty;
    }

    $scope.getTotalPrice = function () {
        var totalPrice = 0;
        var totalDiscount = 0;
        var totalDelivery = 0;
        var totalGst = 0;
        var totalGrand = 0;
        var invoice = $scope.invoice;

        if(invoice.invoiceDetailsList == undefined || invoice.invoiceDetailsList.length <=0) {
            return totalGrand;
        }

        angular.forEach(invoice.invoiceDetailsList, function (value, key) {
            if (value.unitPrice && value.qty) {
                totalPrice += (value.unitPrice * value.qty);
            } else {
                totalPrice = totalPrice;
            }
        });

        // Include Delivery Charge and Additional Charge
        totalDelivery = invoice.invoiceDetailsList[0].additionalCharges + invoice.invoiceDetailsList[0].freight;

        // Include Discount Amount
        if (invoice.invoiceDetailsList[0].discountType && invoice.invoiceDetailsList[0].discountAmount && totalPrice > 0) {
            if (invoice.invoiceDetailsList[0].discountType == 1) {
                // Percentage
                totalDiscount = (totalPrice + totalDelivery) * (invoice.invoiceDetailsList[0].discountAmount) / 100;
            } else {
                totalDiscount = invoice.invoiceDetailsList[0].discountAmount;
            }
        }
        totalPrice = totalPrice + totalDelivery - totalDiscount;
        totalGst = totalPrice * (invoice.invoiceDetailsList[0].tax) > 0 ? totalPrice * (invoice.invoiceDetailsList[0].tax) : 0;
        totalGrand = totalPrice + totalGst;
        return totalGrand;
    }

    $scope.getTotalGST = function () {
        var total = $scope.getTotalPrice();

        return total * 0.07 > 0 ? total * 0.07 : 0;
    }

    $scope.getTotalGrand = function () {
        var totalGST = $scope.getTotalGST();
        var totalPrice = $scope.getTotalPrice();
        return totalGST + totalPrice;
    }

    // Load Customer on dropdown select change
    $scope.onChangedSalesOrder = function (salesOrder) {
        salesService.getGetSalesOrderDetails(salesOrder).success
        (function (data) {
                $scope.invoice.invoiceDetailsList = data;
                angular.forEach(salesOrder.salesOrderDetailsList, function (v, k) {
                    $scope.invoice.invoiceDetailsList[k].assetMovements = null;
                    $scope.invoice.invoiceDetailsList[k].deliveryOrderDetailsList = null;
                    $scope.invoice.invoiceDetailsList[k].salesOrderDetailsId = v.salesOrderDetailsId;
                });
                $scope.invoiceDetailsListTemp = angular.copy($scope.invoice.invoiceDetailsList);
                //                add GST and delivery fee
                //            $scope.invoice.totalAmount = ($scope.getTotalPrice() * 1.07) + 5;
                $scope.invoice.totalAmount = $scope.getTotalPrice();
                console.log(salesOrder.salesOrderDetailsList);
            }
//        )
//            .error(function (data) {
//                alert(data);
//            }
        );
        //salesOrder = angular.fromJson(salesOrder);
        // console.log(salesOrder);
    }

    $scope.onChangedCustomer = function (customerId) {
        var currentId = $scope.customer != null ? $scope.customer.customerId : null;
        $scope.invoiceDetailsListTemp = null;
        $scope.invoice.totalAmount = null;
        if (customerId != currentId) {
            // clear supplier object
            $scope.customer = null;

            if (customerId) {
                customerService.getCustomerWithUnPaidSalesOrder(customerId)
                    .success(function (data) {
                        $scope.customer = data;

                        // If the sales order is new, use the customer's default data
                        if (!invoiceId) {
                            $scope.invoice.creditTermId = data.defaultCreditTermId;
                            $scope.invoice.currencyId = data.defaultCurrencyId;
                            $scope.invoice.discountAmount = data.defaultDiscountAmount;
                            $scope.invoice.discountType = data.defaultDiscountType;
                            $scope.invoice.salesOrder = data.salesOrdersList;
                            salesOrdersTableData = data.salesOrdersList;
                            $scope.salesOrdersTableData = data.salesOrdersList;
                            $scope.invoice.salesOrdersList = data.salesOrdersList;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    }
    _init();
});