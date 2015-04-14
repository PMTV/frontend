ACC.directive('apPaymentGrid', ['apPaymentService', '$filter', '$timeout', '$compile', '$debounce', '$translate', 'errorDisplay',
    function (apPaymentService, $filter, $timeout, $compile, $debounce, $translate, errorDisplay) {
        return {
            templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
            restrict: 'E',
            scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
            replace: true,
            controller: controller
        };
        function controller($scope, $attrs) {
            $scope.sortOptions = {
                fields: ["paymentId"],
                directions: ["asc"]
            };
            $scope.pagingOptions = {
                pageSizes: [15, 50, 100],
                pageSize: 15,
                currentPage: 1
            };
            $scope.pageChanged = function (pageNo) {
                $scope.pagingOptions.currentPage = pageNo;
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
                        apPaymentService.getListPayment(page, pageSize, ft).success(function (data) {
                            $scope.setPagingData(data, page, pageSize);
                        })
                    } else {
                        apPaymentService.getListPayment(page, pageSize, '').success(function (data) {
                            $scope.setPagingData(data, page, pageSize);
                        })
                    }
                    $timeout(function () { $(window).resize(); }, 0);
                    firstLoaded = true;
                }, 100);
            };
            $scope.delete = function (id) {
                if (confirm($translate.instant('ALERT.DELETING'))) {
                    apPaymentService.deletePaymentVoucher(id)
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