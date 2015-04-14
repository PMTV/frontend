USR.directive('usersDropdown', function (userService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2">' + // ng-options="s.supplierId as s.companyName for s in suppliers"
            '<option value="">Please Select</option>' +
            '<option ng-repeat="s in users" value="{{s.id}}">{{s.userName}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            userService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                //element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    alert('Please add a User first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.users = (data.data);
            });
        }
    };
});

USR.directive('userDatatable', function (userService, Auth, $filter) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = element.dataTable({
                "aoColumns": [
                    { "mData": "userName" },
                    { "mData": "firstName" },
                    { "mData": "lastName" },
                    { "mData": "dateCreated" },
                    { "mData": "id" }
                ],
                "oLanguage": {
                    "sProcessing": "<img src='assets/img/loader.gif' /> Processing",
                    "sLoadingRecords": "Fetching Data..."
                },
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumnDefs": [
                    {
                        "aTargets": [3], // Column to target
                        "mRender": function (data, type, full) {
                            return $filter("date")(data, 'dd/MM/yyyy');
                        }
                    },
                    {
                        "aTargets": [4], // Column to target
                        "mRender": function (data, type, full) {
                            // 'full' is the row's data object, and 'data' is this column's data
                            // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                            return '<a href="#/users/' + data + '" class="btn btn-success btn-sm btn-primary btn-update">Edit</a> <button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
                        }
                    },
                    {
                        "aTargets": [2], // Column to target
                        "mRender": function (data, type, full) {
                            // 'full' is the row's data object, and 'data' is this column's data
                            // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                            return data || '--';
                        }
                    },
                    {
                        "aTargets": [1], // Column to target
                        "mRender": function (data, type, full) {
                            // 'full' is the row's data object, and 'data' is this column's data
                            // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                            return data || '--';
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    //console.log($('.btn-delete' , nRow));
                    $('.btn-delete', nRow).click(function () {
//		                console.log(aData);
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteUser(aData.id);
                        });
                    });
                },
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

USR.directive('pwCheck', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            scope.$watch(function () {
                return $parse(attrs.pwCheck)(scope) === ngModel.$modelValue;
            }, function (currentValue) {
                ngModel.$setValidity('pwMatch', currentValue);
            });
        }
    }
});