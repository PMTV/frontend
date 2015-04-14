
ECM.directive('receiveNotificationDatatable', ['receiveNotificationService', '$filter', '$timeout', '$compile', function (receiveNotificationService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
            var $index=0;
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
                            return '<a href="#/receive-notification/' + data + '" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Details</a>';
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
                    },
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