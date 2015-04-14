GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // TODO
}]);

GNM.factory('warehouseService', function ($http, $emerge) {

    return {
        query: function () {
            return $emerge.query("Warehouses");
        },
        get: function (id) {
            return $emerge.get("Warehouses", id);
        },
        add: function (warehouse) {
            // TODO Remove when USR Module ready
            return $emerge.add("Warehouses", warehouse);
        },
        update: function (warehouse) {
            return $emerge.update("Warehouses", warehouse.warehouseId, warehouse);
        },
        delete: function (id) {
            return $emerge.delete("Warehouses", id);
        },
        deleteItem: function (warehouseId, warehouseSectionId) {
            return $emerge.delete("Warehouses", warehouseId + '/Item?warehouseSectionId=' + warehouseSectionId);
        }
    };
});

/*
Get all the countrys information
- $scope.deleteFn is called to delete a particular country
- countryId is stored once user click on delete button
*/
GNM.controller('WarehouseCtrl', function ($scope, $http, warehouseService) {

});

GNM.controller('WarehouseAddCtrl', function ($scope, $http, $location, warehouseService) {
});
/*
Handle customer update
- init to get the existing customer information
- existing customer id is pass through when user click on edit button
- new customer information is saved on $scope.new_customer
*/
GNM.controller('WarehouseUpdateCtrl', function ($scope, $http, $location, warehouseService) {
    $scope.warehouse = {};
});

GNM.directive('warehousesectionsDropdown', function (warehouseService, $modal, $log) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" >' +
                '<option value="">Loading Warehouse Sections</option>' +
                '<optgroup ng-repeat="w in warehouseArr" label="{{w.warehouseName}}">' +
                    '<option ng-repeat="s in w.warehouseSectionsList" value="{{s.warehouseSectionId}}">{{s.warehouseSectionName}}</option>' +
                '</optgroup>' +
            '</select>',
        link: function (scope, element, attrs) {

            scope.warehouseArr = [];

            scope.addWarehouse = function () {
                var dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    templateUrl: 'GNM/Warehouses/WarehouseModalNew.html',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.warehouse = {};
                        $scope.warehouse.userId = 1;
                        $scope.warehouse.status = 1;
                        $scope.warehouse.warehouseSectionsList = [{ userId: 1 }];

                        $scope.addItem = function () {
                            $scope.warehouse.warehouseSectionsList.push({ userId: 1 });
                        }
                        $scope.removeItem = function (index) {
                            $scope.warehouse.warehouseSectionsList.splice(index, 1);
                        }

                        $scope.save = function () {
                            $log.info($scope.warehouse);
                            warehouseService.add($scope.warehouse).success(function (data) {
                                alert("Warehouse successfully created.");
                                scope.warehouseArr.push(data);
                                $modalInstance.close();
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                    //resolve: {
                    //    items: function () {
                    //        return $scope.items;
                    //    }
                    //}
                });
                dialog.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }

            warehouseService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                //var optgroup = document.createElement("optgroup");
                //optgroup.label = '----------';
                //element[0].appendChild(optgroup);
                //element[0].options[element[0].options.length] = new Option('My new option', 'some value');
                //var option = document.createElement("option");
                //option.text = "New";
                //option.value = "";
                //element[0].appendChild(option);

                if (data.data.length <= 0) {
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.warehouseArr = (data.data);
            });
        }
    };
});