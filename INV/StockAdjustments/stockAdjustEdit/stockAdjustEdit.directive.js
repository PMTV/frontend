// DIRECTIVES

// STOCK Datatable 
INV.directive('stockAdjustDatatable', function (stockAdjustService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = $(element).dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "stockAdjustmentsId" },
                    { "mData": "qty" },
                    { "mData": "unitPrice" },
                    { "mData": "description" },
                    { "mData": "stockAdjustmentsId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [4], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/stockAdjusts/' + data + '" class="btn btn-success btn-sm">Edit</a> <a class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        if (confirm('Delete stock adjustment?'))
                            scope.deleteStockAdjust(aData.StockAdjustmentsId);
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

// Acquisition Order Item Table 
INV.directive('stockadjustitemsTable', function (stockAdjustService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {
        }
    }
});