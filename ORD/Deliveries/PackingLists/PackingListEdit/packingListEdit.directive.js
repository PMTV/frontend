
// DIRECTIVES
// Sales Order Datatable 
ORD.directive('packinglistdataTable', function (packingListService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

                oDatatable = $(element).dataTable({
                    "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                    "sPaginationType": "full_numbers",
                    "aoColumns": [
                        { "mData": "packingListId" },
                        { "mData": "salesOrderId" },
                        { "mData": "remarks" },
                        { "mData": "packingListId" }
                    ],
                    "aoColumnDefs": [
                         {
                             "aTargets": [3], // Column to target
                             "mRender": function (data, type, full) {
                                 // 'full' is the row's data object, and 'data' is this column's data
                                 // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                                 return '<a href="#/packingList/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/sales" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                             }
                         }
                    ],
                    "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                        // Bold the grade for all 'A' grade browsers
                        $('.btn-delete', nRow).click(function () {
                            if (confirm('Delete Packing List?'))
                                scope.deletePackingList(aData.packingListId);
                        });

                        //if (aData[4] == "A") {
                        //    $('td:eq(4)', nRow).html('<b>A</b>');
                        //}
                    }
                });
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

// Sales Order Item Table 
ORD.directive('packingListitemsTable', function (quotationService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

ORD.directive('packingDefDropdown', function (packingListService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select class="ui-select2" ui-select2>' +
                '<option value="">-- Options --</option>' +
                '<option value="" ng-repeat="item in packingDefArr">{{item.packingDefinitionName}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.optionArr = [];
            packingListService.getPackingDefinition().then(function (data) {
                scope.packingDefArr = (data.data);
            });
        }
    };
});
// Sales Order Item Table 
// ORD.directive('ddlUOMList', function (quotationService) {
//     return {
//         restrict: 'EA',
//         replace: true,
//         link: function (scope, element, attrs) {

//         }
//     }
// });
