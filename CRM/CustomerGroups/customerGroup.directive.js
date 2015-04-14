CRM.directive('cgtable', function (customerGroupService) {

    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = $(element).dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "name" },
                    { "mData": "name" },
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [1], // Column to target
                         "mRender": function (data, type, full) {
                             return '<button type="button" class="btn btn-success btn-success btn-sm btn-edit">Edit</button> <button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $('.btn-edit', nRow).click(function () {
                        scope.editCustomerGroup(aData);
                    });
                    $('.btn-delete', nRow).click(function () {
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteCustomerGroup(aData.customerGroupId);
                        });
                    });
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