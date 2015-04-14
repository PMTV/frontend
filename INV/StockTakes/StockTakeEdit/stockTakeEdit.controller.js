// CONTROLLERS

// Stock List Controller
INV.controller('StockListCtrl', function ($scope, $http,stockService) {
    $scope.stockTakeTableData = null;

    $scope.loadStockTakes = function () {
        stockService.query().success(function (data) {
            $scope.stockTakeTableData = data;
        })
    }

    $scope.deleteStock = function (id) {
        stockService.delete(id)
            .success(function (data) {
                $scope.loadStockTakes();
            })
            .error(function (error) {
                console.log(error);
            })
    };

    $scope.loadStockTakes();
});

// Stock Edit Controller
INV.controller('StockEditCtrl', function ($scope, $http, $route, $routeParams, $location, $translate, errorDisplay, stockService, supplierService, productService)
{
    var stockId = null;
    $scope.stock = {};
    $scope.stockList = [];
    $scope.stock.stockTakeDetailsList = [];
    $scope.stock.tags = "";
    // $scope.purchaseOrderList = null;

    $scope.busy = true;

    $scope.today = function() {
        $scope.stock.startDate = new Date();
        // $scope.stock.endDate = new Date();
    };

    $scope.today();
    $scope.showWeeks = true;

    //Stocktakes grid
    $scope.stocks = [];
    var selectedItems = $scope.selectedItems = [];

    $scope.columnDefs = [
            { field: 'productId', displayName: '#' ,width:'2%'},
            { field: 'name', displayName: 'Product Name' },
            { field: 'productInventory.qtyInStock', displayName: 'In Hand Qty' },
            { field: 'inHandQty', displayName: 'Actual Qty', cellTemplate:'<input type="number" class="form-control" ng-model="item.inHandQty" ng-change="updateStockItem($index,row.entity)">' },
            { field: 'warehouseSectionId', displayName: 'Warehouse' , cellTemplate:'<warehousesections-dropdown name="warehouse" ng-required="true" ng-model="row.entity.warehouseSectionId" ng-change="updateStockItem($index,row.entity)"></warehousesections-dropdown>'},
            { field: 'description', displayName: 'Remarks', cellTemplate:'<textarea class="form-control" ng-required="item.inHandQty > item.productInventory.qtyInStock" ng-model="row.entity.description" ng-change="updateStockItem($index,row.entity)" name="description"></textarea>' },
            { field: 'productId', displayName: 'Actions', cellTemplate: '<label class="switch m-t m-l"><input type="checkbox" ng-model="selected" ng-change="toggleSelection(row.entity.productId)" ng-checked="row.entity.selected" ><span></span></label>', sortable: false, headerClass: 'unsortable' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        rowHeight:60,
        showSelectionCheckbox: false
    };


    //End stocktakes grid

    $scope.toggleWeeks = function () {
        $scope.showWeeks = ! $scope.showWeeks;
    };

    $scope.clear = function () {
        $scope.stock.startDate = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        // return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = ( $scope.minDate ) ? null : new Date();
    };

    $scope.toggleMin();

    $scope.open = function() {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.start_opened = true;
    };

    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
    $scope.startformat = $scope.formats[0];
    $scope.endformat = $scope.formats[0];


    var _init = function () {

        stockId = $routeParams.id;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (stockId) {
            // Load Acquisition with acquisitionId
            stockService.get(stockId).success(function (data) {
                // copy the result into scope model
                angular.copy(data[0], $scope.stock);
                // set tags by scope tags populated via tagsChanged method
                $scope.stock.tags = data[0].tags;
                $scope.stock.stockTakeDetailsList = $scope.stockList;
                // explicitly set details as result details
                if (data[0].stockTakeDetailsList.length) {
                    // $scope.stockList = data[0].stockTakeDetailsList;
                    $scope.checked = true;

                    angular.forEach(data[0].stockTakeDetailsList, function (k, v) {
                        $scope.stockList.push({
                            stockTakeDetailsId : k.stockTakeDetailsId,
                            productId: k.productId,
                            inHandQty: k.inHandQty,
                            productName: k.productName,
                            description: k.description,
                            warehouseSectionId: k.warehouseSectionId,
                            dateCreated: "2013-12-12",
                            userId: 1
                        })
                        // console.log(angular.toJson(k)+","+v);       
                    })

                } else {
                    // $scope.stockList = null;
                }
                //$scope.purchaseOrderList = data.purchaseOrderList;
                $scope.busy = false;
            });


        } else {
            // $scope.stock.stockTakeDetailsList = [];
             // stockService.getStock()
             //    .success (function (data) {
             //        $scope.stockList = data;
             //        console.log(data);
             //        // angular.copy(data, $scope.stockList);
             //    })
             //    .error (function (error) {
             //        errorDisplay.show(error);
             //    })
             //    .finally (function () {
             //        $scope.busy = false;
             //    });

            $scope.busy = false;
        }

    }

   

    // SELECT2 AJAX EXAMPLE * DO NOT REMOVE
    $scope.select2Tags = {
        minimumInputLength: 3,
        'multiple': true,
        'simple_tags': true,
        'tags': []  // Can be empty list.
    };

    // process the form
    $scope.saveStock = function () {
        var newStock = {};

        angular.copy($scope.stock, newStock);
        // alert(angular.toJson(newStock));
        $scope.busy = true;
        // set scope variable submitted to true to force validation
        $scope.submitted = true;

        // check if the form is valid
        // if (!$scope.myForm.$valid) {
        //     $scope.busy = false;
        //     alert($translate.instant('ALERT.FORM_ERROR'));
        //     return false;
        // }

        // if acquisitionId not empty update, else add
        if (stockId) {
            newStock.isClosed = true;
            
            stockService.put(stockId, newStock)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                    $route.reload();
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });


        } else {
            newStock.isClosed = false;
            stockService.add(newStock)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('stockTakes/' + data.stockTakeId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });;
        }
    };

    // Add item into $scope.inventoryAcquisition.acquisitionDetailsList
    $scope.selectStockItem = function (item) {
        var itemArr = $scope.stock.stockTakeDetailsList;
        var Exists = $.grep(itemArr, function (e) {
            return e.productId === item.productId;
        });

        // Check whether the item exists in array, if exists remove the item from array
        if (Exists.length) {
            item.checked = false;

            $scope.stock.stockTakeDetailsList = $.grep(itemArr, function (e) {
                return e.productId !== item.productId;
            });
        } else {
            item.checked = true;
            // item.receivedQty = item.qtyInProgress;

            $scope.stock.stockTakeDetailsList.push({
                productId: item.productId,
                inHandQty: item.productInventory.qtyInStock,
                productName: item.productName,
                description: item.description,
                warehouseSectionId: item.warehouseSectionId,
                dateCreated: "2013-12-12",
                userId: 1
            });
        }
    }

    

    $scope.updateQuantity = function (item) {
        angular.forEach($scope.stock.stockTakeDetailsList, function (k, v) {
            if (item.stockTakeDetailsId === k.stockTakeDetailsId) {
                k.qty = item.inHandQty
            }
        })
    }


    //$scope.isSelected = function (id) {
    //    var itemEx = $.grep($scope.inventoryAcquisition.inventoryAcquisitionsDetailsList,
    //        function (e) {
    //            return e.purchaseOrderDetailsId == id;
    //        });

    //    return itemEx.length > 0;
    //}

    // Remove item from $scope.inventoryAcquisition.acquisitionDetailsList
    $scope.removeAcquisitionItem = function (index, acquisitionDetailsId) {
        //var acquisitionId = $routeParams.id;
        //// check if acquisitionDetailsId is null, if not null, call delete item API
        //if (acquisitionDetailsId) {
        //    if (confirm('Delete Item from Acquisition Order?')) {
        //        acquisitionService.deleteItem(acquisitionId, acquisitionDetailsId)
        //            .success(function (data) {
        //                $scope.inventoryAcquisition.inventoryAcquisitionsDetailsList.splice(index, 1);
        //            })
        //            .error(function (data) {
        //                errorDisplay.show(data);
        //            });
        //    }
        //} else {
        //    $scope.inventoryAcquisition.inventoryAcquisitionsDetailsList.splice(index, 1);
        //}
    }

    // Load Supplier on dropdown select change
    // $scope.onSelectSupplier = function (supplierId) {
    //     var currentId = $scope.purchaseOrderList != null ? $scope.purchaseOrderList.supplierId : null;

    //     if (supplierId != currentId) {
    //         // clear purchaseOrderList object
    //         $scope.purchaseOrderList = null;

    //         if (supplierId) {
    //             supplierService.get(supplierId + "/purchaseorders?includePurchases=true")
    //                 .success(function (data) {
    //                     $scope.purchaseOrderList = data;
    //                 })
    //                 .error(function () {
    //                     // TODO ERROR
    //                 });
    //         }
    //     }
    // }

    $scope.getUOMNumber = function (uomId, uomList) {
        var returnValue = 1;

        angular.forEach(uomList, function (key, value) {
            if (key.productUOMId == uomId) {
                returnValue = key.value;
                return false;
            };
        });

        return returnValue;
    }

    $scope.$watch("inventoryAcquisition.tags", function (newValue, oldValue) {
        // do something
        var tags = newValue;

        if (angular.isArray(tags)) {
            $scope.inventoryAcquisition.tags = tags.join();
        }
    });

    _init();
});
