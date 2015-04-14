
//var ECM = angular.module('ECM', ['ngEmerge', 'ajoslin.promise-tracker']);

ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/generation-saleman-commission', { templateUrl: 'ECM/SalemanCommission/generationcommission.html' });
}]);


ECM.factory('salemancommissionService', function ($rootScope, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var SalemanCommisionServiceBase = {

        querySalepersonList: function () {
            return $emerge.query("ecm/CommissionHistory/GetSalePerson");
        },
        addNewSalemanCommission: function (data) {
            return $emerge.add("ecm/CommissionHistory", data);
        },
        exportSaveCommission: function (data) {
//            return $emerge.query("ecm/CommissionHistory/GetCommissionByDate") + "?fromDate=" + data.fromDate + '&toDate=' + data.toDate;
            return $emerge.getApiUrl() + "ecm/CommissionHistory/GetCommissionByDate?fromDate=" + data.fromDate + '&toDate=' + data.toDate;
        },
        exportSaveCommissionHistory: function (data) {
//            return $emerge.query("ecm/CommissionHistory/GetAllCommissionHistory") + "?fromDate=" + data.fromDate + '&toDate=' + data.toDate;
            return $emerge.getApiUrl() + "ecm/CommissionHistory/GetAllCommissionHistory?fromDate=" + data.fromDate + '&toDate=' + data.toDate;
        }

    };

    return SalemanCommisionServiceBase;
});