// DIRECTIVES

// Purchase Order Datatable 
ACC.directive('advanceCreditNoteDatatable', function (openCreditNoteService) {
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
                    { "mData": "advanceCreditNoteId" },
                    { "mData": "customer" },
                    { "mData": "salesOrder.salesOrderNumber" },
                    { "mData": "referenceNumber" },
                    { "mData": "amount" },
                    { "mData": "taxAmount" },
                    { "mData": "advanceCreditNoteId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [6], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/advanceCreditNotes/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/advanceCreditNotes" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     },
                    {
                        "aTargets": [1], // Column to target
                        "mRender": function (data, type, full) {
                            return data.firstName + " " + data.lastName;
                        }
                    },
                    {
                        "aTargets": [4,5], // Column to target
                        "mRender": function (data, type, full) {
                            return data != null ? "$ " + data : data;
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        bootstrapConfirm('Do you want to proceed to Delete?', function () {
                            scope.deleteAdvanceCreditNote(aData.advanceCreditNoteId);
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

// Purchase Order Item Table 
ACC.directive('advanceCreditNoteitemsTable', function (advanceCreditNoteService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});
