// CONTROLLERS

// Sales Order List Controller
ACC.controller('AdvanceCreditNoteListCtrl', function ($scope, $http, advanceCreditNoteService, errorDisplay) {
    $scope.advanceCreditNoteTableData = null;

    $scope.loadAdvanceCreditNote= function () {
        advanceCreditNoteService.query().success(function (data) {
            $scope.advanceCreditNoteTableData = data;
        })
    }
    $scope.deleteAdvanceCreditNote = function (id) {
        advanceCreditNoteService.delete(id)
            .success(function (data) {
                $scope.loadAdvanceCreditNote();
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
    };

    $scope.loadAdvanceCreditNote();
});

// Sales Order Edit Controller
ACC.controller('AdvanceCreditNoteEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, errorDisplay, advanceCreditNoteService, customerService, salesService) {

    var advanceCreditNoteId = null;

    $scope.busy = false;
    // $scope.converting = false;

    // SELECT2 AJAX EXAMPLE * DO NOT REMOVE
    $scope.select2Tags = {
        minimumInputLength: 3,
        'multiple': true,
        'simple_tags': true,
        'tags': [],  // Can be empty list.
    };

    $scope.select2OptionsProduct = {
        minimumInputLength: 3,
        id: function (obj) {
            return obj.productId; // use slug field for id
        },
        query: function (query) {
            productService.query(query.term).success(function (data) {
                query.callback({ results: data });
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
        advanceCreditNoteId = $routeParams.id;
        $scope.advanceCreditNote = {};
        // $scope.invoice.tags = "";

        $scope.customer = null;
        $scope.newAdvanceCreditNoteItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (advanceCreditNoteId) {
            // Load Sales with salesId
            advanceCreditNoteService.get(advanceCreditNoteId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.advanceCreditNote);
                // set tags by scope tags populated via tagsChanged method
                // $scope.invoice.tags = data.tags;
                // explicitly set details as result details
                // if (data.invoiceDetailsList.length) {
                //     $scope.invoice.invoiceDetailsList = data.invoiceDetailsList;
                // } else {
                //     $scope.invoice.invoiceDetailsList = [{}];
                // }

                // assign customer object to scope, this will show the customer sidebar
                $scope.customer = data.customer;
                $scope.busy = false;
            });
        } else {
            // $scope.openCreditNote.invoiceDetailsList = [{}];
            $scope.busy = false;
        }
    }

    // process the form
    $scope.saveAdvanceCreditNote = function () {
        // var i = $scope.invoice.invoiceDetailsList.length;
        // while (i--) {
        //     if (!$scope.invoice.invoiceDetailsList[i].productId) {
        //         $scope.invoice.invoiceDetailsList.splice(i, 1);
        //     }
        // }

        $timeout(function () {

            var newAdvanceCreditNote = {};
            angular.copy($scope.advanceCreditNote, newAdvanceCreditNote);

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
            if (advanceCreditNoteId) {
                advanceCreditNoteService.put(advanceCreditNoteId, newAdvanceCreditNote)
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
                advanceCreditNoteService.add(newAdvanceCreditNote)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('advanceCreditNotes/' + data.advanceCreditNoteId);
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
    $scope.onChangedSalesOrder = function(salesOrder)
    {
        // salesOrder = angular.fromJson(salesOrder);
        // console.log(salesOrder);
        $scope.advanceCreditNote.salesOrderId = salesOrder;
        // angular.forEach(salesOrder.salesOrderDetailsList, function(v,k){
        //     $scope.invoice.invoiceDetailsList[k].assetMovements = null;
        //     $scope.invoice.invoiceDetailsList[k].deliveryOrderDetailsList = null;
        //     $scope.invoice.invoiceDetailsList[k].salesOrderDetailsId = v.salesOrderDetailsId;
        // }); 
        // console.log(salesOrder.salesOrderDetailsList);
    }
    $scope.duplicateAdvanceCreditNote = function() {

        bootstrapConfirm('Duplicate Advance Credit Note?', function () {
            $scope.duplicating = true;
            advanceCreditNoteService.duplicate(advanceCreditNoteId)
                .success(function(data) {
                    // alert(data.salesOrderId);
                    alert('Successfully duplicated');
                    $location.url('/advanceCreditNotes/' + data.advanceCreditNoteId);
                })
                .error(function(error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function() {
                    $scope.duplicating = false;
                });
        });
    };

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
    //     $scope.openCreditNote.invoiceDetailsList.push({});
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
    // $scope.onChangedCustomer = function(customer)
    // {
    //     customer = angular.fromJson(customer);

    //     // console.log(salesOrder);
        
    //     $scope.openCreditNote.customerId = customer.customerId;

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
                customerService.getCustomerWithUnPaidSalesOrder(customerId)
                    .success(function (data) {
                        $scope.customer = data;
                        $scope.advanceCreditNote.salesOrdersList = data.salesOrdersList;
                        //alert($scope.advanceCreditNote.salesOrdersList[0].salesOrderNumber);
                        // If the sales order is new, use the customer's default data
                        if (!advanceCreditNoteId) {
                            $scope.advanceCreditNote.creditTermId = data.defaultCreditTermId;
                            $scope.advanceCreditNote.currencyId = data.defaultCurrencyId;
                            $scope.advanceCreditNote.discountAmount = data.defaultDiscountAmount;
                            $scope.advanceCreditNote.discountType = data.defaultDiscountType;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
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

    $scope.advanceCreditNotePDF = function (advanceCreditNoteId) {
        return window.open((advanceCreditNoteService.printPDF(advanceCreditNoteId)));
    };
    
    _init();
});