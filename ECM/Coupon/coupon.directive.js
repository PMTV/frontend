ECM.directive('couponDatatable', ['couponService', '$filter', '$timeout', '$compile', function (couponService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "couponId" },
                    { "mData": "couponCode" },
                    { "mData": "couponValue"},
                    { "mData": "minTotalPrice" },
                    { "mData": "maxTotalPrice" },
                    { "mData": "dateValidFrom" },
                    { "mData": "dateValidUntil" },
                    { "mData": "couponStatus" },
                    { "mData": "couponType" },
                    { "mData": "customerId"}
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [2], // Column to target
                         "mRender": function (data, type, full, mDataType) {
                             var _toShow = data;
                             switch (full.couponType) {
                                 case 1:
                                     _toShow = '$ ' + $filter('number')(data, 2);
                                     break;
                                 case 2:
                                     _toShow =  $filter('number')(data, 2) + ' %';
                                     break;
                             }
                             return _toShow;
                         }
                     }
                     ,
                     {
                         "aTargets": [3,4], // Column to target
                         "mRender": function (data, type, full) {
                             return '$ ' + $filter('number')(data, 2);
                         }
                     }
                     ,
                     {
                         "aTargets": [5,6], // Column to target
                         "mRender": function (data, type, full) {
                             return $filter('date')(data, "dd/MM/yyyy");
                         }
                     }
                     ,
                     {
                         "aTargets": [7], // Column to target                         
                         "mRender": function (data, type, full) {
                             var status = '';
                             switch (data) {
                                 case 1:
                                     status = 'New';
                                     break;
                                 case 2:
                                     status = 'Used';
                                     break;                                
                                 default:
                                     status = '';
                             }
                             return status;
                         }
                     }
                     ,
                     {
                         "aTargets": [8], // Column to target                         
                         "mRender": function (data, type, full) {
                             var status = '';
                             switch (data) {
                                 case 1:
                                     status = 'Fixed';
                                     break;
                                 case 2:
                                     status = 'Percent';
                                     break;
                                 default:
                                     status = '';
                             }
                             return status;
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
                }/*,
                "fnFooterCallback": function (nRow, aaData, iStart, iEnd, aiDisplay) {
                    var iPageTotalLine = 0;
                    if (aaData.length > 0) {
                        for (var i = iStart ; i < iEnd ; i++) {
                            // sum price
                            iPageTotalLine += aaData[i].paymentAmount * 1;
                        }
                    }
                    var nCells = nRow.getElementsByTagName('th');
                    nCells[1].innerHTML = '$ ' + $filter('number')(iPageTotalLine, 2);
                }*/
            });

            scope.delete = function (id) {
                bootstrapConfirm('Do you want to proceed to Delete?', function() {
                    scope.deleteProduct(id);
                });
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

