

ECM.controller('CouponListCtrl', function ($scope, couponService) {

    var couponTableData = $scope.couponTableData = null;    
    var couponStatus = $scope.couponStatus = '';
    var couponType = $scope.couponType = '';


    $scope.loadcoupon = function () {
        couponService.query(null, 10000, 1, null, null).success(function (data, status) {
            $scope.couponTableData = data;
        })
    };
    $scope.loadcoupon();

    $scope.doSearch = function () {
        couponService.query(null, 10000, 1, $scope.couponStatus, $scope.couponType).success(function (data, status) {
            $scope.couponTableData = data;
        })
    };
    
});


ECM.controller('CouponEditCtrl', function ($scope, $location, couponService) {
    $scope.submitted = false;

    $scope.couponObj = {
        "CouponValue": null,
        "CouponType": null,
        "DateValidFrom": null,
        "DateValidUntil": null,
        "MinTotalPrice": null,
        "MaxTotalPrice": null
    };

    $scope.doAdd = function () {
        $scope.submitted = true;

        if(!$scope.myForm.$valid){
            alert('Please check your input data!');
            return false;
        }

        couponService.add($scope.couponObj)
            .success(function (data, status, headers) {
                $location.path('/coupon');
            })
            .error(function (data, status, headers) {
                if (data.message)
                    alert(data.message);
                else
                    alert(data);
            })
            .finally(function(){ $scope.submitted = false; });
    }
});