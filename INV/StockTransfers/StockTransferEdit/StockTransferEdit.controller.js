// CONTROLLERS

// Stock List Controller
INV.controller('StockTransferListCtrl', function ($scope, $http, stockTransferService) {
    $scope.stockTransferTableData = null;

    $scope.loadStockTransfers = function () {
        stockTransferService.query().success(function (data) {
            $scope.stockTransferTableData = data;
        })
    }

    $scope.deleteStockTransfer = function (id) {
        stockTransferService.delete(id)
            .success(function (data) {
                stockTransferDatatable.fnReloadAjax();
            })
            .error(function (error) {
                console.log(error);
            })
    };

    $scope.loadStockTransfers();
});

// Stock Edit Controller
INV.controller('StockTransferEditCtrl', function ($scope, $http, $route, $routeParams, $location, $translate, errorDisplay, stockTransferService, supplierService, productService) {
    var stockTransferId = null;
    $scope.stockTransfer = {};
    $scope.busy = false;

    var _init = function () {
        stockTransferId = $routeParams.id;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (stockTransferId) {
            // Load Acquisition with acquisitionId
            stockTransferService.get(stockTransferId).success(function (data) {
                // copy the result into scope model
                angular.copy(data[0], $scope.stockTransfer);
                // set tags by scope tags populated via tagsChanged method
                // $scope.stockAdjust.tags = data[0].tags;
                // explicitly set details as result details
                $scope.busy = false;
            });
        } else {
            // $scope.stock.stockTakeDetailsList = [];
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
    $scope.saveStockTransfer = function () {
        var newStock = {};
        angular.copy($scope.stockTransfer, newStock);

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
        if (stockTransferId) {
            
            stockTransferService.put(stockTransferId, newStock)
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
            stockTransferService.add(newStock)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('stockTransfer/' + data.stockTransferId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });
        }
    };

    $scope.onChangedProduct = function (index, item) {
        $scope.stockTransfer.productId = item.productId;
    }

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
