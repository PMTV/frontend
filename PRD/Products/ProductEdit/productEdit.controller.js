var ProductListController = function ($scope, $http, $modal, productService, $log) {
    $scope.products = [];
    var selectedProducts = $scope.selectedProducts = [];

    $scope.columnDefs = [
            { field: 'product', displayName: 'Image', cellTemplate: '<div class="text-center"><img class="pointer" ng-click="imageClicked(getDefaultImage(row.entity.productMediaList), row.entity)" src="{{getDefaultImage(row.entity.productMediaList)}}" height="39" /></div>', sortable: false, headerClass: 'unsortable', width: '5%' },
            { field: 'name', displayName: 'Product Name', width: '20%' },
            { field: 'itemCode', displayName: 'Item Code', width: '10%' },
            { field: 'barcode', displayName: 'Barcode', width: '10%' },
            { field: 'description', displayName: 'Description', width: '30%' },
            { field: 'priceSelling', displayName: 'Selling Price', cellFilter: 'currency', width: '10%' },
            { field: 'status', displayName: 'Status', cellTemplate: '<div class="ngCellText">{{row.entity.status == 1 ? "Active" : "InActive"}}</div>', visible: false, width: 100 },
            { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date', visible: false, width: 150 },
            { field: 'productId', displayName: 'Actions', cellTemplate: '<a href="#/products/{{row.entity.productId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><button type="button" class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.productId)">Delete</button>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false
    };

    $scope.doAction = function (action) {
        if (action == "barcode") {
            $scope.generateBarcode();
        }
    }

    $scope.toggleSelection = function (productId) {
        var idx = selectedProducts.indexOf(productId);

        if (idx >= 0) {
            selectedProducts.splice(idx, 1);
        } else {
            selectedProducts.push(productId);
        }
    }

    $scope.generateBarcode = function () {

        if (selectedProducts.length <= 0) {
            alert('Please select at least 1 product.')
        } else {
            var dialog = $modal.open({
                backdrop: false,
                keyboard: true,
                template: '' +
                    '<div class="modal-header">' +
                    '<button class="close" aria-hidden="true" data-dismiss="modal" type="button" ng-click="cancel()">' +
                        '×' +
                    '</button>' +
                    '<h4 class="modal-title">' +
                        'Barcodes' +
                    '</h4>' +
                    '</div>' +
                    '<div class="modal-body" align="center">' +
                        '<div>' +
                            '<ul class="list-unstyled">' +
                                '<li class="m-b" ng-repeat="product in barcodes">' +
                                    '<product-barcode code="{{product.barcode}}"></product-barcode>' +
                                    '<div tooltip="{{product.name}}">{{product.barcode}}</div>' +
                                '</li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                '<div class="modal-footer">' +
                    '<button class="btn btn-sm" ng-click="cancel()">Close</button>' +
                    '<button class="btn btn-sm btn-success" ng-click="print()">Print</button>' +
                '</div>',
                controller: function ($scope, $modalInstance, selected, productService) {
                    // MODAL SCOPE
                    $scope.selectedProducts = selected;
                    $scope.barcodes = null;

                    if (angular.isArray(selected)) {
                        $scope.barcodes = selected.join();
                    }

                    productService.getBarcodes(selected).success(function (data) {
                        $scope.barcodes = data;
                    });

                    $scope.print = function () {
                        window.print();
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    selected: function () {
                        return $scope.selectedProducts;
                    }
                }
            });

            dialog.result.then(function () {

            },
            function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }
    }
};

PRD.controller('ProductListCtrl', ProductListController);

PRD.controller('ProductEditCtrl', function ($scope, $http, $routeParams, $route, $location, $modal, $translate, hotkeys, productService, errorDisplay) {
    $scope.product = {};
    $scope.product.productOptionList = [];
    $scope.product.productCategoriesList = [];
    $scope.product.productUOMList = [];

    var productId = null;

    // or pass it arguments:
    hotkeys.add({
        combo: 'ctrl+s',
        description: 'Save Product',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            $scope.saveProduct();
            event.preventDefault();
        }
    });

    var _init = function () {
        productId = $routeParams.id;

        if (productId) {
            productService.get(productId)
                .success(function (data) {
                    angular.copy(data, $scope.product)
                })
                .error(function (data, status, headers, config) {
                    errorDisplay.show(data, status, headers, config);
                });
        }
    }

    $scope.barcodeGen = function () {
        //$scope.product = {};
        //$scope.product.barcode;

        productService.getBarcode(productId)
    		.success(function (data) {
    		    //errorDisplay.show(data);
    		    $scope.product.barcode = data;
    		})
    		.error(function (error) {
    		    console.log("barcode error");
    		});
    };

    $scope.saveProduct = function () {
        $scope.submitted = true;
        $scope.busy = true;

        // Remove properties
        $scope.product.userCreated = null;

        if (!$scope.myForm.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            $scope.busy = false;
            return false;
        }
        var multiArr = [];
        angular.copy($scope.product.productCustomerPricesList, multiArr);
        if (multiArr.length > 0) {
            productService.updateMultiPrice($scope.product.productId, multiArr).success(function (data, status) { });
        }

        var quantityArr = [];
        angular.copy($scope.product.productQuantityPriceList, quantityArr);
        //if (quantityArr.length > 0) {
            productService.updateQuantityPrice($scope.product.productId, quantityArr).success(function (data, status) { });
        //}

        angular.forEach($scope.product.productReviewList, function (value, key) {
            value.userCreated = null;
        });


        if (productId) {
            productService.update($scope.product)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                    $route.reload(); //$location.url('/products/' + data.productId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
            .finally(function () {
                $scope.busy = false;
            });
        }
        else {
            productService.add($scope.product)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('/products/' + data.productId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
            .finally(function () {
                $scope.busy = false;
            });
        }
    };

    $scope.removeProductUOM = function (productUOM) {
        var uomId = productUOM.productUOMId;
        var index = $scope.product.productUOMList.indexOf(productUOM);

        if (uomId) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                productService.deleteUOM(uomId)
                    .success(function (data) {
                        alert($translate.instant('ALERT.DELETED'));
                        $scope.product.productUOMList.splice(index, 1);
                    })
            }
        } else {
            $scope.product.productUOMList.splice(index, 1);
        }
    }

    $scope.addProductUOM = function (productUOM) {
        var uom = {};
        angular.copy(productUOM, uom);
        $scope.product.productUOMList.push(uom);
    }

    $scope.addOption = function (option) {
        var newOption = angular.copy(option);
        $scope.product.productOptionList.push(newOption);
    }

    $scope.deleteOption = function (index) {
        //$scope.product.productOptionList.productOptionDetails.splice(index,1);
    }

    $scope.onChangedSupplier = function (supplier) {
        if (!supplier) { return false; };
        var exists = false;

        supplier = angular.fromJson(supplier);

        var newSupplier = {
            supplierId: supplier.supplierId,
            companyName: supplier.companyName,
            firstName: supplier.firstName,
            lastName: supplier.lastName
        }

        angular.forEach($scope.product.supplierList, function (k, v) {
            if (k.supplierId == supplier.supplierId) {
                exists = true;
                return false;
            }
        })

        if (!exists) {
            $scope.product.supplierList.push(newSupplier);
        }
    }

    $scope.onChangedCategory = function (category) {
        if (category) {
            var exists = false;
            category = angular.fromJson(category);
            var newCategory = {
                productCategoryId: category.productCategoryId,
                name: category.name,
                uniqueName: category.uniqueName
            };

            angular.forEach($scope.product.productCategoriesList, function (k, v) {
                if (k.productCategoryId == category.productCategoryId) {
                    exists = true;
                    return false;
                }
            })

            if (!exists) {
                $scope.product.productCategoriesList.push(newCategory);
            }
        }
    }

    $scope.removeSupplier = function (index) {
        $scope.product.supplierList.splice(index, 1);
    }

    $scope.removeCategory = function (index) {
        $scope.product.productCategoriesList.splice(index, 1);
    }

    $scope.$watch('product.dateDiscountedFrom', function (newval, oldval) {
        if ($scope.product.dateDiscountedTo < $scope.product.dateDiscountedFrom) {
            $scope.product.dateDiscountedTo = '';
        }
    }, true);
    $scope.$watch('product.dateDiscountedTo', function (newval, oldval) {
        if ($scope.product.dateDiscountedTo < $scope.product.dateDiscountedFrom) {
            $scope.product.dateDiscountedTo = '';
        }
    }, true);

    _init();
});

PRD.controller('ProductAsideCtrl', function ($scope, $debounce, productService) {
    $scope.saveInfoInprogress = false;
    var saveFinished = function () { $scope.saveInfoInprogress = false; };

    var saveDiscription = function (newVal, oldVal) {
        if (newVal === oldVal || oldVal == undefined) {
            return;
        }
        if ((newVal != oldVal) && (!$scope.saveInfoInprogress)) {
            var product = $scope.product;
            var saveProduct = {
                productId: product.productId,
                description: newVal
            }
            $scope.saveInfoInprogress = true;
            productService.patch("products", saveProduct, product.productId)
                .then(saveFinished, saveFinished); // both success and error promises
        }
    };

    // 1000 = 1 second
    // The 'true' argument signifies that I want to do a 'deep' watch of my model.
    $scope.$watch('product.description', $debounce(saveDiscription, 1000), true);
});

PRD.controller('ReviewListCtrl', function ($http, $scope, $routeParams, $log, productService) {

    var productId = $routeParams.id;

    if (productId) {
        $scope.reviewArr = [];
        $scope.selectedReview = {};
        productService.queryReviews()
			.then(function (data) {
			    $scope.reviewArr = (data.data);
			    $log.log("Review Ok");
			});

        $scope.add = function (review) {
            review.productId = productId;

            productService.add("productreviews", review)
        		.success(function (data) {
        		    $scope.reviewArr.push(data);
        		})
        		.error(function (data) {
        		    $log.log("Add review error");
        		});
        };

        $scope.deleteReview = function (review) {
            productService.delete("productreviews", review.productReviewId)
        		.success(function (data) {
        		    $scope.reviewArr.splice($scope.reviewArr.indexOf(review), 1);
        		})
        		.error(function (error) {
        		    $log.log("delete review error");
        		});
        }
    }
    else {
        $scope.reviewArr = [];
    }

});

PRD.controller('ProductCategoryCtrl', function ($http, $scope, $routeParams, productService) {

    var productId = $routeParams.id;

    $scope.catArray = [];

    productService.queryCategory()
		.success(function (data) {
		    $scope.catArray = data;
		    console.log($scope.catArray);
		})
		.error(function (data) {
		});

    productService.getCategory(productId)
        .success(function (data) {
            $scope.catArray = data;
            // alert(angular.toJson(data[0].productCategoriesList));
            //$scope.product.productCategoriesList = data[0].productCategoriesList;
        })
        .error(function (error) {
        });

    $scope.addSelected = function (category) {
        ($scope.product.productCategoriesList.push(category));
    };

    $scope.removeSelected = function (item) {
        $scope.selectedArray.splice($scope.selectedArray.indexOf(item), 1);
    };
});

PRD.controller('MediaListCtrl', function ($http, $scope, $routeParams, $log, productService) {

    var productId = $routeParams.id;

    if (productId) {
        $scope.mediaArr = [];
        $scope.selectedMedia = {};
        //productService.queryMedia()
        //    .then(function (data) {
        //        $scope.mediaArr = (data.data);
        //        //console.log($scope.quotationArr[0].quotationId);
        //        $log.log("Media ok");
        //    })

        $scope.loadMedia = function (media) {
            $log.log("load media " + JSON.stringify(media));
            $scope.selectedMedia = media;
            $scope.loaded = true;
        };

        $scope.addMedia = function (media) {
            media.productId = productId;

            productService.add("productmedias", media)
        		.success(function (data) {
        		    $scope.mediaArr.push(data);
        		})
        		.error(function (data) {
        		    $log.log("Add media error");
        		});
        };

        $scope.deleteMedia = function (media) {
            productService.delete(media.mediaId)
        		.success(function (data) {
        		    $scope.mediaArr.splice($scope.mediaArr.indexOf(media), 1);
        		})
        		.error(function (error) {
        		    $log.log("Add media error");
        		});
        }
    }
    else {
        $scope.mediaArr = [];
    }
});

PRD.controller('MultiPriceCtrl', function ($http, $scope, $routeParams, $log, productService) {
    $scope.mCustomer = {};
    $scope.mCustomerGroup = {};


    $scope.$watch('product', function (value) {
        $scope.multiPrice = $scope.product.productCustomerPricesList || [];
    }, true);


    $scope.createCustomerPrice = function () {
        if ($scope.mCustomer.customerId === undefined || $scope.mCustomer.customerId.length < 0) {
            alert('Please select customer.');
            return false;
        }
        if ($scope.mCustomer.price === undefined || $scope.mCustomer.price <= 0) {
            alert('Price is required and must be positive number.');
            return false;
        }

        $scope.mCustomer.productId = $scope.product.productId;
        $scope.multiPrice.push($scope.mCustomer); // add item to list
        $scope.mCustomer = {}; // reset item
        $scope.product.productCustomerPricesList = $scope.multiPrice; // re-assign
    }

    $scope.createCustomerGroupPrice = function () {
        if ($scope.mCustomerGroup.customerGroupId === undefined || $scope.mCustomerGroup.customerGroupId.length < 0) {
            alert('Please select customer group.');
            return false;
        }
        if ($scope.mCustomerGroup.price === undefined || $scope.mCustomerGroup.price <= 0) {
            alert('Price is required and must be positive number.');
            return false;
        }

        $scope.mCustomerGroup.productId = $scope.product.productId;
        $scope.multiPrice.push($scope.mCustomerGroup); // add item to list
        $scope.mCustomerGroup = {}; // reset item
        $scope.product.productCustomerPricesList = $scope.multiPrice; // re-assign
    }

    $scope.removeSelected = function (index) {
        $scope.multiPrice.splice(index, 1);
        $scope.product.productCustomerPricesList = $scope.multiPrice; // re-assign
    }


});

PRD.controller('ProductImportCtrl', function ($scope, $controller, importExcelService, $http, $translate, errorDisplay) {
    $controller('ImportExcelCtrl', { $scope: $scope });

    var productsData = $scope.productsData = null;
    $scope.dropdownLoad = "Product";
    $scope.linkAll = "#/products";

    $scope.tabTable = 'PRD/Products/ProductEdit/Import/tabTable.html?a=a';

    $scope.mappingNext = function () {
        var product = $scope.excelColumnList;
        importExcelService.getExcelData($scope.uploadFileName, $scope.dropdownLoad, product)
            .success(function (data) {
                $scope.productsData = data;
                productsData = data;
                $scope.loadNewLayout(3);
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
        ;
    };

    $scope.tableNext = function () {
        var i = $scope.productsData.length;
        while (i--) {
            if ($scope.productsData[i].isCheck == true) {
                $scope.productsData.splice(i, 1);
            }
        }
        importExcelService.importProducts($scope.productsData)
            .success(function (data) {
                $scope.notify = data;
                $scope.loadNewLayout(4);
            });
    };

});

PRD.controller('QuantityPriceCtrl', function ($http, $scope, $routeParams, $log, productService) {
    $scope.mQuantity = {};

    $scope.quantityPrice = [];
    var _init = function() {
        $scope.quantityPrice = $scope.product.productQuantityPriceList || [];
        doCalToQuantity();
    };

    var doCalToQuantity = function () {
        if($scope.quantityPrice.length > 0){
            $scope.quantityPrice.sort(function(a,b) { return parseInt(a.fromQuantity) - parseInt(b.fromQuantity) } );

            for(var i = 0; i<$scope.quantityPrice.length; i++){
                if($scope.quantityPrice[i+1] != undefined){
                    $scope.quantityPrice[i].calToQuantity = parseInt($scope.quantityPrice[i+1].fromQuantity -1);
                }else{
                    $scope.quantityPrice[i].calToQuantity = '+';
                }
            }
        }else{
            if($scope.mQuantity.length > 0){
                $scope.mQuantity.calToQuantity = '+';
            }
        }
    };
   
    $scope.$watch(function() { return $scope.product; }, function (value) {
        //$scope.quantityPrice = $scope.product.productQuantityPriceList || [];
        if (value != null) {
            _init();
        } else {
            return false;
        }
    }, true);


    $scope.createQuantityPrice = function () {
        if ($scope.mQuantity.fromQuantity === undefined || $scope.mQuantity.fromQuantity < 0) {
            alert('Please select quantity from.');
            return false;
        }

//        if ($scope.mQuantity.toQuantity === undefined || $scope.mQuantity.toQuantity < 0) {
//            alert('Please select quantity to.');
//            return false;
//        }

        if ($scope.mQuantity.price === undefined || $scope.mQuantity.price <= 0) {
            alert('Price is required and must be positive number.');
            return false;
        }

        doCalToQuantity();

        $scope.mQuantity.productId = $scope.product.productId;
        $scope.quantityPrice.push($scope.mQuantity); // add item to list
        $scope.mQuantity = {}; // reset item
        $scope.product.productQuantityPriceList = $scope.quantityPrice; // re-assign
    };

    $scope.removeSelected = function (index) {
        $scope.quantityPrice.splice(index, 1);
        $scope.product.productQuantityPriceList = $scope.quantityPrice;
    }
});