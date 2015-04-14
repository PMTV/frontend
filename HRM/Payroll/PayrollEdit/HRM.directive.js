
HRM.directive('salaryemployeeDatatable', ['employeeService', function (employeeService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatableEmployeeSalary = $(element).dataTable({
                "oLanguage": {
                    "sProcessing": "<img src='assets/img/loader.gif' /> Processing",
                    "sLoadingRecords": "Fetching Data"
                },
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                        { "mData": "employeeId" },
                        { "mData": "code" },
                        { "mData": "firstName" },
                        { "mData": "lastName" },
                        { "mData": "middleName" },
                        { "mData": "employeeId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [5], // Column to target
                         "mRender": function (data, type, full) {
                             return '<a href="#/employeesalay/' + data + '" class="btn btn-success btn-sm btn-success btn-update">Edit</a>';
                         }
                     }
                ]
            });
            scope.$watch(attrs.aaData, function (value) {
                var val = value || null;
                if (val) {
                    oDatatableEmployeeSalary.fnClearTable();
                    oDatatableEmployeeSalary.fnAddData(scope.$eval(attrs.aaData));
                }
            });
        }
    }
}]);

HRM.directive('datepickertext', function ($filter) {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngModel, function (value) {
                if (value !== null && value !== undefined) {
                    $(element).val($filter('date')(value, "MM/dd/yyyy"));
                }
            });
        }
    }
});