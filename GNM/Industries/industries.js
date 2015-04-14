GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    // TODO
}]);

GNM.factory('industryService', function ($http, $emerge) {
    return {
        query: function () {
            return $emerge.query("industries");
        },
        add: function (industry) {
            // TODO Remove when USR Module ready
            // industry.userId = 1;
            return $emerge.add("industries", industry);
        },
        update: function (industry) {
            return $emerge.update("industries", industry.industryId, industry);
        },
        delete: function (id) {
            return $emerge.delete("industries", id);
        }

    };
});
/*
Get all the industrys information
- $scope.deleteFn is called to delete a particular industry
- industryId is stored once user click on delete button
*/
GNM.controller('IndustryCtrl', function ($scope, $http, industryService) {

});

GNM.controller('IndustryAddCtrl', function ($scope, $http, $location, industryService) {
});
/*
Handle customer update
- init to get the existing customer information
- existing customer id is pass through when user click on edit button
- new customer information is saved on $scope.new_customer
*/
GNM.controller('IndustryUpdateCtrl', function ($scope, $http, $location, industryService) {
    $scope.industry = {};
});

GNM.directive('industriesDropdown', function (industryService, $modal, $log) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" >' + //footer="Add" footerfn="addIndustry()">' +
                '<option value="">Please Select</option>' +
                '<option ng-repeat="c in industryArr" value="{{c.industryId}}">{{c.name}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            // Function for Modal
            scope.addIndustry = function () {
                var dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    templateUrl: 'GNM/Industries/IndustryModalNew.html',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.industry = {};

                        $scope.save = function () {
                            industryService.add($scope.industry).success(function (data) {
                                scope.industryArr.push(data);
                                $modalInstance.close();
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                });
                dialog.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }

            scope.industryArr = [];
            industryService.query().then(function (data) {
                scope.industryArr = (data.data);
            });
        }
    };
});
