

ECM.controller('LoyaltyPointsCtrl', function ($scope, loyaltypointsService) {

    var loyaltyPointsTableData = $scope.loyaltyPointsTableData = null;

    $scope.loadloyaltyPoints = function () {
        loyaltypointsService.query(null, 10000, 1, null, null).success(function (data, status) {
            $scope.loyaltyPointsTableData = data;
        })
    }
    $scope.loadloyaltyPoints();

    $scope.doSearch = function() {
        loyaltypointsService.query(null, 10000, 1, $scope.DateValidFrom, $scope.DateValidUntil).success(function(data, status) {
            $scope.loyaltyPointsTableData = data;
        });
    };

    $scope.deleteLoyaltyPoint = function (loyaltyPointId) {
        loyaltypointsService.delete(loyaltyPointId)
            .success(function(data) {
                $scope.loadloyaltyPoints();
            })
            .error(function(error) {
                console.log(error);
            });
    };
});


ECM.controller('LoyaltyPointsEditCtrl', function ($scope, $http, $route, $routeParams, $location, loyaltypointsService, errorDisplay) {

    $scope.loyaltypointsObj = {};

    var loyaltypointsId = null;

    var init = function() {
        loyaltypointsId = $routeParams.id;

        // If route has loyaltypoints Id, proceed to load loyaltypoints
        if (loyaltypointsId) {
            loyaltypointsService.get(loyaltypointsId)
                .success(function(data) {
                    angular.copy(data, $scope.loyaltypointsObj);
                });
        }
    };

    $scope.saveLoyaltyPoint = function() {
        $scope.submitted = true;

        if (!$scope.loyaltyForm.$valid) {
            alert('Please check your data input');
            console.log($scope.loyaltyForm);
            return false;
        }
        
        $scope.saving = true;
        
        if (loyaltypointsId) {
            loyaltypointsService.update(loyaltypointsId, $scope.loyaltypointsObj)
                .success(function(data) {
                    alert('Successfully Updated');
                    $location.path('/loyaltypoints');
                })
                .error(function(data) {
                    alert(data);
                }).finally(function() {
                    //$scope.submitted = false;
                    $scope.saving = false;
                }   
                );
        } else {
            loyaltypointsService.add($scope.loyaltypointsObj)
                .success(function(data) {
                    alert('Successfully Added');
                    $location.path('/loyaltypoints');
                })
                .error(function (data) {
                    alert(data);
                }).finally(function () {
                    //$scope.submitted = false;
                    $scope.saving = false;
                }
                );
        }
    };
    init();
});