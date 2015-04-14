PRD.controller('CategoryListCtrl', function ($scope, $log, $http, categoryService) {

    $scope.columnDefs = [
            { field: 'category', displayName: 'Image', cellTemplate: '<div class="text-center"><img src="" height="39" /></div>', sortable: false, headerClass: 'unsortable', width: '12%' },
            { field: 'name', displayName: 'Category Name', width: '20%' },
            { field: '', displayName: 'Product Count', width: '10%' },
            { field: 'code', displayName: 'Code', width: '10%' },
            { field: 'description', displayName: 'Description', width: '30%' },
            { field: 'status', displayName: 'Status', cellTemplate: '<div class="ngCellText">{{row.entity.status == 1 ? "Active" : "InActive"}}</div>', visible: false, width: 100 },
            { field: 'productCategoryId', displayName: 'Actions', cellTemplate: '<a href="#/productCategories/{{row.entity.productCategoryId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><button type="button" class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.productCategoryId)">Delete</button>', sortable: false, headerClass: 'unsortable', width: '*' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        onRowExpand: function (row) {
            return {
                template: "<div>hello</div>",
                templateUrl: "<div>hello</div>",
                scope: $scope
            }
        },
    };

    //$scope.deleteFn = function (categoryId) {
    //    categoryService.delete(categoryId)
    //        .success(function (data) {
    //            $scope.loadCategory();
    //        })
    //        .error(function (error) {
    //            errorDisplay.show(error);
    //            $log.error(error);
    //        })
    //};

    $scope.loadCategory = function () {
        categoryService.queryRoot().success(function (data) {
            $scope.categoryTableData = data.results;
        })
    }

    $scope.loadCategory();
});

PRD.controller('CategoryEditCtrl', function ($scope, $log, $http, $routeParams, $route, $location, $translate, categoryService, errorDisplay) {
    
    $scope.category = {};
    $scope.category.categoryList = [];
    $scope.category.userId = 1;
    $scope.item = {};

    $scope.subCategories = [];
    $scope.busy = true;

    var categoryId = null;
    var subCategory = {};
    var parentId = $routeParams.id;

    var _init = function () {
        categoryId = $routeParams.id;

        if (categoryId) {
            categoryService.get(categoryId)
                .success(function (data) {
                    angular.copy(data, $scope.category)

                    if (data.children.length > 0) {
                    $scope.parentId = data.children[0].parentId;
                    $scope.category.categoryList = data.children;
                    } else {
                        $scope.category.categoryList = [];
                    }
                    $scope.busy = false;
                });
        }
        else
        {
            $scope.category.categoryList = [];
            $scope.busy = false;
        }
    }

    $scope.removeSelected = function (index, item)
    {
        if (alert($translate.instant('ALERT.DELETING')))
        {
            categoryService.delete(item.productCategoryId)
                .success (function(data){
                    $scope.category.categoryList.splice(index, 1);
                    alert($translate.instant('ALERT.DELETED'));
                })
                .error (function (error){
                    errorDisplay.show(error);
                    $log.error(error);
                });
        }
    }

    $scope.saveSubCategory = function (index, item)
    {
        $scope.submitted = true;
        $scope.busy = true;
        item.parentId = parentId;
        item.userId = 1;

        if (item.productCategoryId)
        {
            categoryService.update(item)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                })
                .error (function (error){
                    errorDisplay.show(error);
                    $log.error(error);
                });
        }
        else
        {
            categoryService.add(item)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    // clear the form fields
                    $scope.item = {};
                    $scope.category.categoryList.push(data);
                    // subCategory.name = data.name;
                    // subCategory.orderId = data.orderId;
                    // subCategory.isPickRequired = data.isPickRequired;
                    // subCategory.description = data.description;
                    // $scope.category.categoryList[index] = subCategory;
                    // $location.url('categories/' + data.productCategoryId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.busy = false;

                });
        }
    }

    $scope.saveCategory = function () {
        $scope.submitted = true;
        $scope.busy = true;
        // TODO Remove properties
        $scope.category.userId = 1;
        $scope.category.userCreated = null;

        if (categoryId)
        {
            $scope.category.children = [];
            
            categoryService.update($scope.category)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                })
                .error (function (error){
                    errorDisplay.show(error);
                    $log.error(error);
                });
        }
        else
        {
            categoryService.add($scope.category)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('/productCategories/' + data.productCategoryId);
                    $scope.buttonText = "Update";
                    // parentId = data.productCategoryId;
                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });
        }
    };

    _init();
});