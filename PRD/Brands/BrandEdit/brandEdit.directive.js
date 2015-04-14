PRD.directive('brandsDatatable', ['productService', '$filter', '$timeout', '$compile', function (productService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "name" },
                    { "mData": "description" },
                    { "mData": "productBrandId" },
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [2], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/productBrands/' + data + '" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><button type="button" class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete('+data+')">Delete</button> ';
                         }
                     }
                ],
                "fnCreatedRow": function (nRow, aData, iDataIndex) {
                    $compile(nRow)(scope);
                    this.fnAdjustColumnSizing(true);
                },
                "fnInitComplete": function () {
                    this.fnAdjustColumnSizing(true);
                    element.css('width', '100%');
                }
            });

            scope.delete = function (id) {
                if (confirm($translate.instant('ALERT.DELETING'))) {
                    scope.deleteBrand(id);
                }
            }

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
}]);