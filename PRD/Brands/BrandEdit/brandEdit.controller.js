PRD.controller('BrandListCtrl', function ($http, $scope, $routeParams, $translate, productService) {

    var brandId = $routeParams.id;

    $scope.brandsTableData = [];

    $scope.loadBrand = function () {
        productService.queryBrand()
            .success(function (data) {
                $scope.brandsTableData = data;
            })
            .error(function (data) {
            });
    }

    $scope.deleteBrand = function (brandId) {
        productService.deleteBrand(brandId)
            .success(function (data) {
                $scope.loadBrand();
                alert($translate.instant('ALERT.DELETED'));
            })
            .error(function (error) {
                errorDisplay.show(error);
                $log.error(error);
            });
    }

    $scope.loadBrand();
});

PRD.controller('BrandEditCtrl', function ($scope, $log, $http, $routeParams, $route, $location, $translate, productService, errorDisplay) {

    $scope.brand = {};
    $scope.item = {};
    $scope.busy = true;

    var brandId = null;

    var _init = function () {
        brandId = $routeParams.id;

        if (brandId) {
            productService.getBrand(brandId)
                .success(function (data) {
                    $scope.brand = data;

                    $scope.busy = false;
                });
        }
        else {
            $scope.busy = false;
        }
    }

    $scope.saveBrand = function () {
        $scope.submitted = true;
        $scope.busy = true;
        // TODO Remove properties
        $scope.brand.userCreated = null;

        if (brandId) {
            productService.updateBrand($scope.brand, brandId)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                    $location.url('/productBrands');
                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });
        }
        else {
            productService.addBrand($scope.brand)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('/productBrands/' + data.productBrandId);
                    $scope.buttonText = "Update";
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