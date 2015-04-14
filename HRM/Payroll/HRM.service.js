var HRM = angular.module('HRM');

HRM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/Payroll', { templateUrl: 'HRM/Payroll/Payroll.html' })
        .when('/Submit', { templateUrl: 'HRM/Payroll/EditSubmitPayroll.html' })
}]);
