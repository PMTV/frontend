var HRM = angular.module('HRM', []);

HRM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/employees', { templateUrl: 'HRM/Employees/employee.html' })
        .when('/employees/new', { templateUrl: 'HRM/Employees/EmployeeEdit/employeeEdit.html' })
        .when('/employees/:id', { templateUrl: 'HRM/Employees/EmployeeEdit/employeeEdit.html' })
        .when('/employeesalay/:id', { templateUrl: 'HRM/Employees/EmployeeEdit/employeeSalaryForm.html' })

        .when('/Payroll', { templateUrl: 'HRM/Payroll/Payroll.html' })
        .when('/Submit', { templateUrl: 'HRM/Payroll/EditSubmitPayroll.html' })
}]);

HRM.factory('employeeService', function ($rootScope, $http, $emerge, promiseTracker) {

    var EmployeeServiceBase = {

        query: function () {
            return $emerge.query("employee");
        },
        get: function (id) {
            return $emerge.get("employee", id);
        },
        add: function (data) {
            data.userId = 1;
            return $emerge.add("employee", data);
        },
        update: function (data) {
            data.userId = 1;
            return $emerge.update("employee", data.employeeId, data)
        },
        patch: function (data, id) {
            return $emerge.patch("employee", id, data);
        },
        delete: function (id) {
            return $emerge.delete("employee", id);
        },
        queryDepartment: function () {
            return $emerge.query("department");
        },
        queryDepartmentByID: function () {

        },
        queryGroup: function () {
            return $emerge.query("employeegroup");
        },
        //Salary

        addsalary: function (data) {
            data.userId = 1;
            return $emerge.add("employeeSalaryInfo", data);
        },
        updatesalary: function (data) {
            data.userId = 1;
            return $emerge.update("employeeSalaryInfo", data.employeeSalaryInfoId, data)
        },
        searchemployeesalaryinfobyId: function (id) {
            return $emerge.query("employeeSalaryInfo/search?employeeId=" + id);
        },
        //Payroll Addition
        addpayrolladdition: function (data) {
            data.userId = 1;
            return $emerge.add("payrolladdition", data);
        },
        updatepayrolladdition: function (data) {
            data.userId = 1;
            return $emerge.update("payrolladdition", data.payrollAdditionId, data)
        },
        searchadditionById: function (id) {
            return $emerge.query("payrolladdition/search?employeeId=" + id);
        },

        //Payroll Deduction
        addpayrollDeduction: function (data) {
            data.userId = 1;
            return $emerge.add("payrolldeduction", data);
        },
        updatepayrollDeduction: function (data) {
            data.userId = 1;
            return $emerge.update("payrolldeduction", data.payrollDeductionId, data)
        },
        searchDeductionById: function (id) {
            return $emerge.query("payrolldeduction/search?employeeId=" + id);
        },

        //Payroll Overime
        addpayrollovertime: function (data) {
            data.userId = 1;
            data.payrollDetailId = 1;
            return $emerge.add("payrollovertime", data);
        }, updatepayrollovertime: function (data) {
            data.userId = 1;
            return $emerge.update("payrollovertime", data.payrollOvertimeId, data)
        },
        searchovertimeById: function (id) {
            return $emerge.query("payrollovertime/search?employeeId=" + id);
        },
        //Payroll Detail
        addpayrolldetail: function (data) {
            data.userId = 1;
            return $emerge.add("payrolldetail", data);
        },
        updatepayrolldetail: function (data) {
            data.userId = 1;
            return $emerge.update("payrolldetail", data.payrollDetailId, data);
        },
        getPayrollDetailByID: function (id) {
            return $emerge.query("payrolldetail/search?employeeId=" + id);
        },
        getGrossSalary: function (id, baseSalary, noWorkingInMonth, noDayWorked, addition, overtime) {
            return $emerge.query("payrolldetail/" + id + "/grossSalary?baseSalary=" + baseSalary + "&noWorkingInMonth=" + noWorkingInMonth + "&noDayWorked=" + noDayWorked + "&addition=" + addition + "&overtime=" + overtime)
        },
        getNetSalary: function (id, grossSalary, deduction) {
            return $emerge.query("payrolldetail/" + id + "/netSalary?grossSalary=" + grossSalary + "&deduction=" + deduction)
        }
    };
    return EmployeeServiceBase;
});