
Dashboard.controller('DashboardCtrl', function ($scope, dashboardService, salesService, $http) {

    $scope.generalInfo = {};
    $scope.recieveInfo = null;
    $scope.chartStatistics = {};
    $scope.dataChartStatistics = null;
    $scope.receiveChartLine = [];
    $scope.receiveChartBar = [];

    var tabAnalysis = 'Dashboard/DashBoardPartial/tabAnalysis.html?a=a';
    var tabMessages = 'Dashboard/DashBoardPartial/tabMessage.html?a=a';
    var tabCalendar = 'Dashboard/DashBoardPartial/tabMyCalendar.html?a=a';
    var tabSettings = 'Dashboard/DashBoardPartial/tabSetting.html?a=a';

    $scope.loadNewLayout = function (id) {
        switch (id) {
            case 1:
                $scope.tabSelected = 'tab-analysis';
                $scope.tabPath = tabAnalysis;
                break;
            case 2:
                $scope.tabSelected = 'tab-message';
                $scope.tabPath = tabMessages;
                break;
            case 3:
                $scope.tabSelected = 'tab-calendar';
                $scope.tabPath = tabCalendar;
                break;
            case 4:
                $scope.tabSelected = 'tab-setting';
                $scope.tabPath = tabSettings;
                break;
        }
    };

    $scope.onChangeStatistics = function (id) {
        $scope.dataChartStatistics = [];
        switch (id) {
            case "byWeek":
                dashboardService.getStatisticsByWeek()
                    .success(function (data, status) {
                        $scope.chartStatistics = data;
                        $scope.dataChartStatistics = data.orderStatisticList;
                    })
                    .error()
                    .finally();
                break;
            case "byMonth":
                dashboardService.getStatisticsByMonth()
                    .success(function (data, status) {
                        $scope.chartStatistics = data;
                        $scope.dataChartStatistics = data.orderStatisticList;
                    })
                    .error()
                    .finally();
                break;
            case "byYear":
                dashboardService.getStatisticsByYear()
                    .success(function (data, status) {
                        $scope.chartStatistics = data;
                        $scope.dataChartStatistics = data.orderStatisticList;
                    })
                    .error()
                    .finally();
                break;
        }

    };

    var _init = function () {
        $scope.selectStatistics = 'byYear';
        $scope.loadData();
        $scope.loadNewLayout(1);
        $scope.onChangeStatistics('byYear');
        //$scope.loadSales(10, 1);
    };

    $scope.loadData = function () {
        dashboardService.getGeneralInfo()
            .success(function (data, status) {
                $scope.generalInfo = data;
            })
            .error()
            .finally();
        dashboardService.getReceivableAmountInWeek()
            .success(function (data, status) {
                $scope.recieveInfo = data;
                angular.forEach(data.receivableAmountList, function (key, value) {
                    $scope.receiveChartLine.push(parseFloat(key));
                });
                angular.forEach(data.actualReceivableList, function (key, value) {
                    $scope.receiveChartBar.push(parseFloat(key));
                });
                //                $scope.receiveChartLine = data.receivableAmountList;
                //                $scope.receiveChartBar = data.actualReceivableList;
            })
            .error()
            .finally();
    };
    //$scope.salesTableData = null;
    //$scope.defaultStep = 10;
    //$scope.currentPage = 1;
    //$scope.maxSize = 5;

    //$scope.loadSales = function (step, page) {
    //    console.log('First load data with step: ' + step + ' page: ' + page);
    //    salesService.getExceedCreditLimitSalesOrders(step, page).success(function (data) {
    //        $scope.salesTableData = data.results;
    //        $scope.totalPages = Math.ceil(data.total / $scope.defaultStep);
    //        console.log('total page : ' + $scope.totalPages);
    //    });
    //};

    //$scope.$watch('currentPage + defaultStep', function () {
    //    console.log('currentPage : ' + $scope.currentPage);
    //    $scope.loadSales($scope.defaultStep, $scope.currentPage);
    //});

    $scope.sales = [];
    var selectedSales = $scope.selectedSales = [];

    $scope.columnDefs = [
            { field: 'salesOrderNumber', displayName: '#Sales Order Number' },
            { field: 'customer.companyName', displayName: 'Company Name' },
            { field: 'salesOrderStatusId', displayName: 'Status', cellTemplate: '<div class="ngCellText">{{row.entity.salesOrderStatusId | salesStatus:row.entity.settings.isApproved}}</div>' },
            { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date', visible: true },
            { field: 'salesOrderId', displayName: 'Actions', cellTemplate: '<a href="#/sales/{{row.entity.salesOrderId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false,
        showSelectionCheckbox: false
    };

    _init();
});
