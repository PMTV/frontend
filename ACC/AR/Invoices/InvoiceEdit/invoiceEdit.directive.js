// DIRECTIVES

// Purchase Order Datatable 
ACC.directive('invoicesDatatable', function (invoiceService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
            oDatatable = $(element).dataTable({
                "oLanguage": {
                    "sProcessing": "<img src='assets/img/loader.gif' /> Processing",
                    "sLoadingRecords": "Fetching Data"
                },
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
//                    { "mData": null},
                    { "mData": "invoiceNumber" },
                    { "mData": "referenceNumber" },
                    { "mData": "totalAmount" },
                    { "mData": "totalAmountReceived" },
                    { "mData": "invoiceId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [4], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/invoices/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/invoices" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     },
                    {
                        "aTargets": [1,2,3], // Column to target
                        "mRender": function (data, type, full) {
                            return data != null ? "$ " + data : data;
                        }
                    },
                    {
                        "aTargets": [0], // Column to target,
                        "bSortable" : false,
                        "mRender": function (data, type, full) {
                            return data != null ? "$ " + data : data;
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteInvoice(aData.invoiceId);
                        });
                    });
                    //if (aData[4] == "A") {
                    //    $('td:eq(4)', nRow).html('<b>A</b>');
                    //}
                }
            });

            // watch for any changes to our data, rebuild the DataTable
            scope.$watch(attrs.aaData, function (value) {
                var val = value || null;
                if (val) {
                    oDatatable.fnClearTable();
                    oDatatable.fnAddData(scope.$eval(attrs.aaData));
                }
            });
        }
    }
});

ACC.directive('invoiceDropdown', function (invoiceService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
                '<select ui-select2 class="ui-select2">' +
                    '<option value="">Loading Invoices</option>' +
                    '<option ng-repeat="c in invoiceList" value="{{c}}">Invoice #{{c.invoiceId}}</option>' +
                '</select>',
        link: function (scope, element, attrs) {
            scope.invoiceList = [];
            // scope.salesOrderDetails = [];
            invoiceService.query().then(function (data) {
                angular.copy(data.data, scope.invoiceList);
                // angular.forEach(data.data, function(value, key){
                //     scope.salesOrdersList.push(value.salesOrderDetailsList[0]);
                //     // angular.copy(value.salesOrderDetailsList, scope.salesOrdersList);
                //     // console.log(scope.salesOrdersList);
                // });
                // console.log(scope.salesOrdersList);

            });

        }
    };
});

ACC.directive('invoicebycustomerDropdown', function (invoiceService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
                '<select ui-select2 class="ui-select2">' +
                    '<option value="">Loading Invoices</option>' +
                    '<option ng-repeat="c in invoiceList" value="{{c.invoiceId}}">Invoice #{{c.invoiceId}}</option>' +
                '</select>',
        link: function (scope, element, attrs) {
            scope.invoiceList = [];
            scope.$watch(attrs.customer, function (value) {
                var val = value || null;
                if (val) {
                    invoiceService.getByCustomerId(val).then(function (data) {
                        angular.copy(data.data, scope.invoiceList);
                    });
                }
            });


        }
    };
});


// Purchase Order Item Table 
ACC.directive('invoiceitemsTable', function (invoiceService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

// Credit Datatable 
ACC.directive('creditnotesDatatable', function (invoiceService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
            oDatatable = $(element).dataTable({
                "oLanguage": {
                    "sProcessing": "<img src='assets/img/loader.gif' /> Processing",
                    "sLoadingRecords": "Fetching Data"
                },
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "creditNoteId" },
                    { "mData": "referenceNumber" },
                    { "mData": "invoice.invoiceNumber" },
                    { "mData": "amount" },
                    { "mData": "taxAmount" },
                    { "mData": "creditNoteId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [5], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/invoices/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/againstInvoice" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteInvoice(aData.invoiceId);
                        });
                    });
                    //if (aData[4] == "A") {
                    //    $('td:eq(4)', nRow).html('<b>A</b>');
                    //}
                }
            });

            // watch for any changes to our data, rebuild the DataTable
            scope.$watch(attrs.aaData, function (value) {
                var val = value || null;
                if (val) {
                    oDatatable.fnClearTable();
                    oDatatable.fnAddData(scope.$eval(attrs.aaData));
                }
            });
        }
    }
});
