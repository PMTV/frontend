ECM.controller('PaymentListCtrl', function ($scope, paymentsService) {

    var paymentTableData = $scope.paymentTableData = null;
    var customerId = $scope.customerId = null;
    var paymentStatus = $scope.paymentStatus = 0;
    var dateFrom = $scope.dateFrom = '';
    var dateTo = $scope.dateTo = '';

    $scope.loadPayment = function () {
        paymentsService.query(null, 2, 1, null, null, null, null)
            .success(function (data, status) {
                $scope.paymentTableData = data;
            })
            .error(function(data, status){
                alert('Error load customer list!');
            })
            .finally();
    };
    $scope.loadPayment();

    $scope.doSearch = function () {
        var convertDate = function (date) {
            if(date!=null){
                date = new Date(date);
                date = (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear();
                return date;
            }
            return null;
        };
        var dateFrom = convertDate($scope.dateFrom);
        var dateTo = convertDate($scope.dateTo);
        var paymentStatus = ($scope.paymentStatus == 0) ? null : $scope.paymentStatus;

        paymentsService.query(null, 10000, 1, $scope.customerId, paymentStatus, dateFrom, dateTo)
            .success(function (data, status) {
                $scope.paymentTableData = data;
            })
            .error(function(){ alert('Error load payment list!'); })
            .finally();
    }


});