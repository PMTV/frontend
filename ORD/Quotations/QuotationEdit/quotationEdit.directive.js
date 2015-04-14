// DIRECTIVES
// Quotation Order Datatable 

ORD.directive('quotationdataTable', function ($window, quotationService) {
    return {
        restrict: 'E',
        replace: true,
        scope: { selected: "=quotation" },
        template: '' +
            '<div ui-select2="select2Options" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
        controller: function ($scope, quotationService, $debounce) {
            $scope.initData = [];
            var loaded = false;

            quotationService.query("", 15, 1).success(function (data) {
                $scope.initData = data;
            });

            $scope.select2Options = {
                cacheDataSource: [],
                loaded: true,
                more: false,
                id: function (item) {
                    return item.quotationId; // use slug field for id
                },
                dataBinder: function (item) {
                    return item.quotationId; // use slug field for id
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
                        quotationService.query(query.term, 15, query.page, null, null, { tracker: 'none' }).success(function (data) {
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
                        quotationService.get(id, { tracker: 'none' }).success(function (data2) {

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


ORD.directive('quotationsGrid', ['quotationService', '$filter', '$timeout', '$compile', '$debounce', '$translate', function (quotationService, $filter, $timeout, $compile, $debounce, $translate) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    }

    function controller($scope, $attrs) {

        $scope.sortOptions = {
            fields: ["quotationId"],
            directions: ["asc"]
        };

        $scope.setPagingData = function (data, page, pageSize) {
            var pagedData = data.results; //data.slice((page - 1) * pageSize, page * pageSize)
            $scope.items = pagedData;
            $scope.totalServerItems = data.total;
            //if (!$scope.$$phase) {
            //    $scope.$apply();
            //}
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
                    quotationService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    quotationService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                quotationService.delete(id)
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

ORD.directive('quotationdataTable2', function ($compile, quotationService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "salesOrderId" },
                    { "mData": "quotationNumber" },
                    { "mData": "customer.companyName" },
                    { "mData": "quotationId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [0], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/sales/' + data + '" tooltip="View Sales Order" tooltip-placement="right" ng-show="'+data+' != null"><i class="fa fa-file-text fa-large" /></a>';
                         }
                     },
                     {
                         "aTargets": [3], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/quotations/' + data + '" class="btn btn-success btn-sm">Edit</a> <a class="btn btn-danger btn-sm btn-delete" ng-click="delete(' + data + ')">Delete</a>';
                         }
                     }
                ],
                "fnCreatedRow": function (nRow, aData, iDataIndex) {
                    $compile(nRow)(scope);
                    this.fnAdjustColumnSizing(true);
                }
            });

            scope.delete = function (id) {
                if (confirm($translate.instant('ALERT.DELETING')))
                    scope.deleteQuotation(aData.quotationId);
            }

            // watch for any changes to our data, rebuild the DataTable
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

// Quotation Order Item Table 
ORD.directive('quotationitemsTable', function (quotationService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

// Quotation Order Item Table 
ORD.directive('ddlUOMList', function (quotationService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});