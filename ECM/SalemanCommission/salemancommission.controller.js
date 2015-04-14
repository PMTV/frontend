
ECM.controller('GenerationSalemainCommissionCtrl', function ($scope, $rootScope, $routeParams, $location, $sce, salemancommissionService){

    $scope.generation = {};
    $scope.report = {};
    $scope.busy = false;

    $scope.loadSalePersonList = function () {
        salemancommissionService.querySalepersonList()
            .success(function (data, status) {
                $scope.usersList = data;
            })
            .error(function() {alert('Error load sale person list!');});
    };

    $scope.$watch('generation.fromDate', function(newval, oldval){
        if($scope.generation.toDate < $scope.generation.fromDate) {
            $scope.generation.toDate = '';
        }
    });
    $scope.$watch('report.fromDate', function(newval, oldval){
        if($scope.report.toDate < $scope.report.fromDate) {
            $scope.report.toDate = '';
        }
    });

    $scope.$watch('generation.toDate', function(newval, oldval){
        if($scope.generation.toDate < $scope.generation.fromDate) {
            $scope.generation.toDate = '';
        }
    });
    $scope.$watch('report.toDate', function(newval, oldval){
        if($scope.report.toDate < $scope.report.fromDate) {
            $scope.report.toDate = '';
        }
    });

    $scope.save = function (data) {
        $scope.submitted = true;
        if(!$scope.createForm.$valid){
            alert('Please check your input data!');
            return false;
        }
        $scope.saving = true;

        salemancommissionService.addNewSalemanCommission(data)
            .success(function(){
                alert('Create new saleman commission successfull!');
                $scope.generation = {};
                $scope.createForm.$setPristine();
            })
            .error(function(){ alert('Create new saleman commission fail!') })
            .finally(function() {$scope.saving = false; $scope.busy = false; $scope.submitted = false;});
    };

    $scope.saveCommission = function (data, action) {
        $scope.formSubmitted = true;
        if(!$scope.reportForm.$valid){
            alert('Please check your input data!');
            $scope.busy = false;
            return false;
        }

        var convertDate = function (date) {
            date = new Date(date);
            date = (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear();
            return date;
        };

        data.fromDate = convertDate(data.fromDate);
        data.toDate = convertDate(data.toDate);

        if(action){
            var url = salemancommissionService.exportSaveCommissionHistory(data);
            window.open(url, '_blank');
        }else{
            var url = salemancommissionService.exportSaveCommission(data);
            window.open(url, '_blank');
        }

    };

    $scope.loadSalePersonList();

});