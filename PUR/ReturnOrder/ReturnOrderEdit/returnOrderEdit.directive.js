

PUR.directive('returnorderGrid', ['returnOrderService', '$filter', '$timeout', '$compile', '$debounce', '$translate', function (returnOrderService, $filter, $timeout, $compile, $debounce, $translate) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    }

    function controller($scope, $attrs) {

        $scope.sortOptions = {
            fields: ["returnOrderId"],
            directions: [sortDirection.ASC]
        };

        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data.results;
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

                //var data;
                if (searchText) {
                    var ft = searchText.toLowerCase();
                    returnOrderService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    });
                } else {
                    returnOrderService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    });
                }

                $timeout(function () { $(window).resize(); }, 0);
                var firstLoaded = true;
            }, 100);
        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                returnOrderService.delete(id)
                    .success(function (data) {
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    })
                    .error(function (error) {
                    });
            }
        }
    }
}
]);