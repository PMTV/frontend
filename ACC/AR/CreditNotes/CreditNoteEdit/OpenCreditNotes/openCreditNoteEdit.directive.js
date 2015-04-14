// DIRECTIVES

// Purchase Order Datatable 
ACC.directive('openCreditNoteDatatable', function (openCreditNoteService) {
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
                    { "mData": "openCreditNoteId" },
                    { "mData": "customer" },
                    { "mData": "referenceNumber" },
                    { "mData": "amount" },
                    { "mData": "taxAmount" },
                    { "mData": "openCreditNoteId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [5], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/openCreditNotes/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/openCreditNotes" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     },
                    {
                        "aTargets": [1], // Column to target
                        "mRender": function (data, type, full) {
                            return data.firstName + " " + data.lastName;
                        }
                    },
                    {
                        "aTargets": [3, 4], // Column to target
                        "mRender": function (data, type, full) {
                            return data != null ? "$ " + data : data;
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        bootstrapConfirm('Do you want to proceed to Delete?', function () {
                            scope.deleteOpenCreditNote(aData.openCreditNoteId);
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

ACC.directive('openCreditNoteDropdown', function (openCreditNoteService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
                '<select ui-select2 class="ui-select2">' +
                    '<option value="">Loading Open Credit Note</option>' +
                    '<option ng-repeat="c in openCreditNoteList" value="{{c.openCreditNoteId}}">Open Credit Note #{{c.openCreditNoteId}} [${{c.amount}}]</option>' +
                '</select>',
        link: function (scope, element, attrs) {
            scope.openCreditNoteList = [];
            // scope.salesOrderDetails = [];
            openCreditNoteService.query().then(function (data) {
                angular.copy(data.data, scope.openCreditNoteList);
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
// Purchase Order Item Table 
ACC.directive('openCreditNoteitemsTable', function (openCreditNoteService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

ACC.directive('openCreditNoteByCustomerDropdown', function (openCreditNoteService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
                '<select ui-select2 class="ui-select2">' +
                    '<option value="">Loading Open Credit Note</option>' +
                    '<option ng-repeat="c in openCreditNoteList" value="{{c.openCreditNoteId}}">Open Credit Note #{{c.openCreditNoteId}} [${{c.amount}}]</option>' +
                '</select>',
        link: function (scope, element, attrs) {
            scope.openCreditNoteList = [];
            scope.$watch(attrs.customer, function (value) {
                var val = value || null;
                if (val) {
                    openCreditNoteService.getByCustomer(val).then(function (data) {
                        angular.copy(data.data, scope.openCreditNoteList);
                    });
                }
            });
        }
    };
});
