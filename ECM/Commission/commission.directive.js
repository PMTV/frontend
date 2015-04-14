ECM.directive('commissionDatatable', ['commissionService', '$filter', '$timeout', '$compile', function (commissionService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "commissionId" },
                    { "mData": "salesPerson"},
                    { "mData": "commissionValue" },
                    { "mData": "fromDate" },
                    { "mData": "toDate" },
                    { "mData": "commissionId" }
                ]
                    ,
                "aoColumnDefs": [
                    {
                        "aTargets": [3, 4], // Column to target
                        "mRender": function(data, type, full) {
                            return $filter('date')(data, "dd/MM/yyyy");
                        }
                    },
                    {
                        "aTargets": [5], // Column to target
                        "bSearchable": false,
                        "mRender": function(data, type, row) {
                            return '<a href="#/commission/' + data + '" class="btn btn-success btn-sm btn-primary btn-update">Edit</a> <button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
                        }
                    }
                    ,
                    {
                        "aTargets": [1], // Column to target
                        "mRender": function (data) {
                            return data.firstName + " " + data.lastName ;
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    //console.log($('.btn-delete' , nRow));
                    $('.btn-delete', nRow).click(function () {
                        //console.log(aData.commissionId);
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteCommission(aData.commissionId);
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

ECM.directive('dateformat', function (dateFilter) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (viewValue) {
                return dateFilter(viewValue, 'MM/dd/yyyy');
            });
        }
    };
});
