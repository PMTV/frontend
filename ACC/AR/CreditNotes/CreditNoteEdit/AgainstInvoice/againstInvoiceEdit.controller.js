// CONTROLLERS

// againstInvoice  List Controller
ACC.controller('AgainstInvoiceListCtrl', function ($scope, $http, againstInvoiceService, errorDisplay) {
    $scope.againstInvoiceTableData = null;

    $scope.loadAgainstInvoice = function () {
        againstInvoiceService.query().success(function (data) {
            $scope.againstInvoiceTableData = data;
        })
    }

    $scope.deleteAgainstInvoice = function (id) {
        againstInvoiceService.delete(id)
            .success(function (data) {
                $scope.loadAgainstInvoice();
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
    };

    $scope.loadAgainstInvoice();
});

// againstInvoice  Edit Controller
ACC.controller('AgainstInvoiceEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, errorDisplay, againstInvoiceService, customerService, salesService, productService) {

    var creditNoteId = null;

    $scope.busy = false;
    // $scope.converting = false;
    $scope.grandTotal = 0;
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
        creditNoteId = $routeParams.id;
        $scope.newSession = null;
        if ($routeParams.id) {
            $scope.newSession = false;
        } else {
            $scope.newSession = true;
        }
        $scope.creditNotes = {};
        // $scope.invoice.tags = "";

        $scope.customer = null;
        // $scope.newOpenCreditNoteItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (creditNoteId) {
            // Load creditNotes with creditNoteId
            againstInvoiceService.get(creditNoteId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.creditNotes);
                // set tags by scope tags populated via tagsChanged method
                // $scope.invoice.tags = data.tags;
                // explicitly set details as result details
                 if (data.creditNoteDetailsList.length) {
                     $scope.creditNotes.creditNoteDetailsList = data.creditNoteDetailsList;
                 } else {
                     $scope.creditNotes.creditNoteDetailsList = [{}];
                 }

                // assign customer object to scope, this will show the customer sidebar
                 $scope.customer = data.customer;
                //switch tax to tax * 100
                 $scope.creditNotes.taxPlus = $scope.creditNotes.tax * 100;
                $scope.busy = false;
            });
        } else {
            $scope.creditNotes.creditNoteDetailsList = [{}];
            $scope.busy = false;
        }
    }

    // process the form
    $scope.saveAgainstInvoice = function () {
        var i = $scope.creditNotes.creditNoteDetailsList.length;
        while (i--) {
            if (!$scope.creditNotes.creditNoteDetailsList[i].productId) {
                $scope.creditNotes.creditNoteDetailsList.splice(i, 1);
            }
        }

        $timeout(function () {

            var newcreditNotes = {};
            $scope.creditNotes.amount = $scope.getGrandTotal();
            angular.copy($scope.creditNotes, newcreditNotes);

            $scope.busy = true;
            // set scope variable submitted to true to force validation
            $scope.submitted = true;

            // check if the form is valid
            if (!$scope.myForm.$valid) {
                $scope.busy = false;
                alert('Please check your data input');
                return false;
            }

            // if creditNoteId not empty update, else add
            if (creditNoteId) {
                againstInvoiceService.put(creditNoteId, newcreditNotes)
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
                againstInvoiceService.add(newcreditNotes)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('againstInvoice/' + data.creditNoteId);
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



    $scope.duplicateAgainstInvoice = function () {

        bootstrapConfirm('Duplicate Against Invoice Credit Note?', function () {
            $scope.duplicating = true;
            againstInvoiceService.duplicate(creditNoteId)
                .success(function (data) {
                    // alert(data.creditNotesOrderId);
                    alert('Successfully duplicated');
                    $location.url('/againstInvoice/' + data.creditNoteId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.duplicating = false;
                });
        });
    }
    // Add item into $scope.creditNotes.creditNoteDetailsList
    $scope.addItem = function () {
        $scope.creditNotes.creditNoteDetailsList.push({});
    }

    // Remove item from $scope.creditNotes.creditNoteDetailsList
    $scope.removeItem = function (index, creditNoteDetailsId) {
        var creditNoteId = $routeParams.id;
        // check if creditNotesDetailsId is null, if not null, call delete item API
        if (creditNoteDetailsId) {
            //alert(creditNoteDetailsId);
            bootstrapConfirm('Do you want to proceed to Delete?', function () {
                againstInvoiceService.deleteItem(creditNoteId, creditNoteDetailsId)
                    .success(function(data) {
                        $scope.creditNotes.creditNoteDetailsList.splice(index, 1);
                    })
                    .error(function(data) {
                        alert(data);
                    });
            });
        } else {
            $scope.creditNotes.creditNoteDetailsList.splice(index, 1);
        }
    }

    $scope.getTotalQuantity = function () {
        var totalQty = 0;
        angular.forEach($scope.creditNotes.creditNoteDetailsList,
            function (value, key) {
                if (value.qty) {
                    totalQty += value.qty;
                }
                else {
                    totalQty = totalQty;
                }
            });

        return totalQty;
    }

    $scope.getTotalPrice = function () {
        var totalPrice = 0;
        var totalDiscount = 0;
        var totalDelivery = 0;
        var creditNotes = $scope.creditNotes;

        angular.forEach(creditNotes.creditNoteDetailsList, function (value, key) {
            if (value.unitPrice && value.qty) {
                totalPrice += (value.unitPrice * value.qty);
            } else {
                totalPrice = totalPrice;
            }
        });

        //// Include Delivery Charge and Additional Charge
        //totalDelivery = creditNotes.additionalCharges + creditNotes.freight;

        //if (totalDelivery) {
        //    totalPrice += totalDelivery;
        //}

        //// Include Discount Amount
        //if (creditNotes.discountType && creditNotes.discountAmount && totalPrice > 0) {
        //    if (creditNotes.discountType == 1) {
        //        // Percentage
        //        totalDiscount = totalPrice * (creditNotes.discountAmount) / 100;
        //    } else {
        //        totalDiscount = creditNotes.discountAmount;
        //    }
        //}

        return totalPrice - totalDiscount;
    };

    $scope.getUOMNumber = function (uomId, uomList) {
        var returnValue = 1;

        angular.forEach(uomList, function (key, value) {
            if (key.productUOMId == uomId) {
                returnValue = key.value;
                return false;
            }
        });

        return returnValue;
    };

    $scope.onChangedCustomer = function (customerId) {
        var currentId = $scope.customer != null ? $scope.customer.customerId : null;
        if (customerId != currentId) {
            // clear supplier object
            $scope.customer = null;

            if (customerId) {
                customerService.get(customerId)
                    .success(function (data) {
                        $scope.customer = data;

                        // If the creditNotes is new, use the customer's default data
                        if (!creditNoteId) {
                            $scope.creditNotes.creditTermId = data.defaultCreditTermId;
                            $scope.creditNotes.currencyId = data.defaultCurrencyId;
                            $scope.creditNotes.discountAmount = data.defaultDiscountAmount;
                            $scope.creditNotes.discountType = data.defaultDiscountType;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    };

    $scope.onChangedInvoice = function (invoice) {
        if (invoice) {
            salesService.getByInvoice(invoice)
                    .success(function (data) {
                        $scope.salesOrder = data;
                        $scope.creditNotes.salesOrderNumber = $scope.salesOrder.salesOrderNumber;
                    })
                    .error(function () {
                        // TODO ERROR
                    });
        }
    }

    $scope.onChangedProduct = function (index, item) {
        var newItem = {};
        //newItem.product = null;
        // Get the creditNoteDetailsId so able to update the line item
        // newItem.creditNoteDetailsId = $scope.creditNotes.creditNoteDetailsList[index].creditNoteDetailsId || null;

        newItem.productId = item.productId;
        newItem.productName = item.name;
        newItem.unitPrice = item.priceSelling;
        newItem.productDescription = item.description;
        newItem.qty = 1;

        //newItem.product = item;
        //newItem.product = {
        //    uom: item.uom,
        //    productUOMList: item.productUOMList,
        //    description : item.description
        //};
        
        $scope.creditNotes.creditNoteDetailsList[index] = newItem;

        $scope.creditNotes.creditNoteDetailsList.push({});
    }

    $scope.onChangedTags = function () {
        var tags = $scope.creditNotes.tags;

        if (angular.isArray(tags)) {
            $scope.creditNotes.tags = tags.join();
        }
    }

    $scope.againstInvoicePDF = function (creditId) {
        return window.open((againstInvoiceService.printPDF(creditId)));
    };

    $scope.onChangedTaxable = function (status) {
        if (status) {
            $scope.creditNotes.isTaxable = 1;
        }
        else {
            $scope.creditNotes.isTaxable = 0;
        }
    }

    // calculate GST
    $scope.getTotalGST = function () {
        $scope.totalGST = $scope.getTotalPrice() * ($scope.creditNotes.tax) > 0 ? $scope.getTotalPrice() * ($scope.creditNotes.tax) : 0;
        return $scope.totalGST;
    }

    // convert Tax in GUI to Tax in database , for example : 7% = 0.07
    $scope.convertTax = function (taxPlus) {
        $scope.creditNotes.tax = taxPlus / 100;
    }

    $scope.getGrandTotal = function () {
        if ($scope.creditNotes.isTaxable == 1)
            $scope.grandTotal = $scope.getTotalPrice() + $scope.getTotalGST();
        else {
            $scope.grandTotal = $scope.getTotalPrice();
        }
        return $scope.grandTotal;
    }
    _init();
});