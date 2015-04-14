

PUR.controller('ReturnOrderListCtrl', function ($rootScope, $scope, returnOrderService) {
    $scope.purchaseOrders = [];

    var selectedReturnOrder = $scope.selectedReturnOrder = [];

    $scope.columnDefs = [
        { field: 'returnOrderId', displayName: 'ID' },
        { field: 'supplier.companyName', displayName: 'Supplier' },
        { field: 'grandTotal', displayName: 'Total Amount' },
        { field: 'returnOrderDate', displayName: 'Date', cellFilter: 'date' },
        { field: 'returnOrderId', displayName: 'Actions', cellTemplate: '<a href="#/returnOrder/{{row.entity.returnOrderId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.returnOrderId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        showSelectionCheckbox: false
    };
});


PUR.controller('ReturnOrderIdEditCtrl', function ($rootScope, $scope, $routeParams, returnOrderService, supplierInvoiceService, creditNoteApAgainstInvoiceService, $location, $modal, $translate, $filter, $sce, errorDisplay) {
    $scope.submitted = false;
    $scope.busy = false;
    $scope.checkEdit = false;
    $scope.returnOrder = {};
    $scope.temp = null;

    var returnOrderId = $routeParams.id;

    var _init = function () {
        if (returnOrderId) {
            $scope.checkEdit = false;
            returnOrderService.get(returnOrderId)
                .success(function (data, status) {
                    $scope.returnOrder = data;
                    if (data.tax != null && data.tax > 0) {
                        $scope.returnOrder.isTaxable = true;
                    }

                    //$scope.purchaseSelectedObject = data.purchaseOrder;
                    //$scope.returnOrder.currencyId = data.purchaseOrder.currencyId;
                    angular.forEach(data.supplierInvoiceDetailsList, function (key, index) {
                        key.purchaseOrderDetails = [];
                    });
                    $scope.returnOrder.purchaseOrder = [];
                    $scope.returnOrder.purchaseOrder.push({purchaseOrderDetailsList: data.supplierInvoiceDetailsList});
                })
                .error(function () { alert('Error load Return Order Information. Please try again later.'); })
                .finally();
        } else {
            $scope.checkEdit = true;
        }
    };

    $scope.save = function () {
        $scope.submitted = true;

        if (!$scope.myForm.$valid) {
            alert('Please check your input data!');
            return false;
        }

        if (returnOrderId) {
            $scope.busy = true;
            returnOrderService.put(returnOrderId, $scope.returnOrder)
                .success(function (data, status) {
                    alert('Update successfull!');
                    $rootScope.reload();
                })
                .error(function (error) { errorDisplay.show(error); })
                .finally(function () { $scope.busy = false; });
        } else {
            $scope.busy = true;
            console.log($scope.returnOrder);
            returnOrderService.add($scope.returnOrder)
                .success(function (data, status) {
                    alert('Add Return Order Successfull!');
                    $location.url('returnOrder/' + data.returnOrderId);
                })
                .error(function () { alert('Error Adding Return Order!'); })
                .finally(function () { $scope.busy = false; $scope.submitted = false; });
        }
    };

    $scope.openPDF = function () {
        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'PUR/ReturnOrder/ReturnOrderEdit/returnOrderPDF.modal.html?a=aaaa',
            controller: function ($scope, $log, $modalInstance, returnOrderService, $filter, $sce, errorDisplay) {

                //$scope.returnOrder = returnOrder;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    returnOrderService.printPDF(returnOrderId)
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

    $scope.getDiscount = function () {
        var value = $scope.returnOrder.discountAmount;
        return (value != null && value > 0) ? value : 0;
    };

    $scope.getDeliveryCharges = function () {
        var value = $scope.returnOrder.deliveryChargeAmount;
        return (value != null && value > 0) ? value : 0;
    };

    $scope.getGST = function () {
        var checkIsTaxable = $scope.returnOrder.isTaxable;
        var GST = $scope.returnOrder.tax;
        return (checkIsTaxable && GST > 0 && GST != null) ? (GST / 100) : 0;
    };

    $scope.getGrandTotal = function (listArray) {
        var totalBeforeTax = 0, totalQuantity = 0, totalAfterDiscount = 0, totalTaxValue = 0, totalAfterTax = 0;
        var discountValue = $scope.getDiscount();
        var GSTValue = $scope.getGST();
        var deliveryChargeValue = $scope.getDeliveryCharges();

        angular.forEach(listArray, function (key, index) {
            var qty = parseInt(key.qty);
            var unitPrice = parseInt(key.unitPrice);
            totalQuantity = totalQuantity + qty;
            totalBeforeTax = totalBeforeTax + (qty * unitPrice);
        });
        $scope.TotalQuantity = totalQuantity;
        totalTaxValue = (totalBeforeTax - discountValue + deliveryChargeValue) * GSTValue;
        totalAfterTax = (totalBeforeTax - discountValue + deliveryChargeValue) + totalTaxValue;
        $scope.returnOrder.grandTotal = totalAfterTax;

        return totalAfterTax;
    };

    $scope.removeItem = function (index) {
        var listArray = $scope.returnOrder.purchaseOrderDetailsList;
        listArray.splice(index, 1);
    };

    $scope.onChangedSupplier = function (supplierId) {
        $scope.checkSupplierExist = supplierId;
        $scope.returnOrder.purchaseOrderList = {};
        if (supplierId) {
            supplierInvoiceService.getPurchaseOrderBySupplierId(supplierId, false)
                .success(function (data, status) {
                    $scope.returnOrder.purchaseOrderList = data;
                })
                .error(function () { console.log('ERROR LOAD PURCHASE ORDER LIST OF SUPPLIER!'); })
                .finally();
        }
    };

    $scope.onChangePurchaseOrder = function (purchaseOrderId) {
        angular.forEach($scope.returnOrder.purchaseOrderList, function (key, index) {
            if (key.purchaseOrderId == purchaseOrderId) {
                $scope.returnOrder.paymentTermId = key.paymentTermId;
                $scope.returnOrder.discountAmount = key.discountAmount;
                $scope.returnOrder.currencyId = key.currencyId;
                $scope.returnOrder.purchaseOrderDetailsList = key.purchaseOrderDetailsList;
                $scope.returnOrder.returnOrderDetailsList = key.purchaseOrderDetailsList;
                $scope.returnOrder.tax = key.tax;
                $scope.returnOrder.purchaseOrderNumber = key.purchaseOrderNumber;
                creditNoteApAgainstInvoiceService.getByPuchaseOrder(key.purchaseOrderId).success(function (data, status) {
                    $scope.returnOrder.creditNoteApAgainstInvoiceNumber = data.creditNoteApAgainstInvoiceNumber;
                }

                ).error(function (data, status) {
                    $scope.returnOrder.creditNoteApAgainstInvoiceNumber = null;
                });
            }
        });
    };

    _init();

});