// DIRECTIVES

// Purchase Order Datatable 
ACC.directive('receiptDatatable', function (receiptService) {
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
                    { "mData": "receiptId" },
                    { "mData": "referenceNo" },
                    { "mData": "receiptDate" },
                    { "mData": "customer" }, // khoa :  change Customer Id to Customer Name in Receipt List
                    { "mData": "amount" },
                    { "mData": "receiptId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [5], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/receipts/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/receipts" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     },
                    {
                        "aTargets": [3], // Column to target
                        "mRender": function (data, type, full) {
                            return data.firstName + " " + data.lastName;
                        }
                    },
                    {
                        "aTargets": [4], // Column to target
                        "mRender": function (data, type, full) {
                            return data != null ? "$ " + data : data;
                        }
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteReceipt(aData.receiptId);
                        });
                    });
                    //if (aData[4] == "A") {
                    //    $('td:eq(4)', nRow).html('<b>A</b>');
                    //}
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

// ACC.directive('debitNoteDropdown', function (debitNoteService) {
//     return {
//         restrict: 'E',
//         replace: true,
//         template: '' +
//                 '<select ui-select2 class="ui-select2">' +
//                     '<option value="">Loading Debit Note</option>' +
//                     '<option ng-repeat="c in debitNoteList" value="{{c}}">Debit Note #{{c.debitNoteId}}</option>' +
//                 '</select>',
//         link: function (scope, element, attrs) {
//             scope.debitNoteList = [];
//             // scope.salesOrderDetails = [];
//             debitNoteService.query().then(function (data) {
//                 angular.copy(data.data, scope.debitNoteList);
//                 // angular.forEach(data.data, function(value, key){
//                 //     scope.salesOrdersList.push(value.salesOrderDetailsList[0]);
//                 //     // angular.copy(value.salesOrderDetailsList, scope.salesOrdersList);
//                 //     // console.log(scope.salesOrdersList);
//                 // });
//                 // console.log(scope.salesOrdersList);

//             });

//         }
//     };
// });

// Purchase Order Item Table 
ACC.directive('receiptitemsTable', function (receiptService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});
