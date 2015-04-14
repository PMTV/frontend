HRM.directive('employeeDatatable', ['employeeService', function (employeeService) {
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
                        { "mData": "employeeId" },
                        { "mData": "code" },
                        { "mData": "firstName" },
                        { "mData": "lastName" },
                        { "mData": "employeeId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [4], // Column to target
                         "mRender": function (data, type, full) {
                             return '<a href="#/employees/' + data + '" class="btn btn-success btn-sm btn-success btn-update">Edit</a> <button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $('.btn-delete', nRow).click(function () {
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteFn(aData.employeeId);
                        });
                    });
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
}]);

CRM.directive('employeesDropdown', function (employeeService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2">' + // ng-options="s.supplierId as s.companyName for s in suppliers"
                '<option value="">Loading Employees</option>' +
                '<option ng-repeat="s in employees" value="{{s.employeeId}}">{{s.firstName}} {{s.lastName}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            employeeService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    alert('Please add a Employee first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.employees = (data.data);
            });
        }
    };
});