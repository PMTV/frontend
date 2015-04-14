// CONTROLLERS

// Sales Order List Controller
ACC.controller('ReceiptListCtrl', function ($scope, $http, receiptService, errorDisplay) {
    $scope.receiptTableData = null;

    $scope.loadReceipt = function () {
        receiptService.query().success(function (data) {
            $scope.receiptTableData = data;
        })
    }
    $scope.deleteReceipt = function (id) {
        receiptService.delete(id)
            .success(function (data) {
                $scope.loadReceipt();
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
    };

    $scope.loadReceipt();
});

// Sales Order Edit Controller
ACC.controller('ReceiptEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, errorDisplay, receiptService, customerService, salesService, invoiceService, openCreditNoteService) {

    var receiptId = null;

    $scope.busy = false;
    // $scope.converting = false;
    var _init = function () {
        receiptId = $routeParams.id;
        $scope.receipt = {};
        // $scope.debitNote.tags = "";

        $scope.customer = null;
        $scope.newReceiptItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (receiptId) {
            // Load Sales with salesId
            receiptService.get(receiptId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.receipt);
                // set tags by scope tags populated via tagsChanged method
                // $scope.debitNote.tags = data.tags;
                // explicitly set details as result details
                // if (data.debitNoteDetailsList.length) {
                //     $scope.debitNote.debitNoteDetailsList = data.debitNoteDetailsList;
                // } else {
                //     $scope.debitNote.debitNoteDetailsList = [{}];
                // }

                // assign customer object to scope, this will show the customer sidebar
                $scope.customer = data.customer;
                $scope.busy = false;
            });
        } else {
            // $scope.debitNote.debitNoteDetailsList = [{}];
            $scope.busy = false;
        }
    }

    // process the form
    $scope.saveReceipt = function () {
        // var i = $scope.debitNote.debitNoteDetailsList.length;
        // while (i--) {
        //     if (!$scope.debitNote.debitNoteDetailsList[i].productId) {
        //         $scope.debitNote.debitNoteDetailsList.splice(i, 1);
        //     }
        // }
        $timeout(function () {

            var newReceipt = {};
            angular.copy($scope.receipt, newReceipt);

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
            if (receiptId) {
                receiptService.put(receiptId, newReceipt)
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
                receiptService.add(newReceipt)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('receipts/' + data.receiptId);
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

    $scope.duplicateReceipt = function () {

        bootstrapConfirm('Duplicate Receipt?', function() {
            $scope.duplicating = true;
            receiptService.duplicate(receiptId)
                .success(function(data) {
                    // alert(data.salesOrderId);
                    alert('Successfully duplicated');
                    $location.url('/receipts/' + data.receiptId);
                })
                .error(function(error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function() {
                    $scope.duplicating = false;
                });
        });
    }

    $scope.onChangedCustomer = function (customerId) {
        var currentId = $scope.customer != null ? $scope.customer.customerId : null;
        if (customerId != currentId) {
            // clear supplier object
            $scope.customer = null;

            if (customerId) {
                customerService.get(customerId)
                    .success(function (data) {
                        $scope.customer = data;

                        // If the sales order is new, use the customer's default data
                        if (!receiptId) {
                            $scope.receipt.creditTermId = data.defaultCreditTermId;
                            $scope.receipt.currencyId = data.defaultCurrencyId;
                            $scope.receipt.discountAmount = data.defaultDiscountAmount;
                            $scope.receipt.discountType = data.defaultDiscountType;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });

                invoiceService.GetUnPaidInvoicesByCustomer(customerId)
                    .success(function (data) {
                        $scope.invoiceList = data;
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                        $log.error(error);
                    })
            }
        }
    }

    $scope.selectInvoice = function (invoiceId) {
        $scope.receipt.invoiceId = invoiceId;
    }

    $scope.onChangedCreditNote = function (creditNoteId) {
        $scope.receipt.openCreditNoteId = creditNoteId;
    }

    $scope.onChangedCurrencies = function (currencyId) {
        $scope.receipt.currencyId = currencyId;
    }


    $scope.onChangedOpenCreditNote = function (id) {
        openCreditNoteService.get(id).success(function (data) {
            $scope.receipt.amount = data.amount;
            $scope.receipt.openCreditNoteId = id;
        }).error(function (error) {
            errorDisplay.show(error);
            $log.error(error);
        });
    };

    $scope.receiptPDF = function (receiptId) {
        return window.open((receiptService.printPDF(receiptId)));
    };
    
    _init();
});