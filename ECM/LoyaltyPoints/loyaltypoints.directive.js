ECM.directive('loyaltypointDatatable', ['loyaltypointsService', '$filter', '$timeout', '$compile', function (loyaltypointsService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "loyaltyPointId" },
                    { "mData": "point" },
                    { "mData": "fromDate" },
                    { "mData": "toDate" },
                    { "mData": "loyaltyPointId" }
                ],
                "aoColumnDefs": [
                    {
                        "aTargets": [2, 3], // Column to target
                        "mRender": function(data, type, full) {
                            return $filter('date')(data, "dd/MM/yyyy");
                        }
                    },
                    {
                        "aTargets": [4], // Column to target
                        "bSearchable": false,
                        "mRender": function(data, type, row) {
                            return '<a href="#/loyaltypoints/' + data + '" class="btn btn-success btn-sm btn-primary btn-update">Edit</a> <button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    //console.log($('.btn-delete' , nRow));
                    $('.btn-delete', nRow).click(function () {
                        //console.log(aData.customerId);
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteLoyaltyPoint(aData.loyaltyPointId);
                        });
                    });
                }
            });

            // watch for any changes to our data, rebuild the DataTable
            scope.$watch(attrs.aaData, function(value) {
                var val = value || null;
                if (val) {
                    oDatatable.fnClearTable();
                    oDatatable.fnAddData(scope.$eval(attrs.aaData));
                }
            });
        }
    };
}]);


