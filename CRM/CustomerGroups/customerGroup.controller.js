CRM.controller('CustomerGroupCtrl', function ($scope, $http, customerGroupService) {
    $scope.customerGroupTableData = null;
    $scope.editingCustomerGroup = {};

    $scope.loadCustomerGroup = function () {
        customerGroupService.query().success(function (data) {
            $scope.customerGroupTableData = data;
        })
    }

    $scope.deleteCustomerGroup = function (customerGroupId) {
        customerGroupService.delete(customerGroupId)
            .success(function(data) {
                $scope.loadCustomerGroup();
            })
            .error(function(error) {
                console.log(error);
            });
    };

    $scope.loadCustomerGroup();

    $scope.save = function () {
        $scope.submitted = true;

        if (!$scope.myForm.$valid) {
            alert('Please check your data input');
            return false;
        }

        $scope.saving = true;
        if ($scope.editingCustomerGroup.customerGroupId !== undefined) {
            customerGroupService.update($scope.editingCustomerGroup.customerGroupId, $scope.editingCustomerGroup)
            .success(function (data, status) {
                $scope.loadCustomerGroup();
            }).error(function (data, status) {
                alert(data);
            }).finally(function () {
                $scope.editingCustomerGroup = {};
                $scope.saving = false;
                $scope.submitted = false;
            });
        } else {
            customerGroupService.add($scope.editingCustomerGroup)
            .success(function (data, status) {
                $scope.loadCustomerGroup();
            }).error(function (data, status) {
                alert(data);
            }).finally(function () {
                $scope.editingCustomerGroup = {};
                $scope.saving = false;
                $scope.submitted = false;
            });
        }
    }

    $scope.editCustomerGroup = function (item) {
        angular.copy(item, $scope.editingCustomerGroup);
        $scope.$apply();
    }

    $scope.deleteCustomerGroup = function (id) {
        customerGroupService.delete(id)
            .success(function (data, status) {
                $scope.loadCustomerGroup();
            })
    }

});
