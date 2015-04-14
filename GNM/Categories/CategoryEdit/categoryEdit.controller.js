GNM.controller('CategoryListCtrl', function ($scope, $log, $http, categoryService) {

    $scope.categoryTableData = null;

    $scope.loadCategory = function () {
        categoryService.query().success(function (data) {
            $scope.categoryTableData = data.results;
        })
    }

    $scope.deleteFn = function (categoryId) {
        categoryService.delete(categoryId)
            .success(function (data) {
                $scope.loadCategory();
            })
            .error(function (error) {
                errorDisplay.show(error);
                $log.error(error);
            })
    };

    $scope.loadCategory();

});

GNM.controller('CategoryEditCtrl', function ($scope, $log, $http, $routeParams, $route, $location, categoryService, errorDisplay) {
    
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

    $scope.removeSelected = function (index, item) {
        bootstrapConfirm('Delete Category?', function() {
            categoryService.delete(item.productCategoryId)
                .success(function(data) {
                    $scope.category.categoryList.splice(index, 1);
                    alert("Delete Success");
                })
                .error(function(error) {
                    errorDisplay.show(error);
                    $log.error(error);
                });
        });
    }

    $scope.saveSubCategory = function (index, item)
    {
        $scope.submitted = true;
        $scope.busy = true;
        item.parentId = parentId;
        //item.userId = 1;
        item.userCreated = null;

        if (item.productCategoryId)
        {
            categoryService.update(item)
                .success (function (data) {
                    alert("Successfully Updated");
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
                    alert('Successfully Added');
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
                .success (function (data) {
                    alert("Update success");
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
                    alert('Successfully Added');
                    $location.url('categories/' + data.productCategoryId);
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