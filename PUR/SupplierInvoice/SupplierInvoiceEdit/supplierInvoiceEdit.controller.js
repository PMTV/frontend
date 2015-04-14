

PUR.controller('SupplierInvoiceListCtrl', function ($rootScope, $scope, supplierInvoiceService) {
    $scope.supplierInvoices = [];

    var selectedSupplierInvoices = $scope.selectedSupplierInvoices = [];

    $scope.columnDefs = [
        { field: 'supplierInvoiceId', displayName: 'ID'},
        { field: 'supplier.companyName', displayName: 'Supplier' },
        { field: 'supplierInvoiceNumber', displayName: 'Invoice Number' },
        { field: 'billDate', displayName: 'Invoice Date', cellFilter: 'date', visible: true },
        { field: 'dueDate', displayName: 'Due Date', cellFilter: 'date', visible: true },
        { field: 'paymentAmount', displayName: 'Payment Amount' },
        { field: 'supplierInvoiceId', displayName: 'Actions', cellTemplate: '<a href="#/purchase-invoice/{{row.entity.supplierInvoiceId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.supplierInvoiceId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        showSelectionCheckbox: false
    };
});


PUR.controller('SupplierInvoiceEditCtrl', function ($rootScope, $scope, $routeParams, supplierInvoiceService, $location, $modal, $translate, $filter, $sce, errorDisplay) {
    $scope.submitted = false;
    $scope.busy = false;
    $scope.checkEdit = false;
    $scope.sInvoice = {};
    $scope.temp = null;

    var sInvoiceId = $routeParams.id;

    var _init = function () {
        if(sInvoiceId){
            $scope.checkEdit = false;
            supplierInvoiceService.getSupplierInvoiceById(sInvoiceId)
                .success(function (data, status) {
                    $scope.sInvoice = data;
                    //if(data.tax != null && data.tax > 0){
                    //    $scope.sInvoice.isTaxable = true;
                    //}

                    $scope.purchaseSelectedObject = data.purchaseOrder;
                    $scope.sInvoice.currencyId = data.purchaseOrder.currencyId;
                    angular.forEach(data.supplierInvoiceDetailsList, function (key, index) {
                        key.purchaseOrderDetails = [];
                    });
                    $scope.sInvoice.purchaseOrder.purchaseOrderDetailsList = data.supplierInvoiceDetailsList;
                })
                .error(function(){ alert('Load Purchase Invoice Data Fail. Please try again later.'); })
                .finally();
        }else{
            $scope.checkEdit = true;
        }
    };

    $scope.save = function (supplierInvoice) {
        $scope.submitted = true;

        if(!$scope.myForm.$valid){
            alert('Please check your input data!');
            return false;
        }

        if(supplierInvoice.paymentAmount <= 0){
            alert('Please check your item list!');
            return false;
        }

        angular.forEach($scope.sInvoice.purchaseOrder.purchaseOrderDetailsList, function (key, index) {
            key.isCreateSupplierInvoice = true;
        });

        if(sInvoiceId!=null){
            supplierInvoice.supplierInvoiceDetailsList = $scope.sInvoice.purchaseOrder.purchaseOrderDetailsList;
            supplierInvoice.purchaseOrder = [];
            supplierInvoice.purchaseOrderDetailsList = [];

            $scope.busy = true;

            supplierInvoiceService.updateSupplierInvoice(supplierInvoice)
                .success(function (data, status) {
                    alert('Successful Updated!');
                    $rootScope.reload();
                })
                .error(function(){ alert('Update Purchase Invoice Fail!'); })
                .finally(function(){ $scope.busy = false; });
        }else{
            $scope.busy = true;
            supplierInvoiceService.createNewSupplierInvoice(supplierInvoice)
                .success(function (data, status) {
                    alert('Successful added Purchase Invoice!');
                    $location.url('/purchase-invoice');
                })
                .error(function(){ alert('Add Purchase Invoice Fail!'); })
                .finally(function(){ $scope.busy = false; $scope.submitted = false; });
        }
    };

    $scope.openSupplierInvoicePDF = function (supplierInvoice) {
        var suppierInvoiceId = sInvoiceId;

        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'PUR/SupplierInvoice/SupplierInvoiceEdit/supplierInvoicePDF.modal.html?a=aaaa',
            controller: function ($scope, $log, $modalInstance, supplierInvoiceService, $filter, $sce, errorDisplay) {

                $scope.supplierInvoice = supplierInvoice;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    supplierInvoiceService.savePDFSupplierInvoice(suppierInvoiceId)
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
                };

                // init Preview PDF
                $scope.previewPDF();

//                $scope.saveCustomized = function (supplierInvoice) {
//                    alert('save customized supplier invoice');
//                    supplierInvoiceService.patch(salesOrderId, sales)
//                        .success(function (data) {
//                            alert($translate.instant('ALERT.UPDATED'));
//                        })
//                        .error(function (error) {
//                            errorDisplay.show(error);
//                            $log.error(error);
//                        });
//                };

                // open email dialog
                $scope.openEmail = function () {
                    $modal.open({
                        backdrop: 'static',
                        windowClass: 'modal-md',
                        keyboard: true,
                        templateUrl: 'PUR/SupplierInvoice/SupplierInvoiceEdit/supplierInvoiceEmail.modal.html?a=a',
                        controller: function ($scope, $log, $modalInstance, errorDisplay) {
                            $scope.email = {};
                            // set the initial message for the email body
                            $scope.email.body = "Dear Sir / Madam, <br/><br/>Attached is a copy of Purchase Invoice.<br/><br/><br/>For additional enquires, please contact Us <br/><br/>Thank you.<br/><br/><br/>";

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

                                supplierInvoiceService.sendEmailPDF(suppierInvoiceId, $scope.email)
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
                            };

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };
                        }
                    });
                };

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
        var value = $scope.sInvoice.discountAmount;
        return (value != null && value >0)? value : 0;
    };

    $scope.getDeliveryCharges = function () {
        var value = $scope.sInvoice.deliveryChargeAmount;
        return (value != null && value > 0) ? value : 0;
    };

    $scope.getGST = function () {
        var checkIsTaxable = $scope.sInvoice.isTaxable;
        var GST = $scope.sInvoice.tax;
        return (checkIsTaxable && GST > 0 && GST != null)? (GST/100) : 0;
    };

    $scope.getGrandTotal = function (listArray) {
        var totalBeforeTax = 0, totalQuantity =0 , totalAfterDiscount= 0, totalTaxValue = 0 , totalAfterTax = 0;
        var discountValue = $scope.getDiscount();
        var GSTValue = $scope.getGST();
        var deliveryChargeValue = $scope.getDeliveryCharges();

        angular.forEach(listArray, function (key, index) {
            var qty = parseInt(key.qty);
            var unitPrice = parseInt(key.unitPrice);
            totalQuantity = totalQuantity + qty;
            totalBeforeTax = totalBeforeTax + (qty*unitPrice);
        });
        $scope.TotalQuantity = totalQuantity;
        totalTaxValue = (totalBeforeTax - discountValue + deliveryChargeValue) * GSTValue;
        $scope.totalTaxValue = totalTaxValue;
        totalAfterTax = (totalBeforeTax - discountValue + deliveryChargeValue) + totalTaxValue;
        $scope.sInvoice.paymentAmount = totalAfterTax;

        return totalAfterTax;
    };

    $scope.removeItem = function (index, supplierInvoiceDetailId) {
        var listArray = $scope.sInvoice.purchaseOrder.purchaseOrderDetailsList;
        var supplierInvoiceid = $routeParams.id;
        // check if supplierInvoiceDetailId is null, if not null, call delete item API
        if (supplierInvoiceDetailId) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                supplierInvoiceService.deleteSupplierItem(supplierInvoiceid, supplierInvoiceDetailId)
                    .success(function (data) {
                        listArray.splice(index, 1);
                    })
                    .error(function (data) {
                        errorDisplay.show(data);
                    });
            }
        } else {
            listArray.splice(index, 1);
        }
        
    };

    $scope.onChangedSupplier = function (supplierId) {
        $scope.checkSupplierExist = supplierId;
        $scope.purchaseOrderList = {};

       if(supplierId){
           supplierInvoiceService.getPurchaseOrderBySupplierId(supplierId)
               .success(function (data, status) {
                   $scope.purchaseOrderList = data;
               })
               .error(function(){console.log('ERROR LOAD PURCHASE ORDER LIST OF SUPPLIER!')})
               .finally();
       }
    };

    $scope.onChangePurchaseOrder = function (object) {
        object = angular.fromJson(object);

        if(object){
            $scope.sInvoice.purchaseOrder = object;
            $scope.sInvoice.purchaseOrderId = object.purchaseOrderId;
            $scope.sInvoice.paymentTermId = object.creditTermId;
            $scope.sInvoice.discountAmount = object.discountAmount;
            $scope.sInvoice.currencyId = object.currencyId;
            $scope.sInvoice.remarks = object.remarks;
            //list
            $scope.sInvoice.purchaseOrderDetailsList = object.purchaseOrderDetailsList;

        }else{
            $scope.sInvoice.paymentTermId = null;
            $scope.sInvoice.discountAmount = null;
            $scope.sInvoice.currencyId = null;
            $scope.sInvoice.remarks = null;
            //list
            $scope.sInvoice.purchaseOrderDetailsList = null;
        }
    };

    _init();

});