ECM.controller('TimeSlotCtrl', function ($scope, $http, timeSlotService, $location, $anchorScroll) {
    $scope.timeSlotTableData = null;
    $scope.editingTimeSlot = {};

    $scope.loadTimeSlot = function () {
        timeSlotService.query().success(function (data) {
            $scope.timeSlotTableData = data;
        })
    };

    $scope.loadDayOfWeek = function () {
        timeSlotService.queryDayOfWeek()
            .success(function (data, status) {
                $scope.dayOfWeek = data;
            })
            .error(function(){alert('Error load Day and Max Orders');});
    };

    $scope.deleteTimeSlot = function (timeSlotId) {
        timeSlotService.delete(timeSlotId)
            .success(function (data) {
                $scope.loadTimeSlot();
            })
            .error(function (error) {
                alert(error);
            })
    };

    $scope.loadTimeSlot();

    $scope.loadDayOfWeek();

    $scope.save = function () {
        $scope.submitted = true;

        if (!$scope.myForm.$valid) {
            alert('Please check your data input');
            return false;
        }

        $scope.saving = true;
        if ($scope.editingTimeSlot.timeSlotId !== undefined) {
            timeSlotService.update($scope.editingTimeSlot.timeSlotId, $scope.editingTimeSlot)
            .success(function (data, status) {
                $scope.loadTimeSlot();
            }).error(function (data, status) {
                alert(data);
            }).finally(function () {
                $scope.editingTimeSlot = {};
                $scope.saving = false;
                $scope.submitted = false;
            });
        } else {
            timeSlotService.add($scope.editingTimeSlot)
            .success(function (data, status) {
                $scope.loadTimeSlot();
            }).error(function (data, status) {
                alert(data);
            }).finally(function () {
                $scope.editingTimeSlot = {};
                $scope.saving = false;
                $scope.submitted = false;
            });
        }
    };

    $scope.editTimeSlot = function (item) {

        angular.copy(item, $scope.editingTimeSlot);
        $scope.$apply();
    };

    $scope.deleteTimeSlot = function (id) {
        timeSlotService.delete(id)
            .success(function (data, status) {
                $scope.loadTimeSlot();
            })
    }

});
