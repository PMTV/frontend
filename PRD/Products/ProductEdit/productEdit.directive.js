//PRD.directive('productsDropdown', function ($window, productService) {
//    return {
//        restrict: 'E',
//        replace: true,
//        scope: { selected: "=product" },
//        template: '' +
//            '<div ui-select2="select2Options" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
//        controller: function ($scope, productService, $debounce) {
//            $scope.initData = [];
//            var loaded = false;

//            productService.query("", 15, 1).success(function (data) {
//                $scope.initData = data;
//            });

//            $scope.select2Options = {
//                cacheDataSource: [],
//                loaded: true,
//                more: false,
//                id: function (item) {
//                    return item.productId; // use slug field for id
//                },
//                dataBinder: function (item) {
//                    return item.productId; // use slug field for id
//                },
//                query: function (query) {
//                    self = this;
//                    var key = query.term;
//                    var cachedData = self.cacheDataSource[key];
//                    var initData = $scope.initData;

//                    if ((cachedData || initData) && !self.more) {
//                        if (cachedData) {
//                            query.callback({ results: cachedData.results });
//                        }
//                        else {
//                            self.cacheDataSource[key] = initData;
//                            $scope.initData = null;

//                            self.more = true;
//                            query.callback({ results: initData.results, more: true });
//                        }

//                        return;
//                    } else {
//                        productService.query(query.term, 15, query.page, null, null, { tracker: 'none' })
//                            .success(function (data) {
//                                self.more = (query.page * 15) < data.total; // whether or not there are more results available

//                                if (self.cacheDataSource[key]) {
//                                    self.cacheDataSource[key].results = (self.cacheDataSource[key].results.concat(data.results));
//                                    self.cacheDataSource[key] = self.cacheDataSource[key];
//                                } else {
//                                    self.cacheDataSource[key] = data;
//                                }

//                                query.callback({ results: data.results, more: self.more });
//                            });
//                    }
//                },
//                formatResult: function (data) {
//                    return data.name || '';
//                }, // omitted for brevity, see the source of this page
//                formatSelection: function (data) {
//                    return data.productName || data.name;
//                },
//                initSelection: function (element, callback) {
//                    // the input tag has a value attribute preloaded that points to a preselected item's id
//                    // this function resolves that id attribute to an object that select2 can render
//                    // using its formatResult renderer - that way the item name is shown preselected
//                    var id = $(element).val();
//                    if (id !== "" && !loaded) {
//                        loaded = true;
//                        productService.get(id, { tracker: 'none' })
//                            .success(function (data2) {
//                                // If directive is passing selected object
//                                if ($scope.selected)
//                                    $scope.selected.product = data2;

//                                callback(data2);
//                            });
//                    }
//                },
//                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
//            }
//        }
//    };
//});

PRD.directive('productsDropdown', function ($window, customerService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<div ui-select2="select2Options" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
        controller: function ($scope, productService, $debounce) {
            $scope.initData = [];
            var loaded = false;

            $scope.select2Options = {
                cacheDataSource: [],
                more: false,
                id: function (item) {
                    return item.productId; // use slug field for id
                },
                query: function (query) {
                    self = this;
                    var key = query.term;
                    var cachedData = self.cacheDataSource[key];
                    var initData = $scope.initData;

                    if ((cachedData || initData.length) && !self.more) {
                        if (cachedData) {
                            query.callback({ results: cachedData.results });
                        }
                        else {
                            self.cacheDataSource[key] = initData;
                            $scope.initData = null;
                            self.more = true;
                            query.callback({ results: initData.results, more: true });
                        }

                        return;
                    } else {
                        productService.query(query.term, 15, query.page, null, null, { tracker: 'none' }).success(function (data) {
//                            console.info(data);
                            self.more = (query.page * 15) < data.total; // whether or not there are more results available

                            if (self.cacheDataSource[key]) {
                                self.cacheDataSource[key].results = (self.cacheDataSource[key].results.concat(data.results));
                                self.cacheDataSource[key] = self.cacheDataSource[key];
                            } else {
                                self.cacheDataSource[key] = data;
                            }

                            query.callback({ results: data.results, more: self.more });
                        });
                    }
                },
                formatResult: function (data) {
                    function includeImage(input) {
                        var linkImg = null;
                        if(input.productMediaList.length > 0){
                            angular.forEach(input.productMediaList, function (value, key) {
                                if(value.isDefault){
                                    linkImg = value.filePath;
                                }
                            });
                        }
                        return linkImg;
                    }

                    function buildImage(link, productName) {
                        var imageButton = '<i class="fa fa-image"></i> | ' + productName;
                        if(link != null){
                            imageButton = '<div class="change-image"><img width="20" height="20" src="'+ includeImage(data) +'"> <span> '+ productName +' </span> </div>';
                        }
                        return imageButton;
                    }

                    return  buildImage(includeImage(data), data.name + " - " + data.itemCode);

                }, // omitted for brevity, see the source of this page
                formatSelection: function (data, contaniner) {
                    return data.productName || data.name;
                },
                initSelection: function (element, callback) {
                    // the input tag has a value attribute preloaded that points to a preselected item's id
                    // this function resolves that id attribute to an object that select2 can render
                    // using its formatResult renderer - that way the item name is shown preselected
                    //var id = $(element).val();
                    //if (id !== "" && !loaded) {
                    //    productService.get(id, { tracker: 'none' }).success(function (data2) {
                    //        loaded = true;
                    //        //$scope.myValue = data2;
                    //        //$scope.myValue = data2;
                    //        callback(data2);
                    //    });
                    //}
                },
                // we do not want to escape markup since we are displaying html in results
                escapeMarkup: function (m) {
                    return m;
                }
            }
        }
    };
});

PRD.directive('productUom', function (productService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select required class="form-control input-sm" ng-options="c.name as c.name for c in uomArr">' +
                '<option value="">-- UOM --</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.uomArr = [];
            productService.getUOM().then(function (data) {
                scope.uomArr = (data.data);
            });
        }
    };
});

PRD.directive('productOptions', function (productService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select class="form-control input-sm" ng-options="c.productBrandId as c.name for c in optionArr">' +
                '<option value="">-- Options --</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.optionArr = [];
            productService.getOption().then(function (data) {
                scope.optionArr = (data.data);
            });
        }
    };
});

PRD.directive('producttypesDropdown', function (productService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ng-options="c.productTypeId as c.productTypeName for c in productTypeArr">' +
                '<option value="">Loading Product Type</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            productService.queryProductTypes().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    // alert('Please add a Credit Term first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.productTypeArr = (data.data);
            });
        }
    };
});

PRD.directive('productBrands', function (productService) {

    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select class="form-control input-sm" ng-options="c.productBrandId as c.name for c in brandArr">' +
                '<option value="">Please Select</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.brandArr = [];
            productService.queryBrand().then(function (data) {
                scope.brandArr = (data.data);
            });
        }
    };
});

PRD.directive('productBarcode', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<img />',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.code, function (value) {
                var val = value || null;
                if (val) {
                    element.JsBarcode(attrs.code, { width: 3, height: 50 });
                }
            })
        }
    };
})

//PRD.directive('productsDatatable', ['productService', '$filter', '$timeout', '$compile', function (productService, $filter, $timeout, $compile) {
//    return {
//        restrict: 'EA',
//        link: function (scope, element, attrs) {

//            var oDatatable = element.dataTable({
//                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
//                "sPaginationType": "full_numbers",
//                "aoColumns": [
//                    { "mData": "productId" },
//                    { "mData": "productMediaList" },
//                    { "mData": "name" },
//                    { "mData": "itemCode" },
//                    { "mData": "barcode", "bVisible": false },
//                    { "mData": "description" },
//                    { "mData": "priceSelling" },
//                    { "mData": "status" },
//                    { "mData": "productId" }
//                ],
//                "aoColumnDefs": [
//                     {
//                         "aTargets": [8], // Column to target
//                         "mRender": function (data, type, full) {
//                             // 'full' is the row's data object, and 'data' is this column's data
//                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
//                             return '<a href="#/products/' + data + '" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><button type="button" class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete('+data+')">Delete</button> ';
//                         }
//                     },
//                     {
//                         "aTargets": [7], // Column to target
//                         "mRender": function (data, type, full) {
//                             return data == 1 ? 'Active' : 'Inactive';
//                         }
//                     },
//                     {
//                         "aTargets": [6], // Column to target
//                         "mRender": function (data, type, full) {
//                             return $filter('currency')(data);
//                         }
//                     },
//                     {
//                         "aTargets": [1], // Column to target
//                         "bSortable": false,
//                         "mRender": function (data, type, full) {
//                             if (data.length) {
//                                 var media = $.grep(data, function (d) {
//                                     if (d.isDefault == true)
//                                        return d;
//                                 });

//                                 if (media.length) {
//                                     return '<img src="' + media[0].filePath + '" width="39" />';
//                                 } else {
//                                     return '<img src="' + data[0].filePath + '" width="39" />';
//                                 }
//                             }
//                         }
//                     },
//                     {
//                         "aTargets": [0], // Column to target
//                         "bSortable": false,
//                         "mRender": function (data, type, full) {
//                             return '<input type="checkbox" style="width:30px" value="' + data + '" ng-checked="selectedProducts.indexOf(' + data + ') > 0" ng-click="toggleSelection(' + data + ')" />';
//                         }
//                     }
//                ],
//                "fnCreatedRow": function (nRow, aData, iDataIndex) {
//                    $compile(nRow)(scope);
//                    this.fnAdjustColumnSizing(true);
//                },
//                "fnInitComplete": function () {
//                    this.fnAdjustColumnSizing(true);
//                    element.css('width', '100%');
//                }
//            });

//            scope.delete = function (id) {
//                if (confirm($translate.instant('ALERT.DELETING'))) {
//                    scope.deleteProduct(id);
//                }
//            }

//            // watch for any changes to our data, rebuild the DataTable
//            scope.$watch(attrs.aaData, function (value) {
//                var val = value || null;
//                if (val) {
//                    oDatatable.fnClearTable();
//                    oDatatable.fnAddData(scope.$eval(attrs.aaData));
//                }
//            });
//        }
//    }
//}]);

PRD.directive('productsGrid', ['productService', '$filter', '$timeout', '$compile', '$debounce', '$translate', '$modal', function (productService, $filter, $timeout, $compile, $debounce, $translate, $modal) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    }

    function controller($scope, $attrs) {

        $scope.sortOptions = {
            fields: ["name"],
            directions: ["asc"]
        };

        $scope.imageClicked = function (imageLink, dataRow) {
            var dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'PRD/Products/ProductEdit/productImageReview.partial.html',
                    controller: function ($scope, $modalInstance, $location) {
                        console.log($modal);
                        // MODAL SCOPE
                        $scope.productInfo = {};

                        $scope.productInfo = dataRow;
                        $scope.productInfo.imageSrc = imageLink;
                        $scope.clickOnImage = function(prodcutId){
                            $location.path('/products/' + prodcutId);
                            $scope.cancel();
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    resolve: {
//                        creditTermsArr: function () {
//                            return $scope.creditTermArr;
//                        }
                    },
                    link: function (scope, element, attrs) {

                    }
                }
            );
        };

        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data.results;
            $scope.items = pagedData;
            $scope.totalServerItems = data.total;
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
                    productService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    productService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                productService.delete(id)
                        .success(function (data) {
                            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                        })
                        .error(function (error) {
                            //console.log(error);
                        })
            }
        }

        $scope.getDefaultImage = function (data) {
            if (data.length) {
                var defaultImage = _.filter(data, function (d) { return d.isDefault === true; });

                if (defaultImage.length) {
                    return defaultImage[0].filePath;
                } else {
                    return data[0].filePath;
                }
            } else {
                return "";
            }
        }
    }
}]);

PRD.directive('productForm', function () {
    return {
        restrict: 'EA',
        scope: { product: '=' },
        templateUrl: 'PRD/Products/ProductEdit/productEditForm.html?a=a',
        link: function (scope, element, attrs, product) {
        }
    }
});

// Batch based on ProductId dropdownlist with create new Batch
PRD.directive('productbatchDropdown', function (productService, stockAdjustService, $modal, $log, errorDisplay) {

    return {
        restrict: 'E',
        replace: true,
        template: '' +
            //'<select class="form-control input-sm" ng-options="c.productBatchId as c.name for c in batchArr">' +
        '<select ui-select2 class="ui-select2" footer="Add" footerfn="openProductBatchModal()">' +
                '<option value="">Select Batch</option>' +
                    '<option ng-repeat="a in batchArr" value="{{a.productBatchId}}">{{a.name}}</option>' +
                '</select>' +
         '',

        link: function (scope, element, attrs) {
            scope.batchArr = [];
            var productId = attrs.productId;

            productService.getBatchesByProductId(productId)
                .success(function (data) {
                    scope.batchArr = data;
                })
                .error(function (error) {
                    //errorDisplay.show(error);
                });

            scope.openProductBatchModal = function () {

                var dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    templateUrl: 'PRD/Batch/BatchEdit/batch.modal.html?a=a',
                    controller: function ($scope, $modalInstance) {
                        $scope.batch = {};
                        var product = {};
                        product.productBatch = {};

                        $scope.save = function () {
                            $scope.busy = true;
                            $scope.batch.productId = productId;

                            productService.addBatch($scope.batch)
                                .success(function (data) {

                                    // alert($translate.instant('ALERT.CREATED'));
                                    // get the object
                                    // call api and pass object
                                    // return result
                                    // populate the dropdown box with the new batch
                                    // Bind the product to the new Batch using Stock Adjustment

                                    // scope.batchArr.push(product);
                                    // console.log(dataA.productBatchId);
                                    // $("batch-" + attrs.id).append(new Option("New", attrs.id, defaultSelected, false));

                                    $('.batch-' + productId).append(new Option(data.name, data.productBatchId, false, false));

                                    // Refresh the list instead of adding to all ddls?

                                    $modalInstance.dismiss('cancel');

                                })
                                .error(function (err) {
                                    errorDisplay.show(err);
                                })
                                .finally(function () {
                                    $scope.busy = false;
                                });
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                });
                dialog.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
        }
    };
});

PRD.directive('mappingProductExcelDatatable', ['importExcelService', '$filter', '$timeout', '$compile', function (importExcelService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function ($scope, element, attrs) {
            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "bSearchable": true,
                "bSortable": false,
                "aoColumns": [
                    { "mData": "name" },
                    { "mData": "itemCode" },
                    { "mData": "priceCost" },
                    { "mData": "priceSelling" },
                    { "mData": "uom" },
                    { "mData": "description" },
                    { "mData": "no" }
                ]
                    ,
                "aoColumnDefs": [
                    {
                        "aTargets": [6], // Column to target
                        "bSearchable": false,
                        "bSortable": false,
                        "mRender": function (data, type, row) {
                            return '<input type="checkbox" name="post[]" value="' + data + '" ng-model="isCheck" class="isCheck" style="width:20px;">';
                        }
                    },
                    {
                        "aTargets": [0, 1, 2, 3, 4, 5],
                        "bSearchable": true,
                        "bSortable": false,
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $('.isCheck', nRow).change(function () {
                        var i = $scope.productsData.length;
                        while (i--) {
                            if ($scope.productsData[i].no == aData.no) {
                                if ($(this).is(':checked')) {
                                    $scope.productsData[i].isCheck = false;
                                }
                                else {
                                    $scope.productsData[i].isCheck = true;
                                }
                            }
                        }
                    });
                }
            });

            // watch for any changes to our data, rebuild the DataTable
            $scope.$watch(attrs.aaData, function (value) {
                var val = value || null;
                if (val) {
                    oDatatable.fnClearTable();
                    oDatatable.fnAddData($scope.$eval(attrs.aaData));
                }
            });
        }
    };
}]);
