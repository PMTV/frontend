// DIRECTIVES

// Purchase Order Datatable 
PUR.directive('purchasesDatatable', function (purchaseService,$translate) {
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
                    { "mData": "purchaseOrderNumber" },
                    { "mData": "supplier.companyName" },
                    { "mData": "purchaseOrderId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [2], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/purchases/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/purchases" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        if (confirm($translate.instant('ALERT.DELETING')))
                            scope.deletePurchase(aData.purchaseOrderId);
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


PUR.directive('purchasesGrid', ['purchaseService', '$filter', '$timeout', '$compile', '$debounce', '$translate', 'errorDisplay', function (purchaseService, $filter, $timeout, $compile, $debounce, $translate, errorDisplay) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    }

    function controller($scope, $attrs) {

        $scope.sortOptions = {
            fields: ["purchaseOrderNumber"],
            directions: ["asc"]
        };
        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data.results; //data.slice((page - 1) * pageSize, page * pageSize)
            $scope.items = pagedData;
            $scope.totalServerItems = data.total;
            //if (!$scope.$$phase) {
            //    $scope.$apply();
            //}
        };
        $scope.getPagedDataAsync = function (pageSize, page, searchText) {
            setTimeout(function () {
                var sb = [];
                for (var i = 0; i < $scope.sortOptions.fields.length; i++) {
                    sb.push($scope.sortOptions.fields[i]);
                    sb.push($scope.sortOptions.directions[i]);
                }

                var data;
                if (searchText) {
                    var ft = searchText.toLowerCase();
                    purchaseService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    purchaseService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                purchaseService.delete(id)
                        .success(function (data) {
                            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                        })
                        .error(function (error) {
                            //console.log(error);
                            errorDisplay.show(error);
                        })
            }
        }
    }
}
]);

// Purchase Order Item Table 
PUR.directive('purchaseitemsTable', function (purchaseService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

// Purchase Order Item Table 
PUR.directive('ddlUOMList', function (purchaseService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});
