// CONTROLLERS

// Sales Order List Controller
ACC.controller('OpenCreditNoteListCtrl', function ($scope, $http, openCreditNoteService, errorDisplay) {
    $scope.openCreditNoteTableData = null;

    $scope.loadOpenCreditNote= function () {
        openCreditNoteService.query().success(function (data) {
            $scope.openCreditNoteTableData = data;
        })
    }
    $scope.deleteOpenCreditNote = function (id) {
        openCreditNoteService.delete(id)
            .success(function (data) {
                $scope.loadOpenCreditNote();
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
    };

    $scope.loadOpenCreditNote();
});

// Sales Order Edit Controller
ACC.controller('OpenCreditNoteEditCtrl', function ($scope, $http, $route, $routeParams, $timeout, $location, $modal, errorDisplay, openCreditNoteService, customerService, salesService) {

    var openCreditNoteId = null;

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
        openCreditNoteId = $routeParams.id;
        $scope.openCreditNote = {};
        // $scope.invoice.tags = "";

        $scope.customer = null;
        $scope.newOpenCreditNoteItem = {};

        $scope.busy = false;
        $scope.customerHidden = false;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (openCreditNoteId) {
            // Load Sales with salesId
            openCreditNoteService.get(openCreditNoteId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.openCreditNote);
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
    $scope.saveOpenCreditNote = function () {
        // var i = $scope.invoice.invoiceDetailsList.length;
        // while (i--) {
        //     if (!$scope.invoice.invoiceDetailsList[i].productId) {
        //         $scope.invoice.invoiceDetailsList.splice(i, 1);
        //     }
        // }

        $timeout(function () {

            var newOpenCreditNote = {};
            angular.copy($scope.openCreditNote, newOpenCreditNote);

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
            if (openCreditNoteId) {
                openCreditNoteService.put(openCreditNoteId, newOpenCreditNote)
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
                openCreditNoteService.add(newOpenCreditNote)
                    .success(function (data) {
                        alert('Successfully Added');
                        $location.url('openCreditNotes/' + data.openCreditNoteId);
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


    $scope.duplicateOpenCreditNote = function() {

        bootstrapConfirm('Duplicate Open Credit Note?', function() {
            $scope.duplicating = true;
            openCreditNoteService.duplicate(openCreditNoteId)
                .success(function(data) {
                    // alert(data.salesOrderId);
                    alert('Successfully duplicated');
                    $location.url('/openCreditNotes/' + data.openCreditNoteId);
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
                        if (!openCreditNoteId) {
                            $scope.openCreditNote.creditTermId = data.defaultCreditTermId;
                            $scope.openCreditNote.currencyId = data.defaultCurrencyId;
                            $scope.openCreditNote.discountAmount = data.defaultDiscountAmount;
                            $scope.openCreditNote.discountType = data.defaultDiscountType;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    }
    
    $scope.openCreditNotePDF = function (openCreditNoteId) {
        return window.open((openCreditNoteService.printPDF(openCreditNoteId)));
    };

    _init();
});