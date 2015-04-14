
ECM.directive('productUsersDropdown', function (notificationService) {
    return {
        restrict: 'E',
        replace: true,
        template: '<select ui-select2 class="ui-select2">' +
            '<option value="">-- Select --</option>' +
            '<option value="-1">Send to all Users</option>' +
            '<option value="-2">Send to all Customers</option>' +
            '<option value="-3">Send to all Employees</option>' +
            '<option ng-repeat="notif in notificationUserList track by $index" value="{{notif.id}}">{{notif.firstName + \' \' + notif.lastName}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {

        }
    };
});

ECM.directive('notificationDatatable', ['notificationService', '$filter', '$timeout', '$compile', function (notificationService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "notificationId" },
                    { "mData": "sender" },
                    { "mData": "subject" },
                    { "mData": "dateCreated" },
                    { "mData": "notificationId" }
                ],
                "aoColumnDefs": [
                    {
                        "aTargets": [4], // Column to target
                        "mRender": function (data, type, full) {
                            // 'full' is the row's data object, and 'data' is this column's data
                            // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                            return '<a href="#/notification/' + data + '" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><button type="button" class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete('+data+')">Delete</button> ';
                        }
                    },
                    {
                        "aTargets": [3], // Column to target
                        "bSortable": true,
                        "mRender": function (data, type, full) {
                            var date = new Date(data);
                            return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
                        }
                    },
                    {
                        "aTargets": [2], // Column to target
                        "bSortable": true,
                        "mRender": function (data, type, full) {
                            return (data != null) ? data : 'No data here';
                        }
                    },
                    {
                        "aTargets": [1], // Column to target
                        "bSortable": true,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    }
                    ,
                    {
                        "aTargets": [0], // Column to target
                        "bSortable": true,
                        "mRender": function (data, type, full) {
                            return data;
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
                if(confirm('Do you want to proceed to Delete?')){
                    scope.deleteNotification(id);
                }
            };

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