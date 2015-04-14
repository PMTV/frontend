

ACC.controller('ApPrepaymentListCtrl', function ($rootScope, $scope, apPrepaymentService) {

    $scope.prepayment = [];

    var selectedPrepaymentInvoices = $scope.selectedPrepaymentInvoices = [];

    $scope.columnDefs = [
        { field: 'prepaymentId', displayName: 'ID'},
        { field: 'referenceNumber', displayName: 'Reference Number' },
        { field: 'supplier.companyName', displayName: 'Supplier' },
        { field: 'prepaymentDate', displayName: 'Prepayment Date', cellFilter: 'date' },
        { field: 'paymentAmount', displayName: 'Payment Amount' },
        { field: 'prepaymentId', displayName: 'Actions', cellTemplate: '<a href="#/prepayment/{{row.entity.prepaymentId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.prepaymentId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        showSelectionCheckbox: false
    };

});


ACC.controller('ApPrepaymentEditCtrl', function ($rootScope, $scope, supplierInvoiceService, apPrepaymentService, $routeParams, $location, $modal, $translate, $filter, $sce, errorDisplay) {
    $scope.checkEdit = true;
    $scope.submitted = false;
    $scope.busy = false;
    $scope.prepayment = {};

    var prepaymentId = $routeParams.id;
    var _init = function () {

        if(prepaymentId != null && prepaymentId > 0){
            $scope.checkEdit = false;
            apPrepaymentService.getPrepaymentById(prepaymentId)
                .success(function (data, status) {
                    $scope.prepayment = data;
                })
                .error(function(){ alert('Error load prepayment information!'); })
                .finally();
        }else{
            $scope.checkEdit = true;
        }
    };

    $scope.save = function (prepayment) {
        $scope.submitted = true;

        if(!$scope.myForm.$valid){
            alert('Please check your input data!');
            return false;
        }

        if(prepaymentId != null && prepaymentId > 0){
            $scope.busy = true;
            prepayment.purchaseOrder = [];
            prepayment.supplier = [];
            apPrepaymentService.updatePrepayment(prepaymentId, prepayment)
                .success(function (data, status) {
                    alert('It has been successfully updated!');
                    $rootScope.reload();
                })
                .error(function(){ alert('Update prepayment fail. Please try again later!'); })
                .finally(function () {
                    $scope.busy = false; $scope.submitted = false;
                });

        }else{
            apPrepaymentService.createPrepayment(prepayment)
                .success(function (data, status) {
                    alert('It has been successfully added!');
                    $location.url('/prepayment');
                })
                .error(function (data, status) {
                    alert('Create prepayment fail. Please try again later!');
                })
                .finally(function () {
                    $scope.busy = false; $scope.submitted = false;
                });
        }

    };

    $scope.openPrepaymentPDF = function (prepayment) {
        var pId = prepaymentId;

        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'ACC/AP/ApPrepayment/ApPrepaymentEdit/ApPrepaymentPDF.modal.html?a=aaaa',
            controller: function ($scope, $log, $modalInstance, apPrepaymentService, $filter, $sce, errorDisplay) {

                $scope.prepaymentInfo = prepayment;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    apPrepaymentService.savePDFPrepayment(pId)
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
                        templateUrl: 'ACC/AP/ApPrepayment/ApPrepaymentEdit/ApPrepaymentEmail.modal.html?a=a',
                        controller: function ($scope, $log, $modalInstance, errorDisplay) {
                            $scope.email = {};
                            // set the initial message for the email body
                            $scope.email.body = "Dear Sir / Madam, <br/><br/>Attached is a copy of Prepayment.<br/><br/><br/>For additional enquires, please contact Us <br/><br/>Thank you.<br/><br/><br/>";

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
                                apPrepaymentService.sendEmailPDF(pId, $scope.email)
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

    $scope.onChangedSupplier = function (prepaymentId) {
        $scope.purchaseOrderList = {};
        if(prepaymentId){
            apPrepaymentService.getPurchaseOrderList(prepaymentId)
                .success(function (data, status) {
                    $scope.purchaseOrderList = data;
                })
                .error(function(){console.log('ERROR LOAD PURCHASE ORDER LIST OF SUPPLIER!')})
                .finally();
        }
    };

    _init();
});