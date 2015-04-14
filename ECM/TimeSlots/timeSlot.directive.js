CRM.directive('timeslotDatatable', function (customerGroupService) {

    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = $(element).dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "fromHour" },
                    { "mData": "toHour" },
                    { "mData": "day" },
                    { "mData": "maxSaleOrder" },
                    { "mData": "timeSlotId" }
                ],
                "aoColumnDefs": [
                     {
                        "aTargets": [2], // Column to target
                        "mRender": function (data, type, full) {
                            switch (data){
                                case 0: data = 'Sunday'; break;
                                case 1: data = 'Monday'; break;
                                case 2: data = 'Tuesday'; break;
                                case 3: data = 'Wednesday'; break;
                                case 4: data = 'Thursday'; break;
                                case 5: data = 'Friday'; break;
                                case 6: data = 'Saturday'; break;
                            }
                            return data;
                        }
                     },
                     {
                         "aTargets": [4], // Column to target
                         "mRender": function (data, type, full) {
                             return '<button type="button" class="btn btn-success btn-success btn-sm btn-edit">Edit</button> <button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $('.btn-edit', nRow).click(function () {
                        $('html body .vbox').animate({scrollTop:0}, '500', 'swing');
                        scope.editTimeSlot(aData);
                    });
                    $('.btn-delete', nRow).click(function () {
                        bootstrapConfirm('Do you want to proceed to Delete?', function () { scope.deleteTimeSlot(aData.timeSlotId); });
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