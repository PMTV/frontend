HRM.controller('EmployeeListCtrl', function ($scope, $http, employeeService) {

    $scope.employeeTableData = null;
    var loadEmployee = function () {
        employeeService.query().success(function (data) {
            $scope.employeeTableData = data;
        })
    }
    $scope.deleteFn = function (employeeId) {
        employeeService.delete(employeeId)
            .success(function (data) {
                loadEmployee();
            })
            .error(function (error) {
                console.log("delete error");
            })
    };
    loadEmployee();
});

HRM.controller('EmployeeEditCtrl', function ($scope, $http, $route, $routeParams, $location, $filter, employeeService, errorDisplay) {


    $scope.departmentlist = {};
    employeeService.queryDepartment().success(function (data) {
        $scope.departmentlist = data;
    })

    $scope.employeegrouplist = {};
    employeeService.queryGroup().success(function (data) {
        $scope.employeegrouplist = data;
    })

    $scope.employee = {};
    $scope.employee.departmentID = $('select.slDepartment option:selected').val();
    $scope.employee.employeeStatus = $('select.slstatus option:selected').val();
    $scope.employee.employeeGroupId = $('select.slgroup option:selected').val();

    var employeeId = $routeParams.id;

    if (employeeId) {
        employeeService.get(employeeId)
            .success(function (data) {
                angular.copy(data, $scope.employee);
                $('select.slDepartment').val($scope.employee.departmentID)
                $('select.slstatus').val($scope.employee.employeeStatus)
                $('select.slgroup').val($scope.employee.employeeGroupId)
                $scope.employee.userId = 1;
                $scope.employee.userCreated = null;
            });
    }
    else {
    }

    //SALARY
    $scope.employeesalaryinfo = {};
    employeeService.searchemployeesalaryinfobyId(employeeId).success(function (data) {

        $scope.btnChange = "Update";
        $scope.employeesalaryinfo = data;
        $('select.slemployeepasstype').val($scope.employeesalaryinfo.employeePassType)
        $('select.slemployeeidentity').val($scope.employeesalaryinfo.employeeIdentity)
        $('input.hiddenId').val($scope.employeesalaryinfo.employeeSalaryInfoId)
    }).error(function (error) {
        $scope.isAdd = true;
        $scope.btnChange = "Save";
    })
    $scope.salary = {};
    $scope.isAdd = false;
    $scope.btnChange = "Save";
    var employeeId = $routeParams.id;
    if (employeeId) {
        employeeService.get(employeeId)
            .success(function (data) {
                angular.copy(data, $scope.salary);
            });
    }
    else {
    }
    //HANDLE
    $scope.saveEmployeeSalaryinfor = function () {

        $scope.submitted = true;
        $scope.employee.departmentID = $('select.slDepartment option:selected').val();
        $scope.employee.employeeStatus = $('select.slstatus option:selected').val();
        $scope.employee.employeeGroupId = $('select.slgroup option:selected').val();
        if (!$scope.myForm.$valid) {
            alert('Please check your data input');
            return false;
        }
        if (employeeId) {
            employeeService.update($scope.employee)
                .success(function (data) {
                    alert('Successfully');
                    $location.url('/employee');
                })
                .error(function (d) {
                    var errors = errorDisplay.show(d.modelState);
                    alert(errors);
                });
        }
        else {
            employeeService.add($scope.employee)
                .success(function (data) {
                    alert('Successfully');
                    $location.url('/employee');
                })
                .error(function (d) {
                    var errors = errorDisplay.show(d.modelState);
                    alert('Please check your data input');
                });
        }

        //SALARY
        $scope.submitted = true;
        if (!$scope.myForm.$valid) {
            alert('Please check your data input');
            return false;
        } else {
            $scope.employeesalaryinfo.employeePassType = $('select.slemployeepasstype option:selected').val();
            $scope.employeesalaryinfo.employeeIdentity = $('select.slemployeeidentity option:selected').val();
            $scope.employeesalaryinfo.datePerResidence = $("input.DPR").val();
            $scope.employeesalaryinfo.autoEmailPayslip = $("#ckauto").is(':checked');
            $scope.employeesalaryinfo.iscpfEntitled = $("#ckentitled").is(':checked')
            $scope.employeesalaryinfo.email = "dat@higheridentity.com";
            $scope.employeesalaryinfo.employeeId = $scope.salary.employeeId;
            if ($scope.isAdd) {
                employeeService.addsalary($scope.employeesalaryinfo)
                .success(function (data) {
                    $location.url('/employee');
                    $route.reload();
                })
                .error(function (d) {
                    alert('Please check your data input');
                    console.log($scope.employeesalaryinfo);
                });
            } else {
                $scope.employeesalaryinfo.employeeSalaryInfoId = $('input.hiddenId').val();
                $scope.employeesalaryinfo.employee = null;
                employeeService.updatesalary($scope.employeesalaryinfo)
                .success(function (data) {
                    $location.url('/employee');
                    $route.reload();
                })
                .error(function (d) {
                    alert('Please check your data input');
                    console.log($scope.employeesalaryinfo);
                });
            }
        }

    };

    $scope.back = function () {
        $location.url('/employee');
    };

});
