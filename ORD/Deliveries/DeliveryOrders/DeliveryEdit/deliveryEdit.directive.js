
// DIRECTIVES
// Sales Order Datatable 


ORD.directive('deliveriesdataTable', function ($window, deliveryService) {
    return {
        restrict: 'E',
        replace: true,
        scope: { selected: "=delivery" },
        template: '' +
            '<div ui-select2="select2Options" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
        controller: function ($scope, deliveryService, $debounce) {
            $scope.initData = [];
            var loaded = false;

            deliveryService.query("", 15, 1).success(function (data) {
                $scope.initData = data;
            });

            $scope.select2Options = {
                cacheDataSource: [],
                loaded: true,
                more: false,
                id: function (item) {
                    return item.deliveryOrderId; // use slug field for id
                },
                dataBinder: function (item) {
                    return item.deliveryOrderId; // use slug field for id
                },
                query: function (query) {
                    self = this;
                    var key = query.term;
                    var cachedData = self.cacheDataSource[key];
                    var initData = $scope.initData;

                    if ((cachedData || initData) && !self.more) {
                        if (cachedData) {
                            query.callback({ results: cachedData });
                        }
                        else {
                            self.cacheDataSource[key] = initData;
                            $scope.initData = null;

                            self.more = true;
                            query.callback({ results: initData, more: true });
                        }

                        return;
                    } else {
                        deliveryService.query(query.term, 15, query.page, null, null, { tracker: 'none' }).success(function (data) {
                            self.more = (query.page * 15) < data.total; // whether or not there are more results available

                            if (self.cacheDataSource[key]) {
                                self.cacheDataSource[key].results = (self.cacheDataSource[key].results.concat(data));
                                self.cacheDataSource[key] = self.cacheDataSource[key];
                            } else {
                                self.cacheDataSource[key] = data;
                            }

                            query.callback({ results: data, more: self.more });
                        });
                    }
                },
                formatResult: function (data) {
                    return data;
                }, // omitted for brevity, see the source of this page
                formatSelection: function (data) {
                    return data;
                },
                initSelection: function (element, callback) {
                    // the input tag has a value attribute preloaded that points to a preselected item's id
                    // this function resolves that id attribute to an object that select2 can render
                    // using its formatResult renderer - that way the item name is shown preselected
                    var id = $(element).val();
                    if (id !== "" && !loaded) {
                        loaded = true;
                        deliveryService.get(id, { tracker: 'none' }).success(function (data2) {

                            // If directive is passing selected object
                            if ($scope.selected)
                                $scope.selected.customer = data2;

                            callback(data2);
                        });
                    }
                },
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
            }
        }
    };
});


ORD.directive('deliveriesGrid', ['deliveryService', '$filter', '$timeout', '$compile', '$debounce', '$translate', function (deliveryService, $filter, $timeout, $compile, $debounce, $translate) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    }

    function controller($scope, $attrs) {

        $scope.sortOptions = {
            fields: ["deliveryOrderId"],
            directions: ["asc"]
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
                    deliveryService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    deliveryService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                deliveryService.delete(id)
                        .success(function (data) {
                            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                        })
                        .error(function (error) {
                            //console.log(error);
                        })
            }
        }
    }
}
]);

ORD.directive('deliveriesdataTable2', function (deliveryService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

                oDatatable = $(element).dataTable({
                    "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                    "sPaginationType": "full_numbers",
                    "aoColumns": [
                        { "mData": "deliveryOrderId" },
                        { "mData": "remarks" },
                        { "mData": "deliveryOrderId" }
                    ],
                    "aoColumnDefs": [
                         {
                             "aTargets": [2], // Column to target
                             "mRender": function (data, type, full) {
                                 // 'full' is the row's data object, and 'data' is this column's data
                                 // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                                 return '<a href="#/deliveries/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/sales" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                             }
                         }
                    ],
                    "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                        // Bold the grade for all 'A' grade browsers
                        $('.btn-delete', nRow).click(function () {
                            if (confirm('Delete Delivery Order?'))
                                scope.deleteDelivery(aData.deliveryOrderId);
                        });
                        //if (aData[4] == "A") {
                        //    $('td:eq(4)', nRow).html('<b>A</b>');
                        //}
                    }
                });
                scope.$watch(attrs.aaData, function (value) {
                    var val = value || null;
                    if (val) {
                        oDatatable.fnClearTable();
                        oDatatable.fnAddData(scope.$eval(attrs.aaData));
                    }
                });
        }
    }
});

// Sales Order Item Table 
ORD.directive('deliveryitemsTable', function (deliveryService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

// Sales Order Item Table 
ORD.directive('ddlUOMList', function (deliveryService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});
