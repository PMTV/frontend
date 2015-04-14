PRF.controller('ProfileEditCtrl', function ($rootScope, $scope, $location, $route, $http, profileService, $upload) {

    $scope.submitted = false;
    $scope.checkChangePass = false;
    $scope.profile = [];
    $scope.profile.files = [];
    $scope.busy = false;

    var _init = function () {
        profileService.getProfile()
            .success(function (data, status) {
                $scope.profile = data;
                var dateTemp = new Date(data.dateCreated);
                var m_names = new Array("Jan", "Feb", "Mar","Apr", "May", "June", "July", "Aug", "Sept","Oct", "Nov", "Dec");
                dateTemp = dateTemp.getDate() + '-' + m_names[dateTemp.getMonth()] + '-' + dateTemp.getFullYear();
                $scope.profile.dateFormated = dateTemp;
            })
            .error()
            .finally();
    };

    $scope.$watch(function(){return $scope.profile.password;}, function (newVal, oldVal) {
        if(newVal != null){
            $scope.checkChangePass = true;
        }
        else{
            $scope.checkChangePass = false;
            return false;
        }
    }, true);

    $scope.saveProfile = function (profile) {
        $scope.submitted = true;


        if (!$scope.myForm.$valid) {
            alert('Please check your data input');
            return false;
        }
        var urlTemp = profileService.getUrl();
        $scope.busy = true;
        $http({
            method: 'PUT',
            url: urlTemp,
            headers: { 'Content-Type': false },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("ProfileBindingModel", angular.toJson(profile));
                if($scope.profile.files != null){
                    formData.append("file",$scope.profile.files);
                }
                return formData;
            }
            }).
            success(function (data, status, headers, config) {
                alert("Update Successfull!!");
                $route.reload();
            }).
            error(function (data, status, headers, config) {
                console.log('Update Failed!');
                $scope.busy = false;
                $scope.submitted = false;
            })
            .finally(function(){$scope.submitted=false; $scope.myForm[0].reset();});

    };

    _init();

});

PRF.controller('ProfileAsideCtrl', function ($rootScope, $scope, $location, $http, profileService) {




});