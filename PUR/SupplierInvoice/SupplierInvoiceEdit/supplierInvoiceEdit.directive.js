

PUR.directive('onlyNumber', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            $(element).keyup(function () {
                var value  = parseInt(scope.$eval(attrs.ngModel) || null);
                ngModel.$setViewValue(value);
                ngModel.$render();
            });
        }
    };
});

PUR.directive('onlyNumberFloat', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            var doWaiting;
            $(element).keyup(function () {
                clearTimeout(doWaiting);
                doWaiting = setTimeout(function () {
                    var value  = parseFloat(scope.$eval(attrs.ngModel) || null);
                    ngModel.$setViewValue(value);
                    ngModel.$render();
                }, 1000);
            });
        }
    };
});

PUR.directive('notLessThan', function ($parse) {
    return {
        restrict: 'EA',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            scope.$watch(function () {
                if(ngModel == undefined) return false;
                var maxValue = parseInt(ngModel.$modelValue);
                var minValue = parseInt($parse(attrs.notLessThan)(scope));
                var returnValue = false;

                if(isNaN(minValue) != true && isNaN(maxValue) != true){
                    returnValue =  minValue <= maxValue;
                }
                if(isNaN(minValue) && isNaN(maxValue)){
                    returnValue =  true;
                }
                return returnValue;

            }, function (currentValue) {
                ngModel.$setValidity('notLessThan', currentValue);
                ngModel.$invalid = !currentValue;
            });
        }
    }
});


PUR.directive('maxNumberQuantity', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            var max = scope.$eval(attrs.ngModel);
            var checkFunc = function (newValue) {
                if(angular.isNumber(newValue) && newValue > 0 && newValue != null && newValue < max){
                    ngModel.$setViewValue(newValue);
                    ngModel.$render();
                }else{
                    ngModel.$setViewValue(max);
                    ngModel.$render();
                }
            };
            $(element).keyup(function () {
                var newValue = scope.$eval(attrs.ngModel);
                checkFunc(newValue);
            }).change(function () {
                var newValue = scope.$eval(attrs.ngModel);
                checkFunc(newValue);
            });
        }
    };
});


PUR.directive('supplierInvoiceGrid', ['supplierInvoiceService', '$filter', '$timeout', '$compile', '$debounce', '$translate', 'errorDisplay',
    function (supplierInvoiceService, $filter, $timeout, $compile, $debounce, $translate, errorDisplay) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    };

    function controller($scope, $attrs) {

        $scope.sortOptions = {
            fields: ["supplierInvoiceId"],
            directions: ["asc"]
        };

        $scope.pagingOptions = {
            pageSizes: [15, 50, 100],
            pageSize: 15,
            currentPage: 1
        };

        $scope.pageChanged = function (pageNo) {
            $scope.pagingOptions.currentPage = pageNo;
            console.log('current page now: ' + pageNo);
        };

        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data.results;
            var totalPage = data.totalRecord;
            $scope.items = pagedData;
            $scope.totalServerItems = totalPage;
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
                    supplierInvoiceService.getAllSupplierInvoiceList(page, pageSize, ft).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    supplierInvoiceService.getAllSupplierInvoiceList(page, pageSize, '').success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                supplierInvoiceService.deleteSupplierInvoice(id)
                    .success(function (data) {
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    })
                    .error(function (error) {
                        //console.log(error);
                        errorDisplay.show(error);
                    })
            }
        }
    }
}]);