// CONTROLLERS

// Sales Order List Controller
ACC.controller('DebitNoteListCtrl', function ($scope, $http, debitNoteService, errorDisplay) {
    $scope.debitNoteTableData = null;

    $scope.loadDebitNote = function () {
        debitNoteService.query().success(function (data) {
            $scope.debitNoteTableData = data;
        })
    }
    $scope.deleteDebitNote = function (id) {
        debitNoteService.delete(id)
            .success(function (data) {
                $scope.loadDebitNote();
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
    };

    $scope.loadDebitNote();
});

// Sales Order Edit Controller
ACC.controller('DebitNoteEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, errorDisplay, debitNoteService, customerService, salesService) {

    var debitNoteId = null;

    $scope.busy = false;
    // $scope.converting = false;
    var _init = function () {
        debitNoteId = $routeParams.id;
        $scope.debitNote = {};
        // $scope.debitNote.tags = "";

        $scope.customer = null;
        $scope.newDebitNoteItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (debitNoteId) {
            // Load Sales with salesId
            debitNoteService.get(debitNoteId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.debitNote);
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
    $scope.saveDebitNote = function () {
        // var i = $scope.debitNote.debitNoteDetailsList.length;
        // while (i--) {
        //     if (!$scope.debitNote.debitNoteDetailsList[i].productId) {
        //         $scope.debitNote.debitNoteDetailsList.splice(i, 1);
        //     }
        // }
        $timeout(function () {

            var newDebitNote = {};
            angular.copy($scope.debitNote, newDebitNote);

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
            if (debitNoteId) {
                debitNoteService.put(debitNoteId, newDebitNote)
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
                debitNoteService.add(newDebitNote)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('debitNotes/' + data.debitNoteId);
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

    // $scope.preview = function (sales) {
    //     var dialog = $modal.open({
    //         backdrop: true,
    //         windowClass: 'modal-preview',
    //         keyboard: true,
    //         templateUrl: 'ORD/Sales/sales.print.html?a=a',
    //         controller: function ($scope, $log, $modalInstance, productService, $filter, getTotalPrice, getTotalQuantity) {

    //             $scope.sales = sales;

    //             $scope.getTotalPrice = function () {
    //                 return getTotalPrice;
    //             }
    //             $scope.getTotalQuantity = function () {
    //                 return getTotalQuantity;
    //             }

    //             $scope.ok = function () {
    //                 $modalInstance.close();
    //             }

    //             $scope.cancel = function () {
    //                 $modalInstance.dismiss('cancel');
    //             };
    //         },
    //         resolve: {
    //             getTotalPrice: function () {
    //                 return $scope.getTotalPrice();
    //             },
    //             getTotalQuantity: function () {
    //                 return $scope.getTotalQuantity();
    //             }
    //         }
    //     });
    // }

    // $scope.convertToDO = function () {
    //     var newSales = {};

    //     angular.copy($scope.sales, newSales);

    //     if (confirm('Convert Sales Order to Delivery Order?')) {
    //         salesService.convertToDO(salesId, newSales)
    //             .success(function (data) {
    //                 alert('Successfully Updated');
    //                 $route.reload();
    //             })
    //             .error(function (error) {
    //                 errorDisplay.show(error);
    //             })
    //             .finally(function () {
    //                 $scope.busy = false;
    //             });
    //     }
    // }

    $scope.duplicateDebitNote = function () {

        bootstrapConfirm('Duplicate Debit Note?', function () {
            $scope.duplicating = true;
            debitNoteService.duplicate(debitNoteId)
                .success(function(data) {
                    // alert(data.salesOrderId);
                    alert('Successfully duplicated');
                    $location.url('/debitNotes/' + data.debitNoteId);
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

    // $scope.getUOMNumber = function (uomId, uomList) {
    //     var returnValue = 1;

    //     angular.forEach(uomList, function (key, value) {
    //         if (key.productUOMId == uomId) {
    //             returnValue = key.value;
    //             return false;
    //         };
    //     });

    //     return returnValue;
    // }

    // $scope.selectAddress = function (address, addressType) {
    //     if (addressType == 'Shipping') {
    //         $scope.sales.shipName = $scope.customer.companyName;
    //         $scope.sales.shipAddress = address.fullAddress;
    //         $scope.sales.shipCity = address.countryCity;
    //         //$scope.sales.shipRegion = address.
    //         $scope.sales.shipPostalCode = address.postalCode;
    //         $scope.sales.shipCountry = address.country;

    //     } else if (addressType == 'Billing') {
    //         $scope.sales.billName = $scope.customer.companyName;
    //         $scope.sales.billAddress = address.fullAddress;
    //         $scope.sales.billCity = address.countryCity;
    //         //$scope.sales.shipRegion = address.
    //         $scope.sales.billPostalCode = address.postalCode;
    //         $scope.sales.billCountry = address.country;
    //     }
    // }

    // $scope.editAddress = function (addressType) {
    //     $scope.showEditBilling = false;
    //     $scope.showEditShipping = false;
    //     if (addressType == 'Shipping') {
    //         $scope.showEditBilling = true;
    //     } else if (addressType == 'Billing') {
    //         $scope.showEditShipping = true;
    //     }
    // }

    // $scope.removeAddress = function (addressType) {
    //     if (addressType == 'Shipping') {
    //         $scope.sales.shipName = null;
    //         $scope.sales.shipAddress = null;
    //         $scope.sales.shipCity = null;
    //         //$scope.sales.shipRegion = address.
    //         $scope.sales.shipPostalCode = null;
    //         $scope.sales.shipCountry = null;

    //     } else if (addressType == 'Billing') {
    //         $scope.sales.billName = null;
    //         $scope.sales.billAddress = null;
    //         $scope.sales.billCity = null;
    //         //$scope.sales.shipRegion = address.
    //         $scope.sales.billPostalCode = null;
    //         $scope.sales.billCountry = null;
    //     }
    // }

    // Add item into $scope.sales.salesOrderDetailsList
    // $scope.addItem = function () {
    //     $scope.debitNote.invoiceDetailsList.push({});
    // }

    // Remove item from $scope.sales.salesOrderDetailsList
    // $scope.removeItem = function (index, invoiceDetailsId) {
    //     var invoiceId = $routeParams.id;
    //     // check if salesOrderDetailsId is null, if not null, call delete item API
    //     if (invoiceDetailsId) {
    //         if (confirm('Do you want to proceed to Delete?')) {
    //             invoiceService.deleteItem(invoiceId, invoiceDetailsId)
    //                 .success(function (data) {
    //                     $scope.invoice.invoiceDetailsList.splice(index, 1);
    //                 })
    //                 .error(function (data) {
    //                     alert(data);
    //                 });
    //         }
    //     } else {
    //         $scope.invoice.invoiceDetailsList.splice(index, 1);
    //     }
    // }

    // $scope.getTotalQuantity = function () {
    //     var totalQty = 0;
    //     angular.forEach($scope.sales.salesOrderDetailsList,
    //         function (value, key) {
    //             if (value.qty) {
    //                 totalQty += value.qty;
    //             }
    //             else {
    //                 totalQty = totalQty
    //             }
    //         });

    //     return totalQty;
    // }

    // $scope.getTotalPrice = function () {
    //     var totalPrice = 0;
    //     var totalDiscount = 0;
    //     var totalDelivery = 0;
    //     var sales = $scope.sales;

    //     angular.forEach(sales.salesOrderDetailsList, function (value, key) {
    //         if (value.unitPrice && value.qty) {
    //             totalPrice += (value.unitPrice * value.qty);
    //         } else {
    //             totalPrice = totalPrice;
    //         }
    //     });

    //     // Include Delivery Charge and Additional Charge
    //     totalDelivery = sales.additionalCharges + sales.freight;

    //     if (totalDelivery) {
    //         totalPrice += totalDelivery;
    //     }

    //     // Include Discount Amount
    //     if (sales.discountType && sales.discountAmount && totalPrice > 0) {
    //         if (sales.discountType == 1) {
    //             // Percentage
    //             totalDiscount = totalPrice * (sales.discountAmount) / 100;
    //         } else {
    //             totalDiscount = sales.discountAmount;
    //         }
    //     }

    //     return totalPrice - totalDiscount;
    // }

    // $scope.getTotalGST = function () {
    //     var total = $scope.getTotalPrice();

    //     return total * 0.07 > 0 ? total * 0.07 : 0;
    // }

    // $scope.getTotalGrand = function () {
    //     var totalGST = $scope.getTotalGST();
    //     var totalPrice = $scope.getTotalPrice();

    //     return totalGST + totalPrice;
    // }

    // Load Customer on dropdown select change
    // $scope.onChangedSalesOrder = function(salesOrder)
    // {
    //     salesOrder = angular.fromJson(salesOrder);
    //     // console.log(salesOrder);
    //     // $scope.debitNote.invoiceDetailsList = salesOrder.salesOrderDetailsList;
    //     // angular.forEach(salesOrder.salesOrderDetailsList, function(v,k){
    //     //     $scope.invoice.invoiceDetailsList[k].assetMovements = null;
    //     //     $scope.invoice.invoiceDetailsList[k].deliveryOrderDetailsList = null;
    //     //     $scope.invoice.invoiceDetailsList[k].salesOrderDetailsId = v.salesOrderDetailsId;
    //     // }); 
    //     // console.log(salesOrder.salesOrderDetailsList);
    // }

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
                        if (!debitNoteId) {
                            $scope.debitNote.creditTermId = data.defaultCreditTermId;
                            $scope.debitNote.currencyId = data.defaultCurrencyId;
                            $scope.debitNote.discountAmount = data.defaultDiscountAmount;
                            $scope.debitNote.discountType = data.defaultDiscountType;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    }

    $scope.onChangedPaymentTerm = function(paymentTermId)
    {
        $scope.debitNote.paymentTermId = paymentTermId;
    }

    $scope.onChangedCurrencies = function(currencyId)
    {
        $scope.debitNote.currencyId = currencyId;
    }

    // $scope.onChangedProduct = function (index, item) {
    //     var newItem = {};
    //     newItem.product = {};

    //     // Get the salesOrderDetailsId so able to update the line item
    //     // newItem.salesOrderDetailsId = $scope.sales.salesOrderDetailsList[index].salesOrderDetailsId || null;

    //     newItem.productId = item.productId;
    //     newItem.productName = item.name;
    //     newItem.unitPrice = item.priceSelling;
    //     newItem.description = item.description;
    //     newItem.qty = 1;

    //     newItem.product.uom = item.uom;
    //     newItem.product.productUOMList = item.productUOMList;

    //     $scope.sales.salesOrderDetailsList[index] = newItem;

    //     $scope.sales.salesOrderDetailsList.push({});
    // }

    // $scope.onChangedTags = function () {
    //     var tags = $scope.sales.tags;

    //     if (angular.isArray(tags)) {
    //         $scope.sales.tags = tags.join();
    //     }
    // }

    $scope.debitNotePDF = function (debitNoteId) {
        return window.open((debitNoteService.printPDF(debitNoteId)));
    };
    
    _init();
});