// CONTROLLERS

// Acquisition Order List Controller
INV.controller('AcquisitionListCtrl', function ($scope, $http, acquisitionService) {

    $scope.acquisitions = [];
    var selectedItems = $scope.selectedItems = [];

    $scope.columnDefs = [
            { field: 'inventoryAcquisitionNumber', displayName: '#Inventory Acquisition Number' },
            { field: 'supplierCompany', displayName: 'Supplier Company Name' },
            { field: 'dateAcquisition', displayName: 'Date Received', cellFilter: 'date', visible: true },
            { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date', visible: true },
            { field: 'inventoryAcquisitionId', displayName: 'Actions', cellTemplate: '<a href="#/acquisitions/{{row.entity.inventoryAcquisitionId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.inventoryAcquisitionId)">Delete</a>', sortable: false, headerClass: 'unsortable' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false
    };

    //$scope.acquisitionTableData = null;

    //$scope.loadAcquisition = function () {
    //    acquisitionService.query().success(function (data) {
    //        $scope.acquisitionTableData = data;
    //    })
    //}

    //$scope.deleteAcquisition = function (id) {
    //    acquisitionService.delete(id)
    //        .success(function (data) {
    //            oDatatable.fnReloadAjax();
    //        })
    //        .error(function (error) {
    //            console.log(error);
    //        })
    //};

    //$scope.loadAcquisition();
});

// Acquisition Order Edit Controller
INV.controller('AcquisitionEditCtrl', function ($scope, $http, $route, $routeParams, $location, $timeout, $translate, errorDisplay, acquisitionService, supplierService, productService, hotkeys) {

    var acquisitionId = null;
    $scope.inventoryAcquisition = {};
    $scope.inventoryAcquisition.tags = "";
    $scope.purchaseOrderList = null;

    // which items acquisition edit first, add items will be hidden
    $scope.showFirst = false;
    $scope.showSecond = true;

    $scope.busy = false;

    hotkeys.add({
        combo: 'ctrl+s',
        description: 'Save Acquisition',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            $scope.saveAcquisition();
            event.preventDefault();
        }
    });

    var _init = function () {
        acquisitionId = $routeParams.id;

        // $routeParams.id will contain the primary key of the item to edit, or be empty
        // if we are creating a new product
        if (acquisitionId) {
            $scope.showFirst = true;
            $scope.showSecond = false;
            // Load Acquisition with acquisitionId
            acquisitionService.get(acquisitionId).success(function (data) {
                // copy the result into scope model
                $scope.inventoryAcquisition = data;

                $scope.busy = false;
            });
        } else {
            $scope.inventoryAcquisition.inventoryAcquisitionsDetailsList = [];
            $scope.busy = false;
        }
    }

    // process the form
    $scope.saveAcquisition = function () {
        var newAcquisition = {};
        var tags = $scope.inventoryAcquisition.tags;
        angular.copy($scope.inventoryAcquisition, newAcquisition);

        if (angular.isArray(tags)) {
            newAcquisition.tags = tags.join();
        }

        $scope.busy = true;
        // set scope variable submitted to true to force validation
        $scope.submitted = true;

        $timeout(function () {
            // check if the form is valid
            if (!$scope.myForm.$valid) {
                $scope.busy = false;
                alert($translate.instant('ALERT.FORM_ERROR'));
                return false;
            }

            // if acquisitionId not empty update, else add
            if (acquisitionId) {
                acquisitionService.put(acquisitionId, newAcquisition)
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
                acquisitionService.add(newAcquisition)
                    .success(function (data) {
                        alert($translate.instant('ALERT.CREATED'));
                        $location.url('acquisitions/' + data.inventoryAcquisitionId);
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });;
            }
        });
    };

    // Add item into $scope.inventoryAcquisition.acquisitionDetailsList
    $scope.selectAcquisitionItem = function (poNumber, item) {
        var itemArr = $scope.inventoryAcquisition.inventoryAcquisitionsDetailsList;
        var existsArr = _.filter(itemArr, function (e) {
            return e.purchaseOrderDetailsId === item.purchaseOrderDetailsId && !e.inventoryAcquisitionsDetailsId;
        });

        // Check whether the item exists in array, if exists remove the item from array
        if (existsArr.length) {
            item.checked = false;

            $scope.inventoryAcquisition.inventoryAcquisitionsDetailsList = _.filter(itemArr, function (e) {
                return e.purchaseOrderDetailsId !== item.purchaseOrderDetailsId || e.inventoryAcquisitionsDetailsId;
            });
        } else {
            item.checked = true;
            item.receivedQty = item.qtyInProgress;

            $scope.inventoryAcquisition.inventoryAcquisitionsDetailsList.push({
                productName: item.productName,
                purchaseOrderNumber: poNumber,
                purchaseOrderDetailsId: item.purchaseOrderDetailsId,
                qty: item.receivedQty,
                isBatchItem: item.isBatchItem
            });
        }
    }

    $scope.updateQuantity = function (item) {
        angular.forEach($scope.inventoryAcquisition.inventoryAcquisitionsDetailsList, function (k, v) {
            if (item.purchaseOrderDetailsId === k.purchaseOrderDetailsId) {
                k.qty = item.receivedQty
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
    $scope.removeAcquisitionItem = function (index, item) {
        console.log(item);
        var acquisitionId = $routeParams.id;
        var acquisitionDetailsId = item.inventoryAcquisitionsDetailsId;

        // check if acquisitionDetailsId is null, if not null, call delete item API
        if (acquisitionDetailsId) {
            if (confirm('Delete Item from Acquisition Order?')) {
                item.isDeleting = true;

                acquisitionService.deleteItem(acquisitionId, acquisitionDetailsId)
                    .success(function (data) {
                        $scope.inventoryAcquisition.inventoryAcquisitionsDetailsList.splice(index, 1);
                    })
                    .error(function (data) {
                        errorDisplay.show(data);
                    })
                .finally(function () {
                    item.isDeleting = false;
                });
            }
        } else {
            $scope.inventoryAcquisition.inventoryAcquisitionsDetailsList.splice(index, 1);

            var purchaseOrderDetails;

            angular.forEach($scope.purchaseOrderList, function (po) {
                purchaseOrderDetails = _.find(po.purchaseOrderDetailsList, function (pod) {
                    return (item.purchaseOrderDetailsId == pod.purchaseOrderDetailsId)
                });

                if (purchaseOrderDetails)
                    purchaseOrderDetails.checked = false;
            });

        }
    }

    // Load Supplier on dropdown select change
    $scope.onSelectSupplier = function (supplierId) {
        var currentId = $scope.purchaseOrderList != null ? $scope.purchaseOrderList.supplierId : null;
        if (supplierId != currentId) {
            // clear purchaseOrderList object
            $scope.purchaseOrderList = null;
            $scope.purchaseOrderDetailsList;

            if (supplierId) {
                supplierService.get(supplierId + "/purchases?includePurchases=true")
                    .success(function (data) {
                        angular.forEach(data, function (v, k) {
                            v.purchaseOrderDetailsList = _(v.purchaseOrderDetailsList).filter(function (x) { return x.qtyInProgress !== 0 })
                        })

                        $scope.purchaseOrderList = data;
                        $scope.purchaseOrderDetailsList = _.flatten(_.pluck($scope.purchaseOrderList, 'purchaseOrderDetailsList'), false);
                        // filter out all qtyInProgress already 0 (meaning all items already acquisited for Purchase Order Detail)
                        //$scope.purchaseOrderList.purchaseOrderDetailsList = _(data.purchaseOrderDetailsList).filter(function (x) { console.log(x); return x.qtyInProgress !== 0 })
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
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

    _init();
});
