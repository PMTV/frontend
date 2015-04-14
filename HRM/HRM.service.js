var HRM = angular.module('HRM', ['ngRoute']);
var oDatatable;
HRM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/employee', { templateUrl: 'HRM/Employee/employee.html' })
        .when('/employee/new', { templateUrl: 'HRM/Employee/employeeEditForm.html' })
        .when('/employee/:id', { templateUrl: 'HRM/Employee/employeeEditForm.html' })
        .when('/employeesalay/:id', { templateUrl: 'HRM/Employee/employeeSalaryForm.html' })
        .when('/Payroll', { templateUrl: 'HRM/Payroll/Payroll.html' })
        .when('/payrollreport', { templateUrl: 'HRM/Report/payrollreport.html' })
        .when('/employerreport', { templateUrl: 'HRM/Report/employerreport.html' })
        .when('/admin', { templateUrl: 'HRM/Admin/admin.html' })
        .when('/employeedetailreport', { templateUrl: 'HRM/Report/employeedetailreport.html' })
        .when('/employeedetailreport/:id', { templateUrl: 'HRM/Report/EmployeeDetails.html' })
        .when('/leaving', { templateUrl: 'HRM/Leave/Leaving_List.html' })
        .when('/leaving/new', { templateUrl: 'HRM/Leave/Leaving.html' })
        .when('/leaving/:id', { templateUrl: 'HRM/Leave/leaving.html' })
}]);
HRM.factory('employeeService', function ($rootScope, $http, $emerge, promiseTracker) {
    var EmployeeServiceBase = {
        //EMPLOYEE
        query: function () {
            return $emerge.query("employee");
        },
        getallemployee: function () {
            return $emerge.query("employee?takes=10000");
        },
        get: function (id) {
            return $emerge.get("employee", id);
        },
        add: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("employee", data);
        },
        update: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("employee", data.employeeId, data)
        },
        delete: function (id) {
            return $emerge.delete("employee", id);
        },
        getEmployeeCPFContribution: function(birhtday){
            return $emerge.query("cpfTable/CPFEmployee?birthday="+ birhtday)
        },
        getEmployerCPFContribution: function (birhtday) {
            return $emerge.query("cpfTable/CPFEmployer?birthday=" + birhtday)
        },
        //Image
        getEmployeeImage: function (id) {
            return $emerge.query("employee/" + id + "/Image")
        },
        UploadEmployeeImage: function (id) {
            return $emerge.query("employee/" + id + "/upload")
        },
        fileURL: function () {
            return $emerge.getAppUrl()
        },
        PostEmployeeImgFile: function (file, uploadUrl) {
            var fd = new FormData();
            fd.append('file', file);
            return $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
        },
        //-----employeeStatus
        queryEmployeeStatus: function () {
            return $emerge.query("employeeStatus")
        },
        queryEmployeeStatusByID: function (id) {
            return $emerge.query("employeeStatus/" + id)
        },
        queryEmployeeStatusAdd: function (data) {
            return $emerge.add("employeeStatus", data);
        },
        queryEmployeeStatusUpdate: function (data) {
            return $emerge.update("employeeStatus", data.employeeStatusId, data)
        },
        deleteEmployeeStatus: function (id) {
            return $emerge.delete("employeeStatus", id);
        },
        //-----employee/gender
        queryEmployeeGender: function () {
            return $emerge.query("employee/gender")
        },
        //DEPARTMENT
        queryDepartment: function () {
            return $emerge.query("department");
        },
        queryDepartmentByID: function (id) {
            return $emerge.query("department/" + id);
        },
        queryDepartmentAdd: function (data) {
            return $emerge.add("department", data);
        },
        queryDepartmentUpdate: function (data) {
            return $emerge.update("department", data.departmentId, data)
        },
        deleteDepartment: function (id) {
            return $emerge.delete("department", id);
        },
        //GROUP
        queryGroup: function () {
            return $emerge.query("employeegroup");
        },
        queryGroupByID: function (id) {
            return $emerge.query("employeegroup/" + id);
        },
        queryGroupAdd: function (data) {
            return $emerge.add("employeegroup", data);
        },
        queryGroupUpdate: function (data) {
            return $emerge.update("employeegroup", data.employeeGroupId, data)
        },
        deleteGroup: function (id) {
            return $emerge.delete("employeegroup", id);
        },

        //SALARY
        addsalary: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("employeeSalaryInfo", data);
        },
        updatesalary: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("employeeSalaryInfo", data.employeeSalaryInfoId, data)
        },
        searchemployeesalaryinfobyId: function (id) {
            return $emerge.query("employeeSalaryInfo/search?employeeId=" + id);
        },

        //ADDRESS (Employee Contact Info)
        getContactByEmloyeeId: function (id) {
            return $emerge.query("employeeContactInfo/search?employeeId=" + id);
        },
        addEmployeeContact: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("employeeContactInfo", data);
        },
        updateEmployeeContact: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("employeeContactInfo", data.employeeContactInfoId, data)
        },

        //------------------------------
        getemployeePassType: function () {
            return $emerge.query("employee/employeePassType");
        },
        //------------------------------

        //JOB INFO
        getEmployeeJobInfoById: function (id) {
            return $emerge.query("employeeJobInfo/search?employeeId=" + id);
        },
        addEmployeeJob: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("employeeJobInfo", data);
        },
        updateEmplyeeJob: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("employeeJobInfo", data.employeeJobInfoId, data);
        },
        //---DESIGNATION
        queryDesignation: function () {
            return $emerge.query("Designation")
        },
        queryDesignationByID: function (id) {
            return $emerge.query("Designation/" + id)
        },
        queryDesignationAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("Designation", data);
        },
        queryDesignationUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("Designation", data.designationId, data)
        },
        deleteDesignation: function (id) {
            return $emerge.delete("Designation", id);
        },


        //BANK INFO
        getEmployeeBankInfo: function (id) {
            return $emerge.query("employeeBankInfo/search?employeeId=" + id)
        },
        addBankInfo: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("employeeBankInfo", data);
        },
        updateBankInfo: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("employeeBankInfo", data.employeeBankInfoId, data);
        },

        //FOREIGN WORKER
        getEmployeeForeignWorker: function (id) {
            return $emerge.query("employeeForeignWorker/search?employeeId=" + id)
        },
        addEmployeeForeignWorker: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("employeeForeignWorker", data);
        },
        updateEmployeeForeignWorker: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("employeeForeignWorker", data.employeeForeignWorkerId, data);
        },
        getWorkerLevyType: function () {
            return $emerge.query("employeeForeignWorker/WorkerLevyType");
        },

        //LEAVE INFO
        queryLeaveInfo: function () {
            return $emerge.query("employeeLeaveInfo")
        },
        getAllLeaveInfoById: function (year, id) {
            return $emerge.query("employeeLeaveInfo/search?year=" + year + "&employeeId=" + id);
        },
        queryLeaveInfoByID: function (id) {
            return $emerge.query("employeeLeaveInfo/" + id)
        },
        queryLeaveInfoAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("employeeLeaveInfo", data);
        },
        queryLeaveInfoUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("employeeLeaveInfo", data.employeeLeaveInfoId, data)
        },
        deleteLeaveInfo: function (id) {
            return $emerge.delete("employeeLeaveInfo", id);
        },
        //Get Employee CYL
        getLeaveInfoCYL: function (year, id) {
            return $emerge.query("employeeLeaveInfo/employeeLeaveInfoCYL?year=" + year + "&employeeId=" + id);
        },
        //employeeFileUpload
        fileURL: function () {
            return $emerge.getAppUrl()
        },
        PostEmployeeFile: function (file, uploadUrl) {
            var fd = new FormData();
            fd.append('file', file);
            return $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
        },

        //EMPLOYEE LEAVING

        queryLeaving: function () {
            return $emerge.query("employeeLeaving")
        },
        SearchEmployeeLeavingById: function (id) {
            return $emerge.query("employeeLeaving/search?employeeId=" + id);
        },
        queryLeavingByID: function (id) {
            return $emerge.query("employeeLeaving/" + id)
        },
        queryLeavingAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("employeeLeaving", data);
        },
        queryLeavingUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("employeeLeaving", data.employeeLeavingId, data)
        },
        deleteLeaving: function (id) {
            return $emerge.delete("employeeLeaving", id);
        },
        //PAYROLL 

        //-------PAYROLL_ADDITION
        addpayrolladdition: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("payrolladdition", data);
        },
        updatepayrolladdition: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("payrolladdition", data.payrollAdditionId, data)
        },
        searchadditionById: function (id) {
            return $emerge.query("payrolladdition/search?employeeId=" + id);
        },
        getallAdditionType: function () {
            return $emerge.query("payrolladdition/AdditionType");
        },

        //--------PAYROLL_DEDUCTION
        addpayrollDeduction: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("payrolldeduction", data);
        },
        updatepayrollDeduction: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("payrolldeduction", data.payrollDeductionId, data)
        },
        searchDeductionById: function (id) {
            return $emerge.query("payrolldeduction/search?employeeId=" + id);
        },
        getalldeductiontype: function () {
            return $emerge.query("payrolldeduction/DeductionType");
        },

        //--------PAYROLL_OVERTIME
        addpayrollovertime: function (data) {
            data.userCreatedId = 1;
            data.payrollDetailId = 1;
            return $emerge.add("payrollovertime", data);
        }, updatepayrollovertime: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("payrollovertime", data.payrollOvertimeId, data)
        },
        searchovertimeById: function (id) {
            return $emerge.query("payrollovertime/search?employeeId=" + id);
        },
        //--------PAYROLL_DETAIL
        addpayrolldetail: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("payrolldetail", data);
        },
        getDetailsByID: function (id) {
            return $emerge.query("payrolldetail/" + id);
        },
        updatepayrolldetail: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("payrolldetail", data.payrollDetailId, data);
        },
        getPayrollDetailByID: function (id) {
            return $emerge.query("payrolldetail/search?employeeId=" + id);
        },
        getAllPayrollByEmployeeId: function (id) {
            return $emerge.query("payrolldetail/search?employeeId=" + id);
        },
        getByperiod: function (period, noWorkingDaysWeeek) {
            return $emerge.query("payrolldetail/noWorkingDaysOfMonth?period=" + period + "&noWorkingDaysWeeek=" + noWorkingDaysWeeek);
        },
        //CACULATOR
        getGrossSalary: function (id, baseSalary, noWorkingInMonth, noDayWorked, addition, overtime) {
            return $emerge.query("payrolldetail/" + id + "/grossSalary?baseSalary=" + baseSalary + "&noWorkingInMonth=" + noWorkingInMonth + "&noDayWorked=" + noDayWorked + "&addition=" + addition + "&overtime=" + overtime)
        },

        getgrossCPF: function (id, employeeId, grossSalary) {
            return $emerge.query("payrolldetail/" + id + "/grossCPF?employeeId=" + employeeId + "&grossSalary=" + grossSalary)
        },

        getEmployeeCPF: function (id, grossCPF, EmployeeCPF) {
            return $emerge.query("payrolldetail/" + id + "/EmployeeCPF?grossCPF=" + grossCPF + "&EmployeeCPF=" + EmployeeCPF)
        },

        getTotalDeduction: function (id, PayrollDeductionId, grossSalary, employeeCPF) {
            return $emerge.query("payrolldetail/" + id + "/TotalDeduction?PayrollDeductionId=" + PayrollDeductionId + "&grossSalary=" + grossSalary + "&employeeCPFAmount=" + employeeCPF)
        },

        getNetSalary: function (id, grossSalary, totaldeduction) {
            return $emerge.query("payrolldetail/" + id + "/netSalary?grossSalary=" + grossSalary + "&totaldeduction=" + totaldeduction)
        },

        getPaymentmode: function () {
            return $emerge.query("payrolldetail/PaymentMode")
        },

        getEmployerCPF: function (id, grossCPF, EmployerCPF) {
            return $emerge.query("payrolldetail/" + id + "/EmployerCPF?grossCPF=" + grossCPF + "&EmployerCPF=" + EmployerCPF)
        },

        //REPORT

        //-----------DETAIL_REPORT
        getPayrollDetailReport: function (period) {
            return $emerge.query("payrollDetailReport?period=" + period)
        },
        //-----------CPF_REPORT
        getPayrollEmployerCPFReport: function (period) {
            return $emerge.query("employerCPFReport?period=" + period)
        },
        getPayrollEmployerSDLReport: function (period) {
            return $emerge.query("employerSDLReport?period=" + period)
        },
        //-----------EMPLOYE_EDETAIL_REPORT
        getEmployeeDetailsReport: function (id) {
            return $emerge.query("employeeDetailReport/" + id)
        },

        //ADMIN

        //-----------ADDITION
        queryAditionType: function () {
            return $emerge.query("additionType")
        },
        queryAditionTypeByID: function (id) {
            return $emerge.query("additionType/" + id)
        },
        queryAditionTypeAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("additionType", data);
        },
        queryAditionTypeUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("additionType", data.additionTypeId, data)
        },
        deleteAT: function (id) {
            return $emerge.delete("additionType", id);
        },
        //-----------DEDUCTION
        queryDeductionType: function () {
            return $emerge.query("deductionType")
        },
        queryDeductionTypeByID: function (id) {
            return $emerge.query("deductionType/" + id)
        },
        queryDeductionTypeAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("deductionType", data);
        },
        queryDeductionTypeUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("deductionType", data.deductionTypeId, data)
        },
        deleteDT: function (id) {
            return $emerge.delete("deductionType", id);
        },
        //----------NATIONALITY
        queryNationality: function () {
            return $emerge.query("nationality")
        },
        queryNationalityByID: function (id) {
            return $emerge.query("nationality/" + id)
        },
        queryNationalityAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("nationality", data);
        },
        queryNationalityUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("nationality", data.nationalityId, data)
        },
        deleteNationality: function (id) {
            return $emerge.delete("nationality", id);
        },
        //-----------RACE
        queryRace: function () {
            return $emerge.query("race")
        },
        queryRaceByID: function (id) {
            return $emerge.query("race/" + id)
        },
        queryRaceAdd: function (data) {
            return $emerge.add("race", data);
        },
        queryRaceUpdate: function (data) {
            return $emerge.update("race", data.raceId, data)
        },
        deleteRace: function (id) {
            return $emerge.delete("race", id);
        },
        //-----------COMPANY
        querycompany: function () {
            return $emerge.query("Company")
        },
        querycompanyByID: function (id) {
            return $emerge.query("Company/" + id)
        },
        querycompanyAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("Company", data);
        },
        querycompanyUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("Company", data.companyId, data)
        },
        //------------LEAVE 
        queryLeaveType: function () {
            return $emerge.query("leavetype")
        },
        queryLeaveTypeByID: function (id) {
            return $emerge.query("leavetype/" + id)
        },
        queryLeaveTypeAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("leavetype", data);
        },
        queryLeaveTypeUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("leavetype", data.leaveTypeId, data)
        },
        deleteLeaveType: function (id) {
            return $emerge.delete("leavetype", id);
        },
        //------------Holiday 
        queryHoliday: function () {
            return $emerge.query("holiday")
        },
        queryHolidayByID: function (id) {
            return $emerge.query("holiday/" + id)
        },
        queryHolidayAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("holiday", data);
        },
        queryHolidayUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("holiday", data.holidayId, data)
        },
        deleteHoliday: function (id) {
            return $emerge.delete("holiday", id);
        },
        //---------religion
        queryReligion: function () {
            return $emerge.query("religion")
        },
        queryReligionByID: function (id) {
            return $emerge.query("religion/" + id)
        },
        queryReligionAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("religion", data);
        },
        queryReligionUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("religion", data.religionId, data)
        },
        deleteReligion: function (id) {
            return $emerge.delete("religion", id);
        },
        //---------cpfTable
        querycpfTable: function () {
            return $emerge.query("cpfTable")
        },
        querycpfTableByID: function (id) {
            return $emerge.query("cpfTable/" + id)
        },
        querycpfTableAdd: function (data) {
            data.userCreatedId = 1;
            return $emerge.add("cpfTable", data);
        },
        querycpfTableUpdate: function (data) {
            data.userCreatedId = 1;
            return $emerge.update("cpfTable", data.cpfTableId, data)
        },
        deletecpfTable: function (id) {
            return $emerge.delete("cpfTable", id);
        },
    };
    return EmployeeServiceBase;
});
var oDatatableDetails;
var oDatatableCPF;
var oDatatableSDL;
var oDatatableDetailsReport;
var oDatatable2;
var oDatatable3;
var oDatatable4;