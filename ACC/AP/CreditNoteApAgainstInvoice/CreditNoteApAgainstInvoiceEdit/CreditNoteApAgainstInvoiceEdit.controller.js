// CONTROLLERS

// creditNoteApAgainstInvoice List Controller
ACC.controller('CreditNoteApAgainstInvoiceListCtrl', function ($scope, $http, creditNoteApAgainstInvoiceService, errorDisplay) {
    $scope.creditNoteApAgainstInvoice = [];
    var selectedSales = $scope.selectedSales = [];

    $scope.columnDefs = [
            { field: 'creditNoteApAgainstInvoiceNumber', displayName: '#Credit Note Number' },
            { field: 'referenceNumber', displayName: '#Reference Number' },
            { field: 'supplier.companyName', displayName: 'Company Name' },
            { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date' },
            { field: 'grandTotal', displayName: 'Total', cellFilter: 'currency' },
            { field: 'creditNoteApAgainstInvoiceId', displayName: 'Actions', cellTemplate: '<a href="#/creditNoteApAgainstInvoice/{{row.entity.creditNoteApAgainstInvoiceId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.creditNoteApAgainstInvoiceId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        showSelectionCheckbox: false
    };
});

// creditNoteApAgainstInvoice Edit Controller
ACC.controller('CreditNoteApAgainstInvoiceEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, errorDisplay, creditNoteApAgainstInvoiceService, supplierInvoiceService, purchaseService, productService) {

    var creditNoteApAgainstInvoiceId = null;

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
        creditNoteApAgainstInvoiceId = $routeParams.id;
        $scope.newSession = null;
        if ($routeParams.id) {
            $scope.newSession = false;
        } else {
            $scope.newSession = true;
        }
        $scope.creditNoteApAgainstInvoice = {};
        // $scope.invoice.tags = "";

        $scope.customer = null;
        // $scope.newOpenCreditNoteItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (creditNoteApAgainstInvoiceId) {
            // Load creditNotes with creditNoteId
            creditNoteApAgainstInvoiceService.get(creditNoteApAgainstInvoiceId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.creditNoteApAgainstInvoice);
                // set tags by scope tags populated via tagsChanged method
                // $scope.invoice.tags = data.tags;
                // explicitly set details as result details
                if (data.creditNoteApAgainstInvoiceDetailsList.length) {
                    $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList = data.creditNoteApAgainstInvoiceDetailsList;
                 } else {
                    $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList = [{}];
                 }
                // assign supplier object to scope, this will show the customer sidebar
                $scope.supplier = data.supplier;
                //switch tax to tax * 100
                 $scope.creditNoteApAgainstInvoice.taxPlus = $scope.creditNoteApAgainstInvoice.tax * 100;
                $scope.busy = false;
            });
        } else {
            $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList = [{}];
            $scope.busy = false;
        }
    }

    // process the form
    $scope.saveCreditNoteApAgainstInvoice = function () {
        var i = $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList.length;
        while (i--) {
            if (!$scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList[i].productId) {
                $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList.splice(i, 1);
            }
        }

        $timeout(function () {

            var newCreditNoteApAgainstInvoice = {};
            $scope.creditNoteApAgainstInvoice.amount = $scope.getGrandTotal();
            angular.copy($scope.creditNoteApAgainstInvoice, newCreditNoteApAgainstInvoice);

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
            if (creditNoteApAgainstInvoiceId) {
                creditNoteApAgainstInvoiceService.put(creditNoteApAgainstInvoiceId, newCreditNoteApAgainstInvoice)
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
                creditNoteApAgainstInvoiceService.add(newCreditNoteApAgainstInvoice)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('creditNoteApAgainstInvoice/' + data.creditNoteApAgainstInvoiceId);
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

    // Add item into $scope.creditNotes.creditNoteDetailsList
    $scope.addItem = function () {
        $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList.push({});
    }

    // Remove item from $scope.creditNotes.creditNoteDetailsList
    $scope.removeItem = function (index, creditNoteApAgainstInvoiceDetailsId) {
        var creditNoteId = $routeParams.id;
        // check if creditNotesDetailsId is null, if not null, call delete item API
        if (creditNoteApAgainstInvoiceDetailsId) {
            //alert(creditNoteDetailsId);
            bootstrapConfirm('Do you want to proceed to Delete?', function () {
                creditNoteApAgainstInvoiceService.deleteItem(creditNoteId, creditNoteApAgainstInvoiceDetailsId)
                    .success(function(data) {
                        $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList.splice(index, 1);
                    })
                    .error(function(data) {
                        alert(data);
                    });
            });
        } else {
            $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList.splice(index, 1);
        }
    }

    $scope.getTotalQuantity = function () {
        var totalQty = 0;
        angular.forEach($scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList,
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
        var creditNoteApAgainstInvoice = $scope.creditNoteApAgainstInvoice;

        angular.forEach(creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList, function (value, key) {
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
                        if (!creditNoteApAgainstInvoiceId) {
                            $scope.creditNoteApAgainstInvoice.supplierInvoiceList = data;
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
            angular.forEach($scope.creditNoteApAgainstInvoice.supplierInvoiceList, function (value, key) {
                if (value.supplierInvoiceId == invoice) {
                    $scope.creditNoteApAgainstInvoice.purchaseOrderNumber = value.purchaseOrder.purchaseOrderNumber;
                    $scope.creditNoteApAgainstInvoice.currencyId = value.purchaseOrder.currencyId;
                    $scope.creditNoteApAgainstInvoice.paymentTermId = value.paymentTermId;
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
        
        $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList[index] = newItem;

        $scope.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceDetailsList.push({});
    }

    $scope.onChangedTags = function () {
        var tags = $scope.creditNoteApAgainstInvoice.tags;

        if (angular.isArray(tags)) {
            $scope.creditNoteApAgainstInvoice.tags = tags.join();
        }
    }

    $scope.openPDF = function () {
        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'ACC/AP/CreditNoteApAgainstInvoice/CreditNoteApAgainstInvoiceEdit/CreditNoteApAgainstInvoicePDF.modal.html?a=aaaa',
            controller: function ($scope, $log, $modalInstance, creditNoteApAgainstInvoiceService, $filter, $sce, errorDisplay, $translate) {

                //$scope.returnOrder = returnOrder;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    creditNoteApAgainstInvoiceService.printPDF(creditNoteApAgainstInvoiceId)
                        .success(function (data) {
                            // on success, open the pdf in iFrame
                            var file = new Blob([data], { type: 'application/pdf' });
                            var fileUrl = URL.createObjectURL(file);

                            $scope.pdfUrl = $sce.trustAsResourceUrl(fileUrl);
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
                };

                // init Preview PDF
                $scope.previewPDF();

                // open email dialog
                $scope.ok = function () {
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        });

    };

    $scope.onChangedTaxable = function (status) {
        if (status) {
            $scope.creditNoteApAgainstInvoice.isTaxable = 1;
        }
        else {
            $scope.creditNoteApAgainstInvoice.isTaxable = 0;
        }
    }

    // calculate GST
    $scope.getTaxAmount = function () {
        $scope.taxAmount = $scope.getTotalPrice() * ($scope.creditNoteApAgainstInvoice.tax) > 0 ? $scope.getTotalPrice() * ($scope.creditNoteApAgainstInvoice.tax) : 0;
        $scope.creditNoteApAgainstInvoice.taxAmount = Math.floor($scope.taxAmount);
        return $scope.taxAmount;
    }

    // convert Tax in GUI to Tax in database , for example : 7% = 0.07
    $scope.convertTax = function (taxPlus) {
        $scope.creditNoteApAgainstInvoice.tax = taxPlus / 100;
    }

    $scope.getGrandTotal = function () {
        if ($scope.creditNoteApAgainstInvoice.isTaxable == 1)
            $scope.grandTotal = $scope.getTotalPrice() + $scope.getTaxAmount();
        else {
            $scope.grandTotal = $scope.getTotalPrice();
        }
        $scope.creditNoteApAgainstInvoice.grandTotal = $scope.grandTotal;
        return $scope.grandTotal;
    }
    _init();
});