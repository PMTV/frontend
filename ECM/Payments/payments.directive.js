ECM.directive('paymentsDatatable', ['paymentsService', '$filter', '$timeout', '$compile', function (paymentsService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "paymentId" },
                    { "mData": "salesOrderId" },
                    { "mData": "paymentStatus" },
                    { "mData": "paidDate" },
                    { "mData": "token" },
                    { "mData": "payerId" },
                    { "mData": "successReturnUrl" },
                    { "mData": "errorReturnUrl" },
                    { "mData": "customer" },
                    { "mData": "paymentAmount", 'sClass': 'text-right' }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [9], // Column to target
                         "mRender": function (data, type, full) {
                             return '$ ' + $filter('number')(data, 2);
                         }
                     },
                     {
                         "aTargets": [8], // Column to target
                         "mRender": function (data, type, full) {
                             return full.customer.firstName + ' ' + full.customer.lastName;
                         }
                     },
                     {
                         "aTargets": [7], // Column to target
                         "mRender": function (data, type, full) {
                             return '<a targer="_blank" href="' + data + '">Link</a>';
                         }
                     },
                     {
                         "aTargets": [6], // Column to target
                         "mRender": function (data, type, full) {
                             return '<a targer="_blank" href="' + data + '">Link</a>';
                         }
                     },
                     {
                         "aTargets": [3], // Column to target
                         "mRender": function (data, type, full) {
                             return $filter('date')(data, "dd/MM/yyyy");
                         }
                     },
                     {
                         "aTargets": [2], // Column to target
                         //"bSortable": false,
                         "mRender": function (data, type, full) {
                             var status = '';
                             switch (data) {
                                 case 1:
                                     status = 'New';
                                     break;
                                 case 2:
                                     status = 'Approved';
                                     break;
                                 case 3:
                                     status = 'Paid';
                                     break;
                                 case 4:
                                     status = 'Canceled';
                                     break;
                                 case 5:
                                     status = 'Approved_PaidFailed';
                                     break;
                                 default:
                                     status = 'New';
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
                },
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
                }
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


ECM.directive('customerDropdown', function (paymentsService) {
    return {
        restrict: 'E',
        replace: true,
        template: ''+
            '<select class="ui-select2" ui-select2>' +
                '<option ng-repeat="item in customers" value="{{item.customerId}}">{{fullName(item)}}</option>' +
                '<option value="">- Select -</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.customers = [];
            paymentsService.queryCustomer()
                .success(function (data) {
                    scope.customers = data.results;
                })
                .error()
                .finally();

            scope.fullName = function (item) {
                return item.firstName + ' ' + item.lastName;
            }
        }
    }
});


ECM.directive('datepickerecm', function ($filter, $parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ctrl) {
            element.datepicker({ format: 'dd/mm/yyyy' });
            scope.$watch(attrs.ngModel, function (value) {
                if (value !== null && value !== undefined) {
                    $(element).val($filter('date')(value, "dd/MM/yyyy"));
                }
            });
        }
    }
});

