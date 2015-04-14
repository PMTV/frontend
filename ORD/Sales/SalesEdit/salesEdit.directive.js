// DIRECTIVES
ORD.directive('statusDropdown', function (salesService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
                '<select class="form-control input-sm" ng-options="c.value as c.name for c in statusArr">' +
                    '<option value="">Select Status</option>' +
                '</select>',
        link: function (scope, element, attrs) {
            scope.statusArr = [];

            scope.statusArr = salesService.getStatus();
        }
    };
});

ORD.directive('salesorderDropdown', function ($window, salesService, $interval) {
    return {
        restrict: 'E',
        replace: true,
        scope: { selected: "=sales" },
        template: '' +
            '<div ui-select2="select2Options" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
        controller: function ($scope, salesService, $debounce) {
            $scope.initData = [];
            var loaded = false;

            $scope.select2Options = {
                cacheDataSource: [],
                loaded: true,
                more: false,
                id: function (item) {
                    return item.salesOrderId; // use slug field for id
                },
                dataBinder: function (item) {
                    return item.salesOrderId; // use slug field for id
                },
                query: function (query) {
                    self = this;
                    var key = query.term;
                    var cachedData = self.cacheDataSource[key];
                    var initData = $scope.initData;

                    if ((cachedData || initData) && !self.more) {
                        if (cachedData) {
                            query.callback({ results: cachedData.results });
                        }
                        else {
                            self.cacheDataSource[key] = initData;
                            $scope.initData = null;

                            self.more = true;
                            query.callback({ results: initData.results, more: true });
                        }

                        return;
                    } else {
                        salesService.query(query.term, 15, query.page, null, null, { tracker: 'none' })
                            .success(function (data) {
                                self.more = (query.page * 15) < data.total; // whether or not there are more results available

                                if (self.cacheDataSource[key].results) {
                                    self.cacheDataSource[key].results = (self.cacheDataSource[key].results.concat(data.results));
                                    self.cacheDataSource[key] = self.cacheDataSource[key];
                                } else {
                                    self.cacheDataSource[key] = data;
                                }

                                query.callback({ results: data.results, more: self.more });
                            });
                    }
                },
                formatResult: function (data) {
                    return (data.companyName || '') + ' [' + data.firstName + ' ' + data.lastName + ']';
                }, // omitted for brevity, see the source of this page
                formatSelection: function (data) {
                    return (data.companyName || '') + ' [' + data.firstName + ' ' + data.lastName + ']';
                },
                initSelection: function (element, callback) {
                    // the input tag has a value attribute preloaded that points to a preselected item's id
                    // this function resolves that id attribute to an object that select2 can render
                    // using its formatResult renderer - that way the item name is shown preselected
                    var id = $(element).val();
                    if (id !== "" && !loaded) {
                        loaded = true;
                        salesService.get(id, { tracker: 'none' })
                            .success(function (data2) {
                                // If directive is passing selected object
                                if ($scope.selected)
                                    $scope.selected.sales = data2;

                                callback(data2);
                            });
                    }
                },
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
            }
        },
        link: function (scope, element, attrs) {
        }
    };
});

ORD.directive('salesorderByCustomerDropdown', function ($window, salesService, $interval, $translate) {
    return {
        restrict: 'E',
        replace: true,
        scope: { selected: "=sales", customerId: "=" },
        template: '' +
            '<div ui-select2="select2Options" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
        controller: function ($scope, salesService, $debounce) {
            $scope.initData = [];
            var loaded = false;

            $scope.select2Options = {
                cacheDataSource: [],
                loaded: true,
                more: false,
                id: function (item) {
                    return item.salesOrderId; // use slug field for id
                },
                dataBinder: function (item) {
                    return item.salesOrderId; // use slug field for id
                },
                query: function (query) {
                    if (!$scope.customerId) {
                        alert($translate.instant('ALERT.PLEASE_SELECT_TYPE', { type: 'Customer' }));
                        return;
                    }

                    self = this;
                    var key = query.term;
                    var cachedData = self.cacheDataSource[key];
                    var initData = $scope.initData;

                    if ((cachedData || initData) && !self.more && false) {
                        if (cachedData) {
                            query.callback({ results: cachedData.results });
                        }
                        else {
                            self.cacheDataSource[key] = initData;
                            $scope.initData = null;

                            self.more = true;
                            query.callback({ results: initData.results, more: true });
                        }

                        return;
                    } else {
                        salesService.queryByCustomerId($scope.customerId, query.term, 15, query.page, null, null, { tracker: 'none' })
                            .success(function (data) {
                                self.more = (query.page * 15) < data.total; // whether or not there are more results available

                                if (self.cacheDataSource[key]) {
                                    self.cacheDataSource[key].results = (self.cacheDataSource[key].results.concat(data.results));
                                    self.cacheDataSource[key] = self.cacheDataSource[key];
                                } else {
                                    self.cacheDataSource[key] = data;
                                }
                                query.callback({ results: data.results, more: self.more });
                            });
                    }
                },
                formatResult: function (data) {
                    return (data.salesOrderNumber);
                }, // omitted for brevity, see the source of this page
                formatSelection: function (data) {
                    return (data.salesOrderNumber);
                },
                initSelection: function (element, callback) {
                    // the input tag has a value attribute preloaded that points to a preselected item's id
                    // this function resolves that id attribute to an object that select2 can render
                    // using its formatResult renderer - that way the item name is shown preselected
                    var id = $(element).val();
                    if (id !== "" && !loaded) {
                        loaded = true;
                        salesService.get(id, { tracker: 'none' })
                            .success(function (data2) {
                                // If directive is passing selected object
                                if ($scope.selected)
                                    $scope.selected.sales = data2;

                                callback(data2);
                            });
                    }
                },
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
            }
        },
        link: function (scope, element, attrs) {
            scope.$watch('customerId', function (val) {
                console.log(val);
                element.select2('val', "");
            })
        }
    };
});

ORD.directive('salesorderDropdown2', function (salesService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
                '<select ui-select2 class="ui-select2">' +
                    '<option value="">Select Sales Order</option>' +
                    '<option ng-repeat="c in salesOrdersList" value="{{c}}">{{c.salesOrderNumber}}</option>' +
                '</select>',
        link: function (scope, element, attrs) {
            scope.salesOrdersList = [];
            scope.salesOrderDetails = [];
            salesService.query().then(function (data) {
                angular.copy(data.data.results, scope.salesOrdersList);
                // angular.forEach(data.data, function(value, key){
                //     scope.salesOrdersList.push(value.salesOrderDetailsList[0]);
                //     // angular.copy(value.salesOrderDetailsList, scope.salesOrdersList);
                //     // console.log(scope.salesOrdersList);
                // });
                // console.log(scope.salesOrdersList);

            });

        }
    };
});

// DIRECTIVES
// Quotation Order Datatable 
ORD.directive('salesGrid', ['salesService', '$filter', '$timeout', '$compile', '$debounce', '$translate', function (salesService, $filter, $timeout, $compile, $debounce, $translate) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    }

    function controller($scope, $attrs) {

        $scope.sortOptions = {
            fields: ["salesOrderId"],
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
                    salesService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    salesService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                salesService.delete(id)
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


// Sales Order Datatable 
ORD.directive('salesdataTable', function ($compile, $translate, salesService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "quotationId" },
                    { "mData": "salesOrderNumber" },
                    { "mData": "customer.companyName" },
                    { "mData": "salesOrderId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [0], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/quotations/' + data + '" tooltip="View Quotations" tooltip-placement="right" ng-show="' + data + ' != null"><i class="fa fa-file-text fa-large" /></a>';
                         }
                     },
                     {
                         "aTargets": [3], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/sales/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/sales" class="btn btn-danger btn-sm btn-delete" ng-click="delete(' + data + ')">Delete</a>';
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
                    scope.deleteSales(id);
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

// Sales Order Item Table 
ORD.directive('salesitemsTable', function (salesService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

// Sales Order Item Table 
ORD.directive('ddlUOMList', function (salesService) {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

//display Exceed Credit Limit Sales Order Table 
ORD.directive('exceedSalesdataTable', function ($compile, $filter, salesService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                //"sPaginationType": "full_numbers",
                "bPaginate": false,
                "bInfo": false,
                "aoColumns": [
                    { "mData": "salesOrderNumber" },
                    { "mData": "customer.companyName" },
                    { "mData": "orderPaymentStatus" },
                    { "mData": "paidDate" },
                    { "mData": "salesOrderId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [3], // Column to target
                         "mRender": function (data, type, full) {
                             return $filter('date')(data, "dd/MM/yyyy");
                         }
                     },
                     {
                         "aTargets": [4], // Column to target
                         "mRender": function (data, type, full) {
                             return '<a href="#/sales/' + data + '" class="btn btn-success btn-sm">Edit</a>';
                         }
                     }
                ],
                "fnCreatedRow": function (nRow, aData, iDataIndex) {
                    $compile(nRow)(scope);
                    this.fnAdjustColumnSizing(true);
                }
            });

            scope.delete = function (id) {
                bootstrapConfirm('Do you want to proceed to Delete?', function () {
                    scope.deleteSales(aData.salesOrderId);
                });
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