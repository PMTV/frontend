// CONTROLLERS

// Stock List Controller
INV.controller('StockAdjustListCtrl', function ($scope, $http, stockAdjustService) {
    $scope.stockAdjustTableData = null;

    $scope.loadStockAdjustments = function () {
        stockAdjustService.query().success(function (data) {
            $scope.stockAdjustTableData = data;
        })
    }

    $scope.deleteStockAdjust = function (id) {
        stockAdjustService.delete(id)
            .success(function (data) {
                stockAdjustDatatable.fnReloadAjax();
            })
            .error(function (error) {
                console.log(error);
            })
    };

    $scope.loadStockAdjustments();
});

// Stock Edit Controller
INV.controller('StockAdjustEditCtrl', function ($scope, $http, $route, $routeParams, $location, $translate, errorDisplay, stockAdjustService, supplierService, productService) {

    var stockAdjustId = null;
    $scope.stockAdjust = {};
    $scope.stockAdjust.tags = "";

    $scope.busy = true;

    $scope.select2OptionsProduct = {
        minimumInputLength: 3,
        id: function (obj) {
            return obj.productId; // use slug field for id
        },
        query: function (query) {
            productService.query(query.term).success(function (data) {
                query.callback({ results: data });
            });
        },
        formatResult: function (data) {
            return data.name;
        },
        formatSelection: function (data) {
            return data.name;
        },
        initSelection: function (element, callback) {
            var data = [];
        },
        escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
    }

    var _init = function () {
        stockAdjustId = $routeParams.id;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (stockAdjustId) {
            // Load Acquisition with acquisitionId
            stockAdjustService.get(stockAdjustId).success(function (data) {
                // copy the result into scope model
                angular.copy(data[0], $scope.stockAdjust);
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
    $scope.saveStockAdjust = function () {
        var newStock = {};

        angular.copy($scope.stockAdjust, newStock);

        $scope.busy = true;
        // set scope variable submitted to true to force validation
        $scope.submitted = true;

        // check if the form is valid
        // if (!$scope.myForm.$valid) {
        //     $scope.busy = false;
        //     alert($translate.instant('ALERT.FORM_ERROR'));
        //     return false;
        // }

        // if stockAdjustId not empty update, else add
        if (stockAdjustId) {
            
            stockAdjustService.put(stockAdjustId, newStock)
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
            stockAdjustService.add(newStock)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('stockAdjusts/' + data.stockAdjustmentsId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });;
        }
    };

    // Remove item from $scope.inventoryAcquisition.acquisitionDetailsList
    $scope.removeAcquisitionItem = function (index, acquisitionDetailsId) {
    }

    $scope.onChangedProduct = function (index, item) {
        $scope.stockAdjust.productId = item.productId;
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
