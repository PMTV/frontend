

ACC.controller('ApPaymentListCtrl', function ($rootScope, $scope, apPaymentService) {
    $scope.payment = [];

    var selectedPayment = $scope.selectedPayment = [];

    $scope.columnDefs = [
        { field: 'paymentVoucherId', displayName: 'No.'},
        { field: 'paymentVoucherNumber', displayName: 'Payment Voucher No' },
        { field: 'supplier.companyName', displayName: 'Supplier' },
        { field: 'prepaymentAmount', displayName: 'Payment Amount' },
        { field: 'dateReceived', displayName: 'Date Received', cellFilter: 'date'},
        { field: 'paymentVoucherId', displayName: 'Actions', cellTemplate: '<a href="#/payment/{{row.entity.paymentVoucherId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.paymentVoucherId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        showSelectionCheckbox: false
    };
});


ACC.controller('ApPaymentEditCtrl', function ($rootScope, $scope, $routeParams, apPaymentService, $translate, $modal, $location, $filter, $sce, errorDisplay) {
    $scope.submitted = false;
    $scope.busy = false;
    $scope.checkEdit = false;
    $scope.payment = {};
    //array for loading
    $scope.prepaymentList = [];
    $scope.purchaseOrderList = [];
    $scope.creditNoteList = [];
    $scope.purchaseInvoiceList = [];
    $scope.specialListCreditNote = [];
    //array for save()
    $scope.getPrepaymentList = [];
    $scope.getSelectedPurchaseOrder = [];
    $scope.getPaymentVouchersCreditNoteAPInvoiceList = [];

    var m_names = ["Jan", "Feb", "Mar","Apr", "May", "June", "July", "Aug", "Sept","Oct", "Nov", "Dec"];
    var paymentId = $routeParams.id;

    var _init = function () {
        if(paymentId!=null && paymentId > 0){
            $scope.specialListCreditNote= [];
            $scope.creditNoteList = [];
            $scope.checkEdit = false;
            apPaymentService.getPaymentById(paymentId)
                .success(function (data, status) {
                    //set array paymentVouchersCreditNoteAPInvoiceList
                    $scope.getPaymentVouchersCreditNoteAPInvoiceList = data.paymentVouchersCreditNoteAPInvoiceList;
                    //payment basic information
                    $scope.payment = data.paymentVouchers;
                    //list purchase order
                    $scope.purchaseOrderList = data.purchaseOrderList;
                    //list credit note
                    $scope.creditNoteList = data.creditNoteApAgainstInvoiceList;
                    //list selected credit note
                    var tempArr = [];
                    angular.forEach(data.paymentVouchersCreditNoteAPInvoiceList, function (key, index) {
                        $scope.specialListCreditNote.push({id: key.creditNoteApAgainstInvoiceId, name: key.creditNoteApAgainstInvoice.creditNoteApAgainstInvoiceNumber, amount: key.creditNoteApAgainstInvoice.grandTotal});
                        $scope.creditNoteList.push(key.creditNoteApAgainstInvoice);
                        key.paymentVouchers = [];
                    });
                    //sort array

                    //set value for credit note amount
                    $scope.payment.creditNoteApAgainstInvoiceAmount = $scope.getTotalCreditNoteAmount();
                    //list selected supplier invoice(purchase invoice)
                    $scope.purchaseInvoiceList = data.paymentVouchers.paymentVoucherDetailList;
                    angular.forEach($scope.purchaseInvoiceList, function (key, index) {
                        key.isCreatePaymentVoucher = true;
                    });
                    //get total amount
                    $scope.getTotalInvoiceAmount();
                    $scope.getTotalPrepayment();
                    $scope.getTotalCreditNoteAmount();
                })
                .error(function(){ alert('Error load payment information!'); })
                .finally();
        }else{
            $scope.checkEdit = true;
        }
    };

    $scope.save = function (payment) {
        $scope.submitted = true;

        if(!$scope.myForm.$valid){
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }

        //array for save()
        $scope.getSupplierInvoiceList = [];
        $scope.getCreditNoteList = [];
        $scope.saveArray = {};
        $scope.saveArray.purchaseOrderList = [];
        $scope.saveArray.paymentVouchers = [];
        $scope.saveArray.creditNoteApAgainstInvoiceList = [];

        angular.forEach($scope.purchaseInvoiceList, function (key, index) {
            if(key.isCreatePaymentVoucher == true){
                $scope.getSupplierInvoiceList.push(key);
            }
        });

        if($scope.getSupplierInvoiceList.length <= 0) {
            alert('Please choose at least one invoice!');
            return false;
        }

        $scope.saveArray.paymentVouchers = payment;
        $scope.saveArray.paymentVouchers.purchaseOrder = $scope.getSelectedPurchaseOrder;
        $scope.getSelectedPurchaseOrder.supplierInvoiceList = $scope.getSupplierInvoiceList;
        $scope.getSelectedPurchaseOrder.prepaymentList = $scope.getPrepaymentList;

        angular.forEach($scope.specialListCreditNote, function (key, data) {
            angular.forEach($scope.creditNoteList, function (result, value) {
                if(result.creditNoteApAgainstInvoiceId == key.id){
                    $scope.getCreditNoteList.push(result);
                }
            });
        });

        $scope.saveArray.creditNoteApAgainstInvoiceList = $scope.getCreditNoteList;
        $scope.saveArray.paymentVouchersCreditNoteAPInvoiceList = $scope.getPaymentVouchersCreditNoteAPInvoiceList;

        angular.forEach($scope.saveArray.creditNoteApAgainstInvoiceList, function (key, index) {
            key.supplierInvoice = [];
            key.supplier = [];
        });

        $scope.saveArray.purchaseOrderList.push($scope.getSelectedPurchaseOrder);
        $scope.busy = true;
        $scope.saveArray.paymentVouchers.supplier = [];

        if(paymentId != null && paymentId > 0){
            $scope.saveArray.purchaseOrderList = [];
            $scope.saveArray.paymentVouchers.prepayment = [];

            apPaymentService.updatePaymentVoucher(paymentId, $scope.saveArray)
                .success(function (data, status) {
                    alert($translate.instant('ALERT.UPDATED'));
                    $rootScope.reload();
                })
                .error(function(){ alert('Error update payment information!'); })
                .finally(function(){ $scope.busy = false; $scope.submitted = false; });
        }else{

            apPaymentService.createPaymentVoucher($scope.saveArray)
                .success(function (data, status) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('/payment');
                })
                .error(function(){ alert('Create payment fail! Please try again later!'); })
                .finally(function(){ $scope.busy = false;$scope.submitted = false; });
        }
    };

    $scope.getTotalAmount = function () {
        var totalInvoiceAmount = $scope.getTotalInvoiceAmount();
        var totalPrepayment = $scope.getTotalPrepayment();
        var totalCreditNoteAmount = $scope.getTotalCreditNoteAmount();
        var total = totalInvoiceAmount - totalPrepayment - totalCreditNoteAmount;
        return (total > 0) ? total : 0;
    };

    $scope.getTotalInvoiceAmount = function () {
        var totalInvoiceAmount = 0;
        if($scope.purchaseInvoiceList != null){
            angular.forEach($scope.purchaseInvoiceList, function (key, index) {
                var date = new Date(key.dateCreated);
                key.dateConverted = date.getDate() + '-' + m_names[date.getMonth()] + '-' + date.getFullYear();
                if(key.isCreatePaymentVoucher == true || (paymentId >0 && paymentId != null) ){
                    totalInvoiceAmount = totalInvoiceAmount + key.paymentAmount;
                }
            });
        }
        return totalInvoiceAmount;
    };

    $scope.getTotalPrepayment = function () {
        var prepaymentAmount = $scope.payment.prepaymentAmount;
        return (prepaymentAmount > 0 && angular.isNumber(prepaymentAmount))? prepaymentAmount : 0;
    };

    $scope.getTotalCreditNoteAmount = function () {
        var totalCreditNote = 0;
        if($scope.specialListCreditNote!=null){
            angular.forEach($scope.specialListCreditNote, function (key, index) {
                totalCreditNote = totalCreditNote + key.amount;
            });
        }
        return totalCreditNote;
    };

    $scope.removeCreditNoteInList = function (index) {
        $scope.specialListCreditNote.splice(index, 1);
    };

    $scope.$watch(function(){ return $scope.specialListCreditNote.length }, function (newval, oldval) {
        if(newval != oldval){
            $scope.payment.creditNoteApAgainstInvoiceAmount = $scope.getTotalCreditNoteAmount();
        }else{
            return false;
        }
    }, true);

    $scope.$watch(function(){ return $scope.getTotalAmount();},
        function (newVal, oldVal) {
            if(newVal!=oldVal){
                var amout = $scope.getTotalAmount();
                $scope.payment.amount = amout;// $filter('number')(amout, 2);
            }else{
                return false;
            }
        }, true);

    $scope.onChangeCreditNote = function (creditNoteId) {
        var checkExists = false;
        angular.forEach($scope.specialListCreditNote, function (key, index) {
            if(key.id == creditNoteId){
                checkExists = true;
            }
        });
        if(!checkExists){
            angular.forEach($scope.creditNoteList, function (key, index) {
                if(key.creditNoteApAgainstInvoiceId == creditNoteId){
                    $scope.specialListCreditNote.push({id: key.creditNoteApAgainstInvoiceId, name: key.creditNoteApAgainstInvoiceNumber, amount: key.grandTotal});
                }
            });
        }
    };

    $scope.onChangePurchaseOrder = function (purchaseOrderId) {
        var setNullPrepayment = function (id, amount) {
            $scope.payment.prepaymentId = id || "There's no prepayment!";
            $scope.payment.prepaymentAmount = amount || 0;
        };

        if(purchaseOrderId==null){
            setNullPrepayment();
            return false;
        }
        angular.forEach($scope.purchaseOrderList, function (key, index) {
            if(key.purchaseOrderId == purchaseOrderId){
                if(key.prepaymentList!=null && key.prepaymentList.length > 0){
                    //set prepayment list for save()
                    $scope.getSelectedPurchaseOrder = key;
                    $scope.getPrepaymentList = key.prepaymentList;
                    //set value for prepayment
                    if(key.prepaymentList[0].isPrepaymentUsed != true){
                        setNullPrepayment(key.prepaymentList[0].prepaymentId, key.prepaymentList[0].paymentAmount);
                    }else{
                        setNullPrepayment();
                    }
                    //list invoices bottom
                    $scope.purchaseInvoiceList = key.supplierInvoiceList;
                }
            }
        });
    };

    $scope.onChangedSupplier = function (supplierId) {
        apPaymentService.getPurchaseOrderBySupplierId(supplierId)
            .success(function (data, status) {
                //purchase order
                $scope.purchaseOrderList = data.purchaseOrderList;
                if(data.creditNoteApAgainstInvoiceList.length <=0 || data.creditNoteApAgainstInvoiceList==null){
                    $scope.payment.creditNoteApAgainstInvoiceAmount = 0;
                }else{
                    $scope.creditNoteList = data.creditNoteApAgainstInvoiceList;
                }
            })
            .error(function(){ alert('Error load purchase order list!'); })
            .finally();
    };

    $scope.openPaymentPDF = function (payment) {
        var pId = paymentId;

        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'ACC/AP/ApPayment/ApPaymentEdit/ApPaymentPDF.modal.html?a=aaaa',
            controller: function ($scope, $log, $modalInstance, $filter, $sce, errorDisplay) {

                $scope.paymentInfo = payment;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    apPaymentService.savePDFPayment(pId)
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
                        templateUrl: 'ACC/AP/ApPayment/ApPaymentEdit/ApPaymentEmail.modal.html?a=a',
                        controller: function ($scope, $log, $modalInstance, errorDisplay) {
                            $scope.email = {};
                            // set the initial message for the email body
                            $scope.email.body = "Dear Sir / Madam, <br/><br/>Attached is a copy of Payment.<br/><br/><br/>For additional enquires, please contact Us <br/><br/>Thank you.<br/><br/><br/>";

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
//                                console.log('value of an email');
//                                console.log($scope.email);
//                                return false;
                                console.log('Value Email')
                                console.log($scope.email);
                                apPaymentService.sendEmailPDF(pId, $scope.email)
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

    _init();

});