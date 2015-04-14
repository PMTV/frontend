// DIRECTIVES

// Acquisition Order Datatable 
INV.directive('acquisitionsDatatable', function (acquisitionService) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = $(element).dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "inventoryAcquisitionId" },
                    { "mData": "supplier.companyName" },
                    { "mData": "inventoryAcquisitionId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [2], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/acquisitions/' + data + '" class="btn btn-success btn-sm">Edit</a> <a href="#/acquisitions" class="btn btn-danger btn-sm btn-delete">Delete</a>';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    $('.btn-delete', nRow).click(function () {
                        if (confirm($translate.instant('ALERT.DELETING')))
                            scope.deleteAcquisition(aData.inventoryAcquisitionId);
                    });
                    //if (aData[4] == "A") {
                    //    $('td:eq(4)', nRow).html('<b>A</b>');
                    //}
                }
            });

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


CRM.directive('acquisitionsGrid', ['acquisitionService', '$filter', '$timeout', '$compile', '$debounce', function (acquisitionService, $filter, $timeout, $compile, $debounce) {
    return {
        template: '<div>' +
            '<div style="height:60px; padding: 15px;"><div class="pull-right">Search <input type="text" ng-model="search" class="form-control search" style="width:300px; padding:3px;" /></div></div>' +
            '<div ng-grid="options" style=""></div>' +
            '<pagination ng-change="pageChanged(currentPage)" total-items="totalServerItems" items-per-page="15" ng-model="currentPage" max-size="10" class="pagination-sm" boundary-links="true" rotate="false" style="position:absolute; bottom: 5px; right: 20px;"></pagination>' +
            '<div style="position:absolute; bottom: 20px; left: 20px;">Showing {{15 * currentPage - 15 + 1}} to {{ 15 * currentPage < totalServerItems ? 15 * currentPage : totalServerItems }} of {{totalServerItems}} entries</div></div>',
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        transclude: false,
        controller: controller,
        link: function (scope, element, attrs) {
            var msg = (attrs.showEmptyMsg) ? attrs.showEmptyMsg : 'No data available in table';
            var template = "<p ng-hide='items.length' style='padding:10px;'>" + msg + "</p>";
            var tmpl = angular.element(template);
            $compile(tmpl)(scope);
            $timeout(function () {
                element.find('.ngViewport').append(tmpl);
            }, 0);
        }
    }

    function controller($scope, $attrs) {
        var firstLoaded = false;
        $scope.selectedItems = [];
        $scope.totalServerItems = 0;
        $scope.currentPage = 1;

        $scope.pageChanged = function (pageNo) {
            $scope.pagingOptions.currentPage = pageNo;
        };

        var customOptions = $scope.customOptions;

        var fixedOptions = {
            columnDefs: 'cols',
            data: 'items',
        };

        $scope.pagingOptions = {
            pageSizes: [15, 50, 100],
            pageSize: 15,
            currentPage: 1
        };
        // sort
        $scope.sortOptions = {
            fields: ["companyName"],
            directions: ["asc"]
        };
        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: false
        };

        var defaultOptions = {
            selectedItems: $scope.selectedItems,
            showSelectionCheckbox: true,
            enablePaging: false,
            showFooter: true,
            headerRowHeight: 40,
            rowHeight: 40,
            enableRowSelection: false,
            enableHighlighting: true,
            useExternalSorting: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            sortInfo: $scope.sortOptions
        };

        $scope.options = {};

        angular.extend($scope.options, defaultOptions);
        angular.extend($scope.options, customOptions);
        angular.extend($scope.options, fixedOptions);

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
                    acquisitionService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    acquisitionService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.$watch('pagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage || newVal.pageSize !== oldVal.pageSize)) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);
        $scope.$watch('filterOptions', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.$watch('sortOptions', function (newVal, oldVal) {
            if (newVal.fields[0] != oldVal.fields[0] || newVal.directions[0] != oldVal.directions[0]) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.$watch('search', $debounce(function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.options.filterOptions.filterText = newVal;
            }
        }, 300), true);

        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                acquisitionService.delete(id)
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

//INV.directive('warehousesectionsDropdown', function (acquisitionService) {
//    return {
//        restrict: 'E',
//        replace: true,
//        template: '' +
//            '<select ui-select2 class="ui-select2">' +
//                '<option value="">Please Select</option>' +
//                '<optgroup ng-repeat="w in warehousesArr" label="{{w.warehouseName}}">' +
//                    '<option ng-repeat="s in w.warehouseSectionsList" value="{{s.warehouseSectionId}}">{{s.warehouseSectionName}}</option>' +
//                '</optgroup>' +
//            '</select>',
//        link: function (scope, element, attrs) {
//            acquisitionService.queryWarehouses().then(function (data) {
//
//                if (data.data.length <= 0) {
//                    // TODO Redirect to adding Supplier or popup
//                    return false;
//                }
//                scope.warehousesArr = (data.data);
//            });
//        }
//    };
//});

INV.directive('warehousesDropdown', function (acquisitionService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2">' +
                '<option value="">Please Select</option>' +
                '<option ng-repeat="w in warehouseArr" value="{{w.warehouseId}}">{{w.warehouseName}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            acquisitionService.queryWarehouses().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                //element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.warehouseArr = (data.data);
            });
        }
    };
});

