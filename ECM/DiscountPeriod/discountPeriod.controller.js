

ECM.controller('DiscountPeriodCtrl', function ($scope, $http, discountPeriodService, $location, $anchorScroll) {
    $scope.submitted = false;
    $scope.discount = {
        discountFor24HId : 1,
        isDiscountFor24H : false,
        percengtage : null
    };

    var _init = function () {
        discountPeriodService.getDiscountFor24H()
            .success(function (data, status) {
                if(data != undefined){
                    $scope.discount.discountFor24HId = data.discountFor24HId;
                    $scope.discount.isDiscountFor24H = data.isDiscountFor24H;
                    $scope.discount.percengtage = data.percengtage;
                }
            })
            .error(function(data, status){  })
            .finally(function(){  });
    };

    $scope.save = function (discount) {
        $scope.submitted = true;

        if(!$scope.myForm.$valid){
            alert('Please check your input data!');
            return false;
        }

        discount.percengtage = parseFloat(discount.percengtage);
        discount.discountFor24HId = discount.discountFor24HId || 1;
        discountPeriodService.updateDiscountFor24H(discount.discountFor24HId, discount)
            .success(function (data, status) {
                alert('Successful updated!');
            })
            .error()
            .finally(function(){ $scope.submitted = false; });
    };

    _init();
});
