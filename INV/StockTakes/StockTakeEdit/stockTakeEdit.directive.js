// DIRECTIVES

// STOCK Datatable 
INV.directive('stocksDatatable', function (stockService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = $(element).dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "stockTakeName" },
                    { "mData": "startDate" },
                    { "mData": "endDate" },
                    { "mData": "isClosed" },
                    { "mData": "stockTakeId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [4], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/stockTakes/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        if (confirm('Delete stock take?'))
                            scope.deleteStock(aData.stockTakeId);
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

INV.directive('stocktakesGrid', ['stockService','sharedStockService', '$filter', '$timeout', '$compile', '$debounce', '$translate', function (stockService,sharedStockService, $filter, $timeout, $compile, $debounce, $translate) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    }

    function controller($scope, $attrs) {

        $scope.sortOptions = {
            fields: ["stockTakeId"],
            directions: ["asc"]
        };
        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data; //data.slice((page - 1) * pageSize, page * pageSize)

            //make it all selected by default
            angular.forEach(pagedData, function(v,k){
                v.selected = true;
            });

            sharedStockService.putStock(pagedData); //put it in a shared service to be retrieve by controller

            // console.log(pagedData);
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
                    stockService.queryStock(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    stockService.queryStock(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.toggleSelection = function(productId)
        {
            sharedStockService.toggleSelection(productId);
        }

        $scope.updateStockItem = function(index,item) {
            // console.log(index);
            // console.log(item);
            // console.log($scope.items);
            // if (index)
            // {

            //     $scope.stock.stockTakeDetailsList[index].productInventory.qtyInStock = item.productInventory.qtyInStock;
            //     $scope.stock.stockTakeDetailsList[index].warehouseSectionId = item.warehouseSectionId;
            //     $scope.stock.stockTakeDetailsList[index].description = item.description;
            // }
        }

        // $scope.delete = function (id) {
        //     if (confirm($translate.instant('ALERT.DELETING'))) {
        //         purchaseService.delete(id)
        //                 .success(function (data) {
        //                     $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        //                 })
        //                 .error(function (error) {
        //                     //console.log(error);
        //                 })
        //     }
        // }
    }
}
]);


// Acquisition Order Item Table 
INV.directive('stockitemsTable', function (stockService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {
        }
    }
});