PUR.directive('suppliersDropdown', function ($window, supplierService) {
    return {
        restrict: 'E',
        replace: true,
        scope: { selected: "=supplier" },
        template: '' +
            '<div ui-select2="select2Options" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
        controller: function ($scope, supplierService, $debounce) {
            $scope.initData = [];
            var loaded = false;

            supplierService.query("", 15, 1).success(function (data) {
                $scope.initData = data;
            });

            $scope.select2Options = {
                cacheDataSource: [],
                more: false,
                id: function (item) {
                    return item.supplierId; // use slug field for id
                },
                dataBinder: function (item) {
                    return item.supplierId; // use slug field for id
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
                        supplierService.query(query.term, 15, query.page, null, null, { tracker: 'none' }).success(function (data) {
                            self.more = (query.page * 15) < data.total; // whether or not there are more results available

                            if (self.cacheDataSource[key]) {
                                self.cacheDataSource[key].results = (self.cacheDataSource[key].results.concat(data));
                                self.cacheDataSource[key] = self.cacheDataSource[key];
                            } else {
                                self.cacheDataSource[key] = data;
                            }

                            query.callback({ results: data.results, more: self.more });
                        });
                    }
                },
                formatResult: function (data) {
                    return data.companyName;
                }, // omitted for brevity, see the source of this page
                formatSelection: function (data) {
                    return data.companyName;
                },
                initSelection: function (element, callback) {
                    //var customer = $scope.customer;
                    //// the input tag has a value attribute preloaded that points to a preselected item's id
                    //// this function resolves that id attribute to an object that select2 can render
                    //// using its formatResult renderer - that way the item name is shown preselected
                    var id = $(element).val();
                    if (id !== "" && !loaded) {
                        loaded = true;

                        supplierService.get(id, { tracker: 'none' })
                            .success(function (data) {
                                // If directive is passing selected object
                                if ($scope.selected){
                                    $scope.selected.supplier = data;
                                    console.log($scope.selected.supplier)
                                }


                                callback(data);
                        });
                    }
                },
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
            }
        }
    };
});


PUR.directive('productSuppliersDropdown2', function ($window, supplierService) {
    return {
        restrict: 'E',
        replace: true,
        template: '<select ui-select2 class="ui-select2">' + // ng-options="s.supplierId as s.companyName for s in suppliers"
                        '<option value="">Loading Suppliers</option>' +
                        '<option ng-repeat="s in suppliers" value="{{s}}">{{s.companyName}}</option>' +
                    '</select>',
        link: function (scope, element, attrs) {
            supplierService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.results.length <= 0) {
                    if (confirm('No Suppliers Found, proceed to Add a Supplier?')) {
                        $window.location = "#/suppliers/new";
                    } else {

                    }
                    return false;
                }
                scope.suppliers = (data.data.results);
            });
        }
    };
});

PUR.directive('suppliersDropdown3', function ($window, supplierService) {
    return {
        restrict: 'E',
        replace: true,
        template: '<select ui-select2 class="ui-select2" data-required="true">' + // ng-options="s.supplierId as s.companyName for s in suppliers"
						'<option value="">Loading Suppliers</option>' +
                        '<option ng-repeat="s in suppliers" value="{{s.supplierId}}">{{s.companyName}} [{{s.firstName}} {{s.lastName}}]</option>' +
					'</select>',
        link: function (scope, element, attrs) {

            supplierService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    if (confirm('No Suppliers Found, proceed to Add a Supplier?')) {
                        $window.location = "#/suppliers/new";
                    } else {

                    }
                    return false;
                }
                scope.suppliers = (data.data);
            });
        }
    };
});

PUR.directive('supplierDatatable', function (supplierService) {

    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            oDatatable = $(element).dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "companyName" },
                    { "mData": "firstName" },
                    { "mData": "lastName" },
                    { "mData": "supplierId" }
                ],
                "aoColumnDefs": [
                     {
                         "aTargets": [3], // Column to target
                         "mRender": function (data, type, full) {
                             // 'full' is the row's data object, and 'data' is this column's data
                             // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                             return '<a href="#/suppliers/' + data + '" class="btn btn-success btn-sm btn-primary btn-update">Edit</a> <button type="button" class="btn btn-success btn-danger btn-sm btn-delete">Delete</button> ';
                         }
                     }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Bold the grade for all 'A' grade browsers
                    //console.log($('.btn-delete' , nRow));
                    $('.btn-delete', nRow).click(function () {
                        //console.log(aData.supplierId);
                        if (confirm($translate.instant('ALERT.DELETING')))
                            scope.deleteSupplier(aData.supplierId);
                    });
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

PUR.directive('mappingSupplierExcelDatatable', ['importExcelService', '$filter', '$timeout', '$compile', function (importExcelService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function ($scope, element, attrs) {
            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "bSearchable": true,
                "bSortable": false,
                "aoColumns": [
                    { "mData": "companyName" },
                    { "mData": "firstName" },
                    { "mData": "lastName" },
                    { "mData": "code" },
                    { "mData": "email" },
                    { "mData": "website" },
                    { "mData": "contactOffice" },
                    { "mData": "remarks" },
                    { "mData": "no" }
                ]
                    ,
                "aoColumnDefs": [
                    {
                        "aTargets": [8], // Column to target
                        "bSearchable": false,
                        "bSortable": false,
                        "mRender": function (data, type, row) {
                            return '<input type="checkbox" name="post[]" value="' + data + '" ng-model="isCheck" class="isCheck" style="width:20px;">';
                        }
                    },
                    {
                        "aTargets": [0, 1, 2, 3, 4, 5, 6, 7], 
                        "bSearchable": true,
                        "bSortable": false,
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $('.isCheck', nRow).change(function () {
                        var i = $scope.suppliersData.length;
                        while (i--) {
                            if ($scope.suppliersData[i].no == aData.no) {
                                if ($(this).is(':checked')) {
                                    $scope.suppliersData[i].isCheck = false;
                                }
                                else {
                                    $scope.suppliersData[i].isCheck = true;
                                }
                            }
                        }
                    });
                }
            });

            // watch for any changes to our data, rebuild the DataTable
            $scope.$watch(attrs.aaData, function (value) {
                var val = value || null;
                if (val) {
                    oDatatable.fnClearTable();
                    oDatatable.fnAddData($scope.$eval(attrs.aaData));
                }
            });
        }
    };
}]);