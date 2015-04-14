Dashboard.directive('exceedCreditLimitSalesorderGrid', ['salesService', '$filter', '$timeout', '$compile', function (salesService, $filter, $timeout, $compile) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    }

    function controller($scope, $attrs) {
        $scope.sortOptions = {
            fields: ["salesOrderNumber"],
            directions: ["asc"]
        };

        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data.results; //data.slice((page - 1) * pageSize, page * pageSize)
            $scope.items = pagedData;
            $scope.totalServerItems = data.totalRecord;
        };

        $scope.getPagedDataAsync = function (pageSize, page, searchText) {

            setTimeout(function () {
                var sb = [];
                for (var i = 0; i < $scope.sortOptions.fields.length; i++) {
                    sb.push($scope.sortOptions.fields[i]);
                    sb.push($scope.sortOptions.directions[i]);
                }


                salesService.getExceedCreditLimitSalesOrders(pageSize, page).success(function (data) {
                    $scope.setPagingData(data, page, pageSize);
                });


                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        //$scope.getPagedDataAsync(20, 1) ;
    }
}
]);

