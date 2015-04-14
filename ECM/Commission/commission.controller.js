

ECM.controller('CommissionCtrl', function ($scope, commissionService) {

    var commissionTableData = $scope.commissionTableData = null;

    $scope.loadCommission = function () {
        commissionService.query(null, 10000, 1).success(function (data, status) {
            $scope.commissionTableData = data;
        })
    }
    $scope.loadCommission();

    $scope.doSearch = function() {
        commissionService.query(null, 10000, 1, $scope.salesPersonId).success(function (data, status) {
            $scope.commissionTableData = data;
        });
    };

    $scope.deleteCommission = function (commissionId) {
        commissionService.delete(commissionId)
            .success(function(data) {
                $scope.loadCommission();
            })
            .error(function(error) {
                console.log(error);
            });
    };
});


ECM.controller('CommissionEditCtrl', function ($scope, $http, $route, $routeParams, $location, $filter, commissionService, errorDisplay) {

    $scope.commissionObj = {};

    var commissionId = null;

    var convertDate = function (date) {
        date = new Date(date);
        return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    };

    $scope.$watch('commissionObj.fromDate', function(newval, oldval){
        var fromDate = convertDate($scope.commissionObj.fromDate);
        var toDate = convertDate($scope.commissionObj.toDate);
        if(toDate < fromDate) {
            $scope.commissionObj.toDate = '';
        }
    });

    $scope.$watch('commissionObj.toDate', function(newval, oldval){
        var fromDate = convertDate($scope.commissionObj.fromDate);
        var toDate = convertDate($scope.commissionObj.toDate);
        if(toDate < fromDate) {
            $scope.commissionObj.toDate = '';
        }
    });

    var init = function() {
        commissionId = $routeParams.id;

        // If route has loyaltypoints Id, proceed to load loyaltypoints
        if (commissionId) {
            commissionService.get(commissionId)
                .success(function(data) {
                    angular.copy(data, $scope.commissionObj);
                });
        }

        //get employee list
        commissionService.getEmployeeList()
            .success(function (data, status) {
                $scope.usersList = data;
            })
            .error(function() {alert('Error load sale person list!');});
    };

    $scope.saveCommission = function () {
        $scope.submitted = true;
        if (!$scope.commissionForm.$valid) {
            alert('Please check your data input');
            return false;
        }
        
        $scope.saving = true;
        $scope.busy = true;
        if (commissionId) {
            commissionService.update(commissionId, $scope.commissionObj)
                .success(function(data) {
                    alert('Successfully Updated');
                    $location.path('/commission');
                })
                .error(function(data) {
                    errorDisplay.show(error);
                }).finally(function() {
                    //$scope.submitted = false;
                    $scope.saving = false;
                }   
                );
        } else {
            commissionService.add($scope.commissionObj)
                .success(function(data) {
                    alert('Successfully Added');
                    $location.path('/commission');
                })
                .error(function (data) {
                    errorDisplay.show(error);
                }).finally(function () {
                    //$scope.submitted = false;
                    $scope.saving = false;
                }
                );
        }
    };
    init();
});