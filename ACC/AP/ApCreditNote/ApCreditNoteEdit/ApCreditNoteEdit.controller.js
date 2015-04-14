// CONTROLLERS

// apCreditNote List Controller
ACC.controller('ApCreditNoteListCtrl', function ($scope, $http, apCreditNoteService, errorDisplay) {
    //$scope.apCreditNoteTableData = null;

    //$scope.loadApCreditNote = function () {
    //    apCreditNoteService.query().success(function(data) {
    //        $scope.apCreditNoteTableData = data;
    //    });
    //}

    //$scope.deleteApCreditNote = function (id) {
    //    apCreditNoteService.delete(id)
    //        .success(function(data) {
    //            $scope.loadApCreditNote();
    //        })
    //        .error(function(error) {
    //            errorDisplay.show(error);
    //        });
    //};

    //$scope.loadApCreditNote();
    $scope.apcreditnote = [];
    var selectedSales = $scope.selectedSales = [];

    $scope.columnDefs = [
            { field: 'apCreditNoteNumber', displayName: '#Credit Note Number' },
            { field: 'referenceNumber', displayName: '#Reference Number' },
            { field: 'supplier.companyName', displayName: 'Company Name' },
            { field: 'apCreditNoteDate', displayName: 'Date Created', cellFilter: 'date' },
            { field: 'grandTotal', displayName: 'Total', cellFilter: 'currency' },
            { field: 'apCreditNoteId', displayName: 'Actions', cellTemplate: '<a href="#/apCreditNote/{{row.entity.apCreditNoteId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.apCreditNoteId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        showSelectionCheckbox: false
    };
});

// apCreditNote Edit Controller
ACC.controller('ApCreditNoteEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, errorDisplay, apCreditNoteService, supplierInvoiceService, purchaseService, productService) {

    var apCreditNoteId = null;

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
        apCreditNoteId = $routeParams.id;
        $scope.newSession = null;
        if ($routeParams.id) {
            $scope.newSession = false;
        } else {
            $scope.newSession = true;
        }
        $scope.apCreditNote = {};
        // $scope.invoice.tags = "";

        $scope.customer = null;
        // $scope.newOpenCreditNoteItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (apCreditNoteId) {
            // Load creditNotes with creditNoteId
            apCreditNoteService.get(apCreditNoteId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.apCreditNote);
                // set tags by scope tags populated via tagsChanged method
                // $scope.invoice.tags = data.tags;
                // explicitly set details as result details
                if (data.apCreditNoteDetailsList.length) {
                    $scope.apCreditNote.apCreditNoteDetailsList = data.apCreditNoteDetailsList;
                 } else {
                    $scope.apCreditNote.apCreditNoteDetailsList = [{}];
                 }
                // assign supplier object to scope, this will show the customer sidebar
                $scope.supplier = data.supplier;
                //switch tax to tax * 100
                 $scope.apCreditNote.taxPlus = $scope.apCreditNote.tax * 100;
                $scope.busy = false;
            });
        } else {
            $scope.apCreditNote.apCreditNoteDetailsList = [{}];
            $scope.busy = false;
        }
    }

    // process the form
    $scope.saveApCreditNote = function () {
        var i = $scope.apCreditNote.apCreditNoteDetailsList.length;
        while (i--) {
            if (!$scope.apCreditNote.apCreditNoteDetailsList[i].productId) {
                $scope.apCreditNote.apCreditNoteDetailsList.splice(i, 1);
            }
        }

        $timeout(function () {

            var newApCreditNote = {};
            $scope.apCreditNote.amount = $scope.getGrandTotal();
            angular.copy($scope.apCreditNote, newApCreditNote);

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
            if (apCreditNoteId) {
                apCreditNoteService.put(apCreditNoteId, newApCreditNote)
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
                apCreditNoteService.add(newApCreditNote)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('apCreditNote/' + data.apCreditNoteId);
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



    $scope.duplicateApCreditNote = function () {

        bootstrapConfirm('Duplicate Account Payables Credit Note Against Invoice?', function () {
            $scope.duplicating = true;
            apCreditNoteService.duplicate(apCreditNoteId)
                .success(function (data) {
                    alert('Successfully duplicated');
                    $location.url('/apCreditNote/' + data.apCreditNoteId);
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
        $scope.apCreditNote.apCreditNoteDetailsList.push({});
    }

    // Remove item from $scope.creditNotes.creditNoteDetailsList
    $scope.removeItem = function (index, apCreditNoteDetailsId) {
        var creditNoteId = $routeParams.id;
        // check if creditNotesDetailsId is null, if not null, call delete item API
        if (apCreditNoteDetailsId) {
            //alert(creditNoteDetailsId);
            bootstrapConfirm('Do you want to proceed to Delete?', function () {
                apCreditNoteService.deleteItem(creditNoteId, apCreditNoteDetailsId)
                    .success(function(data) {
                        $scope.apCreditNote.apCreditNoteDetailsList.splice(index, 1);
                    })
                    .error(function(data) {
                        alert(data);
                    });
            });
        } else {
            $scope.apCreditNote.apCreditNoteDetailsList.splice(index, 1);
        }
    }

    $scope.getTotalQuantity = function () {
        var totalQty = 0;
        angular.forEach($scope.apCreditNote.apCreditNoteDetailsList,
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
        var apCreditNote = $scope.apCreditNote;

        angular.forEach(apCreditNote.apCreditNoteDetailsList, function (value, key) {
            if (value.unitPrice && value.qty) {
                totalPrice += (value.unitPrice * value.qty);
            } else {
                totalPrice = totalPrice;
            }
        });
        
        return totalPrice - totalDiscount;
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

    $scope.onChangedSupplier = function (supplierId) {
        var currentId = $scope.supplier != null ? $scope.supplier.supplierId : null;
        if (supplierId != currentId) {
            // clear supplier object
            $scope.supplier = null;
            
            if (supplierId) {
                supplierInvoiceService.getBySupplier(supplierId)
                    .success(function (data) {
                        // If the creditNotes is new, use the supplier's default data
                        if (!apCreditNoteId) {
                            $scope.apCreditNote.supplierInvoiceList = data;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    }

    $scope.onChangedInvoice = function (invoice) {
        if (invoice) {
            angular.forEach($scope.apCreditNote.supplierInvoiceList, function (value, key) {
                if (value.supplierInvoiceId == invoice) {
                    $scope.apCreditNote.purchaseOrderNumber = value.purchaseOrder.purchaseOrderNumber;
                    $scope.apCreditNote.currencyId = value.purchaseOrder.currencyId;
                    $scope.apCreditNote.paymentTermId = value.paymentTermId;
                }
            });
        }
    }

    $scope.onChangedProduct = function (index, item) {
        var newItem = {};
        
        newItem.productId = item.productId;
        newItem.productName = item.name;
        newItem.unitPrice = item.priceSelling;
        newItem.productDescription = item.description;
        newItem.qty = 1;
        
        $scope.apCreditNote.apCreditNoteDetailsList[index] = newItem;

        $scope.apCreditNote.apCreditNoteDetailsList.push({});
    }

    $scope.onChangedTags = function () {
        var tags = $scope.apCreditNote.tags;

        if (angular.isArray(tags)) {
            $scope.apCreditNote.tags = tags.join();
        }
    }

    $scope.apCreditNotePDF = function (creditId) {
        return window.open((apCreditNoteService.printPDF(creditId)));
    };

    $scope.onChangedTaxable = function (status) {
        if (status) {
            $scope.apCreditNote.isTaxable = 1;
        }
        else {
            $scope.apCreditNote.isTaxable = 0;
        }
    }

    // calculate GST
    $scope.getTaxAmount = function () {
        $scope.taxAmount = $scope.getTotalPrice() * ($scope.apCreditNote.tax) > 0 ? $scope.getTotalPrice() * ($scope.apCreditNote.tax) : 0;
        $scope.apCreditNote.taxAmount = $scope.taxAmount;
        return $scope.taxAmount;
    }

    // convert Tax in GUI to Tax in database , for example : 7% = 0.07
    $scope.convertTax = function (taxPlus) {
        $scope.apCreditNote.tax = taxPlus / 100;
    }

    $scope.getGrandTotal = function () {
        if ($scope.apCreditNote.isTaxable == 1)
            $scope.grandTotal = $scope.getTotalPrice() + $scope.getTaxAmount();
        else {
            $scope.grandTotal = $scope.getTotalPrice();
        }
        $scope.apCreditNote.grandTotal = $scope.grandTotal;
        return $scope.grandTotal;
    }
    _init();
});