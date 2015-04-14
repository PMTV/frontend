//PRD.directive('categoriesDatatable', ['categoryService', function (categoryService) {
//    return {
//        restrict: 'EA',
//        link: function (scope, element, attrs) {

//            oDatatable = $(element).dataTable({
//                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
//                "sPaginationType": "full_numbers",
//                "aoColumns": [
//                    { "mData": "name" },
//                    { "mData": "description" },
//                    { "mData": "description" },
//                    //{ "mData": "children[].name" },
//                    { "mData": "productCategoryId" }
//                ],
//                "aoColumnDefs": [
//                     {
//                         "aTargets": [3], // Column to target
//                         "mRender": function (data, type, full) {

//                             return '<a href="#/productCategories/' + data + '" class="btn btn-success btn-sm btn-success btn-update">Edit</a> <button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
//                         }
//                     },
//                     //{
//                     //    "aTargets": [3], // Column to target
//                     //    "mRender": function (data, type, full) {
//                     //        var result = "";
//                     //        data.forEach(function (entry) {
//                     //            result += entry + "<br />";
//                     //        });
//                     //        return result;
//                     //    }
//                     //}
//                ],
//                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
//                    // Bold the grade for all 'A' grade browsers
//                    //console.log($('.btn-delete' , nRow));
//                    $('.btn-delete', nRow).click(function () {
//                        //console.log(aData.customerId);
//                        if (confirm($translate.instant('ALERT.DELETING'))) {
//                            scope.deleteFn(aData.productCategoryId);
//                        }
//                    });
//                }
//            });

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

PRD.directive('categoriesGrid', ['categoryService', '$filter', '$timeout', '$compile', '$debounce', '$translate', function (categoryService, $filter, $timeout, $compile, $debounce, $translate) {
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

        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data;
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
                    categoryService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data.results, page, pageSize);
                    })
                } else {
                    categoryService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data.results, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);

        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                categoryService.delete(id)
                        .success(function (data) {
                            alert($translate.instant('ALERT.DELETED'));
                            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                        })
                        .error(function (error) {
                            //console.log(error);
                        })
            }
        }
    }
}]);

PRD.directive('categoriesTree', ['categoryService', '$compile', '$translate', function (categoryService, $compile, $translate) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
            var data;
            $(element).nestable({
                maxDepth: 3
            });

            $(element).on('change', function () {
                /* on change event */
                data = $(this).nestable('serialize');

                _buildResult();
            });

            var _buildResult = function () {
                var parentId = null;

                // build category to save
                var searchRecursive = function (data, root) {
                    angular.forEach(data, function (v) {
                        if (v.id) {
                            v.productCategoryId = v.id;
                            v.name = "Category";
                            //scope.categoryList.push(v.id);
                            if (parentId && !root)
                                v.parentId = parentId;
                        }

                        if (v.children) {
                            if (v.children.length > 0)
                                parentId = v.id;
                        } else {
                        }

                        searchRecursive(v.children, false);
                    });
                }

                searchRecursive(data, true);
            }

            scope.saveCategoryList = function () {
                scope.busy = true;

                data = $(element).nestable('serialize');
                _buildResult();

                categoryService.updateMany(data).success(function (result) {
                    scope.busy = false;
                    alert($translate.instant('ALERT.UPDATED'));
                }).finally(function () {
                    scope.busy = false;
                });
            }
        }
    }
}]);

PRD.directive('productCategoriesDropdown', function ($window, categoryService) {
    return {
        restrict: 'E',
        replace: true,
        template: '<select ui-select2 class="ui-select2">' + // ng-options="s.supplierId as s.companyName for s in suppliers"
                        '<option value="">Please Select</option>' +
                        '<option ng-repeat="s in categories" value="{{s}}">{{s.name}}</option>' +
                    '</select>',
        link: function (scope, element, attrs) {
            categoryService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                //element[0].options[0].text = 'Please Select';

                if (data.data.results.length <= 0) {
                    if (confirm('No Categories Found, proceed to Add a Category?')) {
                        $window.location = "#/productCategories/new";
                    } else {

                    }
                    return false;
                }
                scope.categories = (data.data.results);
            });
        }
    };
});