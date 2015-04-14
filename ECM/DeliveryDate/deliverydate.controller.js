

ECM.controller('DeliveryDateListCtrl', function ($scope, $rootScope, deliverydateService){
    $scope.currentPage = 1;
    $scope.defaultStep = 15;
    $scope.loadDeliveryDateList = function () {
        deliverydateService.getAllTimingDisable($scope.defaultStep, $scope.currentPage)
            .success(function (data, status) {
                $scope.deliverydateDatatable = data;
            })
            .error(function() {alert('Error load Delivery Date List')});
    };

    $scope.deleteDateTimingDisable = function (id) {
        deliverydateService.deleteTimingDisable(id)
            .success(function() {
                alert('Delete timing disable successfull!');
                $scope.loadDeliveryDateList();
            })
            .error(function() { alert('Delete timing disable error!'); });
    };

    $scope.loadDeliveryDateList();
});


ECM.controller('DeliveryDateEditCtrl', function ($scope, $rootScope, $routeParams, $location, deliverydateService, $translate){

    $scope.busy = false;
    $scope.deliverydate = {};
    var disableTimeID = $routeParams.id || null;

    var convertDate = function (date) {
        date = new Date(date);
        if(angular.isNumber(date.getMonth()) && date.getDate() > 0 && angular.isNumber(date.getDate()) && angular.isNumber(date.getFullYear())){
            date = (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear();
            return date;
        }else{
            return;
        }
    };

    $scope.changeDisableDate = function (value) {
        if(disableTimeID){
            return;
        }
        value = convertDate(value);
        if(value!= null && value!=false && $scope.busy == false){
            $scope.busy = true;
            deliverydateService.getTimeSlotsByDate(value)
                .success(function (data, status) {
                    $scope.deliverydate.timeslotsList = data;
                })
                .error(function(){ console.log('There is no timeslots for this date!');})
                .finally(function(){ $scope.busy = false; });

            return;
        }
    };

    if(disableTimeID){
        $scope.editDate = false;
        deliverydateService.getInfoTimingDisableById(disableTimeID)
            .success(function (data, status) {
                $scope.deliverydate = data;
                $scope.deliverydate.timeslotsList = null;
                deliverydateService.getTimeSlotList(data.deliveryDisableDate)
                    .success(function(newData, status) {
                        $scope.deliverydate.timeslotsList = newData;
                        $scope.deliverydate.timeslotId = data.timeslotId;
                    } )
                    .error();
            })
            .error(function() { console.log('Error load information timing disable!') });
    }else{
        $scope.editDate = true;
    }

    $scope.save = function (data) {
        $scope.submitted = true;
        if(!$scope.myForm.$valid){
            alert($translate.instant('ALERT.FORM_ERROR'));
//            alert('Please check your input data!');
            return false;
        }
        $scope.busy = true;
        if(disableTimeID){
            deliverydateService.updateTimingDisable(data)
                .success(function(data, status) {
//                    alert('Update timing disable successfull!');
                    alert($translate.instant('ALERT.UPDATED'));
                    $location.path('/delivery-date');
                } )
                .error(function () { alert('Update timing disable fail! Please try again later.') })
                .finally(function(){ $scope.busy=false; });
        }else{
            deliverydateService.addNewTimingDisable(data)
                .success(function(data, status){
                    alert($translate.instant('ALERT.SAVED'));
//                    alert("Create new disable date successfull!");
                    $location.path('/delivery-date');
                })
                .error(function(data, index){
                    if(index==400){
                        alert(data);
                    }else{
                        alert('Error Create new disable date!')
                    }
                })
                .finally(function(){ $scope.busy = false; });
        }
    };

});