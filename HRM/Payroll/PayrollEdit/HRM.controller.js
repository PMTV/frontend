
HRM.controller("PayrollAdditionController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {

    $scope.labelName = "Add";
    $scope.isAdd = false;

    $scope.departmentlist = {};
    employeeService.queryDepartment().success(function (data) {
        $scope.departmentlist = data;
    })
    $scope.employeelist = {};
    employeeService.query().success(function (data) {
        $scope.employeelist = data;
    })
    $scope.editE = function (id) {

        $scope.labelName = "Update";

        var tr = $('tr.tr' + id);
        var Id = $('td.tdId', tr).text().trim();
        var Name = $('td.tdName', tr).text().trim();
        $('input.txtEmployeeId').val(Id);
        $('input.txtEmployeeName').val(Name);

        $scope.payrolladditiondata = {};
        employeeService.searchadditionById(id).success(function (data) {
            $scope.payrolladditiondata = data;
            $('select.slAdditionType').val($scope.payrolladditiondata.additionType)
            $('input.tthidden').val($scope.payrolladditiondata.payrollAdditionId)

            $('input.txtAmountAddition').val($scope.payrolladditiondata.additionAmount)
            $('input.txtEmployeeId').val($scope.payrolladditiondata.employee.employeeId)
            $('input.txtEmployeeName').val($scope.payrolladditiondata.employee.firstName)

        }).error(function (error) {
            $scope.labelName = "Add";
            $('input.txtAmountAddition').val("");
            $('select.slAdditionType').val(1);
            $scope.isAdd = true;
        });

    };

    $scope.savePayrolAddition = function () {
        if (!$scope.EditForm.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        else {
            $scope.additionpayroll.AdditionType = $('select.slAdditionType option:selected').val();
            $scope.additionpayroll.employeeId = $('input.txtEmployeeId').val();

            if ($scope.isAdd) {

                employeeService.addpayrolladdition($scope.additionpayroll)
                .success(function (data) {
                    alert('Successfully');
                    $location.url('/Payroll');
                    $route.reload();
                })
                .error(function (d) {
                    alert($translate.instant('ALERT.FORM_ERROR'));
                });

            } else {
                $scope.additionpayroll.payrollAdditionId = $('input.tthidden').val();
                employeeService.updatepayrolladdition($scope.additionpayroll)
                .success(function (data) {
                    alert('Update Successfully');
                    $location.url('/Payroll');
                    $route.reload();
                })
                .error(function (d) {
                    alert($translate.instant('ALERT.FORM_ERROR'));
                });
            }
        }

    };
});

HRM.controller("PayrollDeductionController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {

    $scope.labelName = "Add";
    $scope.isAdd = false;

    $scope.departmentlist = {};
    employeeService.queryDepartment().success(function (data) {
        $scope.departmentlist = data;
    })
    $scope.employeelist = {};
    employeeService.query().success(function (data) {
        $scope.employeelist = data;
    })


    $scope.editE = function (id) {

        $scope.labelName = "Update";

        var tr = $('tr.tr' + id);
        var Id = $('td.tdDeduction_Id', tr).text().trim();
        var Name = $('td.tdDeduction_Name', tr).text().trim();
        $('input.txtEmployeeDeductionId').val(Id);
        $('input.txtEmployeeDeductionName').val(Name);

        $scope.payrolldeductiondata = {};

        employeeService.searchDeductionById(id).success(function (data, status) {

            $scope.payrolldeductiondata = data;
            $('select.sldeductionType').val($scope.payrolldeductiondata.deductionType)
            $('input.tthiddendeduction').val($scope.payrolldeductiondata.payrollDeductionId)

            $('input.txtAmountDeduction').val($scope.payrolldeductiondata.DeductionAmount)
            $('input.txtEmployeeDeductionId').val($scope.payrolldeductiondata.employee.employeeId)
            $('input.txtEmployeeDeductionName').val($scope.payrolldeductiondata.employee.firstName)

        }).error(function (error) {
            $scope.labelName = "Add";
            $('input.txtAmountDeduction').val("");
            $('select.sldeductionType').val(1);

            $scope.isAdd = true;

        });

    };

    $scope.insPayrolDeduction = function () {

        if (!$scope.DeductionEditForm.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        else {
            $scope.payrollDeduction = {};
            $scope.payrollDeduction.deductionType = $('select.sldeductionType option:selected').val();
            $scope.payrollDeduction.employeeId = $('input.txtEmployeeDeductionId').val();
            $scope.payrollDeduction.deductionAmount = $('input.txtAmountDeduction').val();
            if ($scope.isAdd) {

                employeeService.addpayrollDeduction($scope.payrollDeduction)
                .success(function (data) {
                    alert('Successfully');
                    $location.url('/Payroll');
                    //$route.reload();
                })
                .error(function (d) {
                    alert($translate.instant('ALERT.FORM_ERROR'));
                });

            } else {
                $scope.payrollDeduction.payrollDeductionId = $('input.tthiddendeduction').val();
                employeeService.updatepayrollDeduction($scope.payrollDeduction)
                .success(function (data) {
                    alert('Update Successfully');
                    $location.url('/Payroll');
                    //$route.reload();
                })
                .error(function (d) {
                    alert($translate.instant('ALERT.FORM_ERROR'));
                });
            }
        }
    };

    $scope.SearchEmployee = function () {
        alert("-----TO DO-----")
    }

});

HRM.controller("PayrollOvertimeController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {

    $scope.labelName = "Add";
    $scope.isAdd = false;

    $scope.departmentlist = {};
    employeeService.queryDepartment().success(function (data) {
        $scope.departmentlist = data;
    })
    $scope.employeelist = {};
    employeeService.query().success(function (data) {
        $scope.employeelist = data;
    })


    $scope.editE = function (id) {

        $scope.labelName = "Update";

        var tr = $('tr.tr' + id);
        var Id = $('td.tdOvertime_Id', tr).text().trim();
        var Name = $('td.tdOvertime_Name', tr).text().trim();
        $('input.txtEmployeeOvertimeId').val(Id);
        $('input.txtEmployeeOvertimeName').val(Name);

        $scope.payrollovertimedata = {};
        employeeService.searchovertimeById(id).success(function (data, status) {

            $scope.payrollovertimedata = data;
            $('input.txtEmployeeOvertimeAPH').val($scope.payrollovertimedata.amounPerHour)
            $('input.txtEmployeeOvertimeNOH').val($scope.payrollovertimedata.numberOfHours)
            $('input.tovertime').val($scope.payrollovertimedata.payrollOvertimeId)

            console.log($scope.payrollovertimedata.payrollOvertimeId);
            console.log($('input.tovertime').val());

        }).error(function (error) {
            $scope.labelName = "Add";
            $('input.txtEmployeeOvertimeAPH').val("");
            $('input.txtEmployeeOvertimeNOH').val("");

            $scope.isAdd = true;

        });

    };

    $scope.insPayrollovertime = function () {

        if (!$scope.overtimeEditForm.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        else {
            $scope.payrollovertime = {};
            $scope.payrollovertime.amounPerHour = $('input.txtEmployeeOvertimeAPH').val();
            $scope.payrollovertime.numberOfHours = $('input.txtEmployeeOvertimeNOH').val();
            $scope.payrollovertime.employeeId = $('input.txtEmployeeOvertimeId').val();

            if ($scope.isAdd) {
                employeeService.addpayrollovertime($scope.payrollovertime)
                .success(function (data) {
                    alert('Successfully');
                    $location.url('/Payroll');
                    //$route.reload();
                })
                .error(function (d) {
                    alert($translate.instant('ALERT.FORM_ERROR'));
                });

            } else {
                $scope.payrollovertime.payrollOvertimeId = $('input.tovertime').val();
                employeeService.updatepayrollovertime($scope.payrollovertime)
                .success(function (data) {
                    alert('Update Successfully');
                    $location.url('/Payroll');
                    //$route.reload();
                })
                .error(function (d) {
                    alert($translate.instant('ALERT.FORM_ERROR'));
                });
            }
        }

    };

    $scope.SearchEmployee = function () {
        alert("-----TO DO-----")
    }

});

HRM.controller("DetailPayrollController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {

    $scope.labelName = "Save";
    $scope.isAdd = false;

    $scope.employeelist = {};
    employeeService.query().success(function (data) {
        $scope.employeelist = data;
    })

    $scope.editE = function (id) {
        $scope.labelName = "Update";
        var tr = $('tr.tr' + id);
        var Id = $('td.tdDetail_Id', tr).text().trim();
        var Name = $('td.tdDetail_Name', tr).text().trim();
        var DepartmentID = $('td.tdDepartmentID', tr).text().trim();
        $('input.txtEmployeeDetailId').val(Id);
        $('input.txtEmployeeDetailName').val(Name);
        $('input.txtEmployeeDetailDepartment').val(DepartmentID);

        $scope.departmentName = {};
        

        $scope.additionAmountbyID = {};
        employeeService.searchadditionById(Id).success(function (data, status) {
            $scope.additionAmountbyID = data;
            $('input.txtAdditionPayroll').val($scope.additionAmountbyID.additionAmount);
        }).error(function (error) { $('input.txtAdditionPayroll').val("N/A") });
        $scope.deductionAmountbyID = {};
        employeeService.searchDeductionById(Id).success(function (data, status) {
            $scope.deductionAmountbyID = data;
            $('input.txtDeductionPayroll').val($scope.deductionAmountbyID.deductionAmount);
        }).error(function (error) { $('input.txtDeductionPayroll').val("N/A") });
        $scope.payrollovertimebyID = {};
        employeeService.searchovertimeById(Id).success(function (data, status) {
            $scope.payrollovertimebyID = data;
            $('input.txtOvertimePayroll').val($scope.payrollovertimebyID.amounPerHour * $scope.payrollovertimebyID.numberOfHours)
        }).error(function (error) { $('input.txtOvertimePayroll').val("N/A") });
        $scope.salaryByID = {};
        employeeService.searchemployeesalaryinfobyId(Id).success(function (data, status) {
            $scope.salaryByID = data;
            $('input.txtBasicSalary').val($scope.salaryByID.basicSalary)
            $('input.txtWDIM').val($scope.salaryByID.noOfWorkingDay)
        });


        $scope.payrolldetaildataLoad = {};
        employeeService.getPayrollDetailByID(Id).success(function (data, status) {
            $scope.payrolldetaildataLoad = data;
            $('input.DPeriod').val($scope.payrolldetaildataLoad.period);
            $('select.slPaymentMode').val($scope.payrolldetaildataLoad.paymentMode)
            $('input.hiddenIdDetail').val($scope.payrolldetaildataLoad.payrollDetailId)
            $('input.txtGrossSalary').val($scope.payrolldetaildataLoad.grossPay);
            $('input.txtNETSalary').val($scope.payrolldetaildataLoad.netPay);
            $('input.txtActualDays').val($scope.payrolldetaildataLoad.actualNoOfWorkingDaysInMonth);
        }).error(function (error) {
            $('select.slPaymentMode').val(0);
            $scope.labelName = "Save";
            $scope.isAdd = true;
        });

    }
    $scope.CaculatorPayroll = function () {
        id = $('input.txtEmployeeDetailId').val();
        baseSalary = $('input.txtBasicSalary').val();
        noWorkingInMonth = $('input.txtWDIM').val();
        noDayWorked = $('input.txtActualDays').val();
        addition = $('input.txtAdditionPayroll').val();
        overtime = $('input.txtOvertimePayroll').val();
        deduction = $('input.txtDeductionPayroll').val();

        $scope.GrossPay = {};
        employeeService.getGrossSalary(id, baseSalary, noWorkingInMonth, noDayWorked, addition, overtime).success(function (data, status) {
            $scope.GrossPay = data;
            $('input.txtGrossSalary').val(data);
            $scope.NetSalary = {};
            employeeService.getNetSalary(id, $scope.GrossPay, deduction).success(function (data, status) {
                $scope.NetSalary = data;
                $('input.txtNETSalary').val(data);
            });
        });
    }

    $scope.insDetail = function () {

        $scope.payrolldetaildata = {};
        $scope.payrolldetaildata.noOfWorkingDaysInMonth = $('input.txtWDIM').val();
        $scope.payrolldetaildata.actualNoOfWorkingDaysInMonth = $('input.txtActualDays').val();
        $scope.payrolldetaildata.actualBasicSalary = $('input.txtBasicSalary').val();
        $scope.payrolldetaildata.baseSalary = $('input.txtBasicSalary').val();
        $scope.payrolldetaildata.addition = $('input.txtAdditionPayroll').val();
        $scope.payrolldetaildata.deduction = $('input.txtDeductionPayroll').val();
        $scope.payrolldetaildata.overtime = $('input.txtOvertimePayroll').val();
        $scope.payrolldetaildata.grossPay = $('input.txtGrossSalary').val();
        $scope.payrolldetaildata.netPay = $('input.txtNETSalary').val();
        $scope.payrolldetaildata.employeeId = $('input.txtEmployeeDetailId').val();
        $scope.payrolldetaildata.period = $('input.DPeriod').val();
        $scope.payrolldetaildata.paymentMode = $('select.slPaymentMode option:selected').val();

        if ($scope.isAdd) {
            employeeService.addpayrolldetail($scope.payrolldetaildata)
                .success(function (data) {
                    alert('Successfully');
                    $location.url('/Payroll');
                    //$route.reload();
                })
                .error(function () {
                    console.log($scope.payrolldetaildata)
                    alert($translate.instant('ALERT.FORM_ERROR'));
                });
        } else {
            $scope.payrolldetaildata.payrollDetailId = $('input.hiddenIdDetail').val();
            employeeService.updatepayrolldetail($scope.payrolldetaildata)
               .success(function (data) {
                   alert('Successfully');
                   $location.url('/Payroll');
                   //$route.reload();
               })
               .error(function () {
                   console.log($scope.payrolldetaildata)
                   alert($translate.instant('ALERT.FORM_ERROR'));
               });
        }
    }
});

HRM.controller("SubmitPayrollController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {

});

HRM.controller('EditSubmitPayrollCtrl', function ($scope, $http, $routeParams, $location) {

    $scope.ApplyEditSubmitPayroll = function () {
        alert("------TODO------");
    };
    $scope.back = function () {
        $location.url('/Payroll');
    };

});

HRM.controller("ApprovePayrollController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {

})