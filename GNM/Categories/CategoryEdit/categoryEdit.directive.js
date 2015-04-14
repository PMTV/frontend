
GNM.directive('categoriesDatatable', ['categoriesService', function (categoriesService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            categoriesService.query().success(function (data) {

                categoriesDatatable = $(element).dataTable({
                    "aaData": data,
                    "oLanguage": {
                        "sProcessing": "<img src='assets/img/loader.gif' /> Processing",
                        "sLoadingRecords": "Fetching Data"
                    },
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "name" },
                    { "mData": "description" },
                    { "mData": "children[].name" },
                    { "mData": "productCategoryId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [3], // Column to target
                         "mRender": function (data, type, full) {

                                 return '<a href="#/categories/'+ data + '" class="btn btn-success btn-sm btn-success btn-update m-r">Edit</a><button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
                         }
                     },
                     {
                         "aTargets": [3], // Column to target
                         "mRender": function (data, type, full) {
                             return data == 1 ? 'Active' : 'Inactive';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    //console.log($('.btn-delete' , nRow));
                    $('.btn-delete', nRow).click(function () {
                        //console.log(aData.customerId);
                        bootstrapConfirm('Do you want to proceed to Delete?', function() {
                            scope.deleteFn(aData.productCategoryId);
                        });
                    });
                }
            });
            });
        }
    }
}]);