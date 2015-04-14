var Dashboard = angular.module('Dashboard', []);

Dashboard.factory('dashboardService', function ($rootScope, $http, $emerge, promiseTracker) {
    var DashboardServices = {

//      ORDERS CHART
        getGeneralInfo: function () {
            return $emerge.query("ecm/Analysis/GetGeneralInfo");
        },
        getStatisticsByWeek: function () {
            return $emerge.query("ecm/Analysis/GetStatisticInWeek");
        },
        getStatisticsByMonth: function () {
            return $emerge.query("ecm/Analysis/GetStatisticInMonth");
        },
        getStatisticsByYear: function () {
            return $emerge.query("ecm/Analysis/GetStatisticInYear");
        },

//      RECEIVES CHART
        getReceivableAmountInWeek: function () {
            return $emerge.query("ecm/Analysis/GetReceivableAmountInWeek");
        }
    };

    return DashboardServices;
});