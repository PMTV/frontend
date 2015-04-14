CRM.directive('customersDropdown', function ($window, customerService) {
    return {
        restrict: 'E',
        replace: true,
        scope: { selected: "=customer" },
        template: '' +
            '<div ui-select2="select2Options" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
        controller: function ($scope, customerService, $debounce) {
            $scope.initData = [];
            var loaded = false;

            customerService.query("", 15, 1).success(function (data) {
                $scope.initData = data;
            });

            $scope.select2Options = {
                cacheDataSource: [],
                loaded: true,
                more: false,
                id: function (item) {
                    return item.customerId; // use slug field for id
                },
                dataBinder: function (item) {
                    return item.customerId; // use slug field for id
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
                        customerService.query(query.term, 15, query.page, null, null, { tracker: 'none' })
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
                        customerService.get(id, { tracker: 'none' })
                            .success(function (data2) {
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

CRM.directive('customersDropdown2', function ($window, customerService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2="select2OptionsCustomer" class="ui-select2">' + // ng-options="s.supplierId as s.companyName for s in suppliers"
                '<option value="">Please Select</option>' +
                '<option ng-repeat="s in customers" value="{{s.customerId}}">{{s.companyName}} {{s.firstName}} {{s.lastName}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            customerService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"

                if (data.data.results.length <= 0) {
                    if (confirm('No Customers Found, proceed to Add a Customer?')) {
                        $window.location = "#/customers/new";
                    }
                    return false;
                }
                scope.customers = (data.data.results);
            });
        },
        controller: function ($scope, customerService, $debounce) {
            $scope.select2OptionsCustomer = {
                minimumInputLength: 3,
                query: function (query) {
                    customerService.query(query.term, 15, query.page).success(function (data) {
                        var more = (query.page * 15) < data.total; // whether or not there are more results available
                        query.callback({ results: data.results, more: more });
                    });
                },
                formatResult: function (data) {
                    return data.companyName;
                }, // omitted for brevity, see the source of this page
                formatSelection: function (data) {
                    return data.companyName;
                },
                initSelection: function (element, callback) {
                    //console.log(element);
                    //console.log("das");
                    //customerService.query().success(function (data) {
                    //    callback({ results: data.results });
                    //});
                },
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
            }
        }
    };
});

CRM.directive('customersGrid', ['customerService', '$filter', '$timeout', '$compile', '$debounce', '$translate', function (customerService, $filter, $timeout, $compile, $debounce, $translate) {
    return {
        templateUrl: "assets/lib/base/angular.plugins/ng-grid/ng-grid.html",
        restrict: 'E',
        scope: { items: '=', cols: '=', selectedItems: '=', customOptions: '=' },
        replace: true,
        controller: controller
    };

    function controller($scope, $attrs, $modal) {

        $scope.sortOptions = {
            fields: ["companyName"],
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
                    customerService.query(ft, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                } else {
                    customerService.query(null, pageSize, page, sb[0], sb[1]).success(function (data) {
                        $scope.setPagingData(data, page, pageSize);
                    })
                }

                $timeout(function () { $(window).resize(); }, 0);
                firstLoaded = true;
            }, 100);
        };

        $scope.delete = function (id) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                customerService.delete(id)
                    .success(function (data) {
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                    })
                    .error(function (error) {
                        //console.log(error);
                    })
            }
        };

    //get customers location and show them on map
        //show button view map on grid or not
        $scope.showViewMap = true;
        $scope.locationList = [];

        $scope.getCustomerLocation = function (data) {
            var checExist = true;
            if($scope.locationList.length > 0){
                angular.forEach($scope.locationList, function (key, index) {
                    if(data.customerId == key.customerId){
                        key.isShowOnMap = !key.isShowOnMap;
                        checExist = false;
                    }
                });
            }
            if(checExist){
                data.isShowOnMap = true;
                $scope.locationList.push(data);
            }
        };

        $scope.openMap = function () {
            var getListCustomer = function () {
                var temp = [];
                angular.forEach($scope.locationList, function (key, data) {
                    if(key.isShowOnMap){
                        temp.push(key);
                    }
                });
                return temp;
            };

            var dialog = $modal.open({
                backdrop: true,
                keyboard: true,
                windowClass: 'modal-preview customMap',
                templateUrl: 'CRM/Customers/CustomerEdit/Modal/customerShowMap.modal.html?a=aa',
                controller: function ($scope, $modalInstance) {

                    $scope.locationData = getListCustomer();
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
        };
    }
}
]);

CRM.directive('customerShowMap', function ($http) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            mwidth: '=',
            mheight: '=',
            location: '='
        },
        template: ' <div style="width: 100px; height: 100px;" id="map"></div>',
        link: function (scope, element, attrs, ngModel) {
            //set width and height for map
            $('div#map').attr('style','width:100%;' + ' height: ' +($(window).height()*0.7)+'px;');
            $(window).on('scroll load resize', function () {
                $('div#map').attr('style','width:100%;' + ' height: ' +($(window).height()*0.7)+'px;');
            });
            //get list postal code or address of customers
            var locationListCode = [];
            var invalidListCustomer = [];
            angular.forEach(scope.location, function (key, value) {
                if(key.addressList.length>0){
                    angular.forEach(key.addressList, function (childKey, childValue) {
                        if(childKey.default){
                            var addValidNode = (childKey.postalCode != null) ? {id: childKey.postalCode, value: key.companyName, address: childKey.fullAddress} : {id: childKey.fullAddress, value: key.companyName, address: childKey.fullAddress};
                            locationListCode.push(addValidNode);
                        }
                    });
                }else{
                    invalidListCustomer.push(key);
                }
            });

            var initMap = function () {

                function convert2Location(listData) {
                    var resultList = [];
                    var countSuccess = 0;
                    var maxLength = listData.length;
                    var geocoder = new google.maps.Geocoder();
                    angular.forEach(listData, function (key, index) {
                        var zipCode = key.id;
                        console.log('zip code' + zipCode);
                        geocoder.geocode({ 'address': zipCode}, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                //Got result
                                var coordinate = results[0].geometry.location;
                                console.log(coordinate);
                                resultList.push({ d: coordinate.lat(), e: coordinate.lng(), name: key.value, address: key.address }); 
                                countSuccess++;
                            } else {
                                console.warn("Geocode was not successful for the following reason: " + status);
                            }
                            
                        });
                    });

                    var interval = setInterval(function () {
                        if (countSuccess == maxLength) {
                            //console.log('enterd');
                            clearInterval(interval);
                            var map = new L.Map('map', {center: new L.LatLng(1.3428509412711536, 103.87661237900397), zoom: 12});
                            var ggl = new L.Google('ROADMAP', null, resultList);
                            map.addLayer(ggl);

                        }
                    }, 1000); 
                }

                if(locationListCode.length > 0){
                    convert2Location(locationListCode);
                }else{
                    alert('List of customers selected were null!');
                }
            };

            setTimeout(function () {
                initMap();
            }, 1000);
        }
    };
});

CRM.directive('customerForm', function () {
    return {
        restrict: 'EA',
        scope: { customer: '=' },
        templateUrl: 'CRM/Customers/CustomerEdit/customerEditForm.html?a=a',
        link: function (scope, element, attrs, customer) {
        }
    }
});

CRM.directive('buttonCustomerPreview', function (customerService, $modal, $translate) {
    return {
        template: '<div ng-click="openCustomerModal(customerId)" ng-transclude></div>',
        restrict: 'EA',
        replace: true,
        transclude: true,
        link: function (scope, element, attrs) {
            scope.openCustomerModal = function (customerId) {
                var customerId = scope.$eval(attrs.customerId);
                var customer = scope.$eval(attrs.customer);
                scope.customer = customer || {};
                var dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'CRM/Customers/CustomerEdit/Modal/customerQuickPreview.modal.html?a=aa',
                    controller: function ($scope, $modalInstance) {
                        $scope.form = {};
                        $scope.action = customerId ? "Preview" : "Add";
                        $scope.customer = customer || {};
                        $scope.customer.contactList = [];
                        $scope.customer.addressList = [];

                        // Loading Customer
                        if (customerId)
                            customerService.get(customerId).success(function (data) {
                                $scope.customer = data;
                            });

                        // Saving Customer
                        $scope.saveCustomer = function (customer) {
                            $scope.submitted = true;

                            if (!$scope.form.customerForm.$valid) {
                                alert($translate.instant('ALERT.FORM_ERROR'));
                                return false;
                            }

                            $scope.busy = true;

                            if (customerId) {
                                customerService.update(customer)
                                    .success(function (data) {
                                        alert($translate.instant('ALERT.UPDATED'));
                                        $modalInstance.dismiss('cancel');
                                    })
                                    .error(function (err) {
                                        errorDisplay.show(err);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                });
                            }
                            else {
                                customerService.add(customer)
                                    .success(function (data) {
                                        alert($translate.instant('ALERT.CREATED'));
                                        $modalInstance.dismiss('cancel');
                                    })
                                    .error(function (err) {
                                        errorDisplay.show(err);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                });
                            }
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                })

                if (customerId) {
                    // if customer object found, return
                    if (customer) return;

                } else {

                }


            }
        },
        controller: function ($scope) {

        }
    }
});

CRM.directive('salespipelinesDropdown', function (customerService) {

    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2">' +
                '<option value="">Please Select</option>' +
                '<option ng-repeat="c in salespipelineArr" value="{{c.salesPipeLineId}}">{{c.salesPipeLineName}}</option>' +
            '</select>',
        // scope: {
        //     options: '=',
        //     data: '@'
        // },
        link: function (scope) {
            scope.salespipelineArr = [];
            customerService.getSalespipeline().then(function (data) {
                scope.salespipelineArr = (data.data);
                //console.log(scope.customerArr);
            });
        }
    }
});

CRM.directive('customergroupsDropdown', function ($location, customerGroupService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addCustomerGroup()">' +
                '<option value="">Loading Customer Group</option>' +
                '<option ng-repeat="c in customerGroups" value="{{c.customerGroupId}}">{{c.name}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.customerGroups = [];
            customerGroupService.query().then(function (data) {
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    return false;
                }

                scope.customerGroups = (data.data);
            });
            scope.addCustomerGroup = function () {
                $location.path('/customerGroups');
            }
        }
    }
});

CRM.directive('customerfieldDropdown', function ($modal, $log, customerService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" >' + // footer="Add" footerfn="addReturnReason()">' +
                '<option value="">Loading Customer</option>' +
                '<option ng-repeat="c in customerFieldArr" value="{{c}}">{{c}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.customerFieldArr = [];

            customerService.getCustomerColumn().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';
                console.log(data);
                scope.customerFieldArr = (data.data);
            });
        }
    };
});

CRM.directive('mappingExcelDatatable', ['importExcelService', '$filter', '$timeout', '$compile', function (importExcelService, $filter, $timeout, $compile) {
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
                    { "mData": "middleName" },
                    { "mData": "code" },
                    { "mData": "email" },
                    { "mData": "countryCity" },
                    { "mData": "countryCity" },
                    { "mData": "contactMobile" },
                    { "mData": "description" },
                    { "mData": "no" }
                ]
                    ,
                "aoColumnDefs": [
                    {
                        "aTargets": [10], // Column to target
                        "bSearchable": false,
                        "bSortable": false,
                        "mRender": function (data, type, row) {
                            return '<input type="checkbox" name="post[]" value="' + data + '" ng-model="isCheck" class="isCheck" style="width:20px;">';
                        }
                    },
                    {
                        "aTargets": [0,1,2,3,4,5,6,7,8,9], // Column to target
                        "bSearchable": true,
                        "bSortable": false,
                    }
                ],
                "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    $('.isCheck', nRow).change(function () {
                        var i = $scope.customersData.length;
                        while (i--) {
                            if ($scope.customersData[i].no == aData.no) {
                                if ($(this).is(':checked')) {
                                    $scope.customersData[i].isCheck = false;
                                }
                                else {
                                    $scope.customersData[i].isCheck = true;
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