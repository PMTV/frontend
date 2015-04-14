HRM.controller('EmployeeListCtrl', function ($scope, $http, employeeService) {

    $scope.employeeTableData = null;
    var loadEmployee = function () {
        employeeService.getallemployee().success(function (data) {
            $scope.employeeTableData = data;
        })
    }
    $scope.deleteFn = function (employeeId) {
        employeeService.delete(employeeId)
            .success(function (data) {
                loadEmployee();
            })
            .error(function (e) {
                errorDisplay.show(e);
            })
    };

    loadEmployee();
});
HRM.controller('EmployeeEditCtrl', function ($scope, $http, $route, $routeParams, $location, $filter, $translate, employeeService, errorDisplay, Auth) {

    var employeeId = $routeParams.id;

    employeeService.getallemployee().success(function (data) {
        $scope.employeeListForJob = data;
    })
    employeeService.getPaymentmode().success(function (data) {
        $scope.PaymentmodeType = data;
    })
    employeeService.getemployeePassType().success(function (data) {
        $scope.employeePassType = data;
    })
    employeeService.getWorkerLevyType().success(function (data) {
        $scope.WorkerLevyType = data;
    })
    employeeService.queryDesignation().success(function (data, status) {
        $scope.DesignationList = data;
    })
    employeeService.queryRace().success(function (data) {
        $scope.Racelist = data;
    })
    employeeService.queryReligion().success(function (data) {
        $scope.ReligionList = data;
    })
    employeeService.querycompanyByID(1).success(function (data, status) {
        $scope.CompanyObj = data;
    })
    employeeService.queryGroup().success(function (data) {
        $scope.employeegrouplist = data;
    })
    employeeService.queryEmployeeStatus().success(function (data) {
        $scope.dpemployeeStatus = data;
    })
    employeeService.queryDepartment().success(function (data) {
        $scope.departmentlist = data;
    });
    employeeService.queryEmployeeGender().success(function (data) {
        $scope.GenderList = data;
    })
    employeeService.queryReligion().success(function (data) {
        $scope.ReliList = data;
    })

    //EMPLOYEE
    $scope.employee = {};

    employeeService.getEmployeeImage(employeeId).success(function (data) {
        $scope.PhotoImg = data.replace(/\"/g, '')
    });

    if (employeeId) {
        employeeService.get(employeeId)
            .success(function (data) {
                angular.copy(data, $scope.employee);
                $scope.employee.userId = 1;
                $scope.employee.userCreated = null;
                employeeService.queryDepartmentByID($scope.employee.departmentId).success(function (data) {
                    $scope.deparName = data;
                });
                employeeService.queryGroupByID($scope.employee.employeeGroupId).success(function (data) {
                    $scope.GroupName = data;
                });
            });
    }

    //SALARY
    $scope.employeesalaryinfo = {};
    employeeService.searchemployeesalaryinfobyId(employeeId).success(function (data) {
        $scope.btnChange = "Update";
        $scope.employeesalaryinfo = data;
    }).error(function (e) {
        $scope.isAdd = true;
        $scope.btnChange = "Save";
        errorDisplay.show(e);
    })
    $scope.salary = {}

    employeeService.get(employeeId).success(function (data) {
        employeeService.getEmployeeCPFContribution(data.birthday).success(function (data) {
            $scope.employeesalaryinfo.employeeCPF = data
        });
        employeeService.getEmployerCPFContribution(data.birthday).success(function (data) {
            $scope.employeesalaryinfo.employerCPF = data
        });
    });

    $scope.isAdd = false;
    $scope.btnChange = "Save";
    //GET CPF
    var employeeId = $routeParams.id;
    if (employeeId) {
        employeeService.get(employeeId)
            .success(function (data) {
                angular.copy(data, $scope.salary);
            });
    }
    else {
    }




    //EMPLOYEE CONTACT
    $scope.employeeContactInfo = {};
    employeeService.getContactByEmloyeeId(employeeId).success(function (data) {
        $scope.btnChange = "Update";
        $scope.employeeContactInfo = data;
    }).error(function (e) {
        $scope.isAdd = true;
        $scope.btnChange = "Save";
        errorDisplay.show(e);
    })
    //EMPLOYEE JOB
    $scope.employeeJobInfo = {};
    employeeService.getEmployeeJobInfoById(employeeId).success(function (data) {
        $scope.btnChange = "Update";
        $scope.employeeJobInfo = data;
        $scope.LSchange = function () {
            var id = $scope.employeeJobInfo.leaveSuppervisorId;
            var emp = $.grep($scope.employeeListForJob, function (e) { return e.employeeId == id; })[0];
            $scope.employeeJobInfo.fullnameLS = emp.firstName + " " + emp.lastName
        };
        $scope.CSchange = function () {
            var id = $scope.employeeJobInfo.claimSuppervisorId;
            var emp = $.grep($scope.employeeListForJob, function (e) { return e.employeeId == id; })[0];
            $scope.employeeJobInfo.fullnameCS = emp.firstName + " " + emp.lastName
        };
        employeeService.get($scope.employeeJobInfo.leaveSuppervisorId).success(function (data) {
            $scope.employeeJobInfo.fullnameLS = data.firstName + " " + data.lastName;
        })
        employeeService.get($scope.employeeJobInfo.claimSuppervisorId).success(function (data) {
            $scope.employeeJobInfo.fullnameCS = data.firstName + " " + data.lastName;
        })

    })
        .error(function (e) {
            errorDisplay.show(e);
            $scope.LSchange = function () {
                var id = $scope.employeeJobInfo.leaveSuppervisorId;
                var emp = $.grep($scope.employeeListForJob, function (e) { return e.employeeId == id; })[0];
                $scope.employeeJobInfo.fullnameLS = emp.firstName + " " + emp.lastName;
            };
            $scope.CSchange = function () {
                var id = $scope.employeeJobInfo.claimSuppervisorId;
                var emp = $.grep($scope.employeeListForJob, function (e) { return e.employeeId == id; })[0];
                $scope.employeeJobInfo.fullnameCS = emp.firstName + " " + emp.lastName

            };
            employeeService.get($scope.employeeJobInfo.leaveSuppervisorId).success(function (data) {
                $scope.employeeJobInfo.fullnameLS = data.firstName + " " + data.lastName;
            })
            employeeService.get($scope.employeeJobInfo.claimSuppervisorId).success(function (data) {
                $scope.employeeJobInfo.fullnameCS = data.firstName + " " + data.lastName;
            })
            $scope.isAdd = true;
            $scope.btnChange = "Save";
        })
    //BANK INFO
    $scope.BankInfo = {};
    employeeService.getEmployeeBankInfo(employeeId).success(function (data) {
        $scope.BankInfo = data;
    }).error(function (error) {
        $scope.BankInfo.paymentMode = "";
        $scope.isAdd = true;
    })
    //FOREIGN WORKER
    $scope.foreignworker = {};
    employeeService.getEmployeeForeignWorker(employeeId).success(function (data) {
        $scope.foreignworker = data;
    }).error(function (error) {
        $scope.isAdd = true;
    })
    //LEAVE INFO
    $scope.LeaveInfoList = 0
    employeeService.queryLeaveType().success(function (data) {
        $scope.LeaveTypeList = data
    })
    $scope.getList = function () {
        employeeService.getAllLeaveInfoById($scope.YearInfo, employeeId).success(function (data) {
            $scope.LeaveInfoList = data
        })
    }
    var loadlist = function () {
        employeeService.getAllLeaveInfoById($scope.YearInfo, employeeId).success(function (data) {
            $scope.LeaveInfoList = data
        })
    }
    $scope.getCYL = function () {
        employeeService.queryLeaveTypeByID($scope.leaveTypeId).success(function (data) {
            $scope.CAL = data.cal
        })
    }
    $scope.addLeaveInfo = function () {
        $scope.leaveinfo = {}
        $scope.leaveinfo.leaveTypeId = $scope.leaveTypeId
        $scope.leaveinfo.cyl = 0;
        $scope.leaveinfo.employeeId = employeeId
        $scope.leaveinfo.year = $scope.YearInfo;
        console.log($scope.leaveinfo)
        employeeService.queryLeaveInfoAdd($scope.leaveinfo).success(function (data) {
            alert("Add Successfully")
            loadlist()
        }).error(function () {
            alert("Please check your data input")
        })
    }

    $scope.removeLeaveItem = function (employeeLeaveInfoId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteLeaveInfo(employeeLeaveInfoId).success(function (data) {
                alert('Remove successfully.');
                loadlist()
            }).error(function () {
                alert("Could not Delete ! \nThis value is used in other areas.")
            })
        }
    }

    //Employee Upload File
    $scope.uploadCertification = function () {
        var file = document.getElementById('certi').files[0],
        r = new FileReader();
        var uploadUrl = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/certification';
        employeeService.PostEmployeeFile(file, uploadUrl)
            .success(function (data, status) {
                alert('successfully.');
            }).error(function (data, status) {
                alert('please Select Certification file first.')
            })
    }
    $scope.DownloadCertification = function () {
        $scope.method = 'GET'
        $scope.getKeyUrl = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/KeyDownload'
        $http({ method: $scope.method, url: $scope.getKeyUrl })
            .success(function (data, status) {
                $scope.codeDowload = data.replace(/\"/g, '')
                $scope.url = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/certification?keydownload=' + $scope.codeDowload
                $http({ method: $scope.method, url: $scope.url })
                    .success(function (data, status) {
                        $scope.method = 'GET'
                        $scope.getKeyUrl = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/KeyDownload'
                        $http({ method: $scope.method, url: $scope.getKeyUrl })
                            .success(function (data, status) {
                                $scope.codeDowload = data.replace(/\"/g, '')
                                $scope.url = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/certification?keydownload=' + $scope.codeDowload
                                window.location.href = $scope.url
                            }).error(function (data, status) {
                                alert(status)
                            })
                    }).error(function (status) {
                        alert("File Not Found")
                    })
            }).error(function (data, status) {
                alert(status)
            })
    }
    $scope.uploadResume = function () {
        var file = document.getElementById('resume').files[0],
         r = new FileReader();
        var uploadUrl = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/resume';
        employeeService.PostEmployeeFile(file, uploadUrl)
            .success(function (data, status) {
                alert('successfully.');
            }).error(function (data, status) {
                alert('please Select Resume file to Upload.')
            })
    }
    $scope.DownloadResume = function () {
        $scope.method = 'GET'
        $scope.getKeyUrl = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/KeyDownload'
        $http({ method: $scope.method, url: $scope.getKeyUrl })
            .success(function (data, status) {
                $scope.codeDowload = data.replace(/\"/g, '')
                $scope.url = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/resume?keydownload=' + $scope.codeDowload
                $http({ method: $scope.method, url: $scope.url })
                    .success(function (data, status) {
                        $scope.method = 'GET'
                        $scope.getKeyUrl = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/KeyDownload'
                        $http({ method: $scope.method, url: $scope.getKeyUrl })
                            .success(function (data, status) {
                                $scope.codeDowload = data.replace(/\"/g, '')
                                $scope.url = employeeService.fileURL() + 'employeeFileUpload/' + employeeId + '/resume?keydownload=' + $scope.codeDowload
                                window.location.href = $scope.url
                            }).error(function (data, status) {
                                alert(status)
                            })
                    }).error(function (status) {
                        alert("File Not Found")
                    })
            }).error(function (data, status) {
                alert(status)
            })

    }

    $scope.UploadImage = function () {
        var file = document.getElementById('urlPhoto').files[0],
         r = new FileReader();
        var uploadUrl = employeeService.fileURL() + 'employee/' + employeeId + '/Image';
        employeeService.PostEmployeeImgFile(file, uploadUrl)
            .success(function (data, status) {
                alert('Upload Image Successfully.');
                $route.reload();
            }).error(function (data, status) {
                alert('please Select file to Upload.')
            })
    }

    //-------------------------------------------
    //HANDLE
    $scope.saveEmployeeInfomation = function () {
        //EMPLOYEE

        $scope.submitted = true;
        if (!$scope.EmployeeInfo.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        if (employeeId) {
            if (!$scope.EmployeeInfo.$valid || !$scope.myForm.$valid) {
                alert($translate.instant('ALERT.FORM_ERROR'));
                return false;
            }
            employeeService.update($scope.employee)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                    $location.url('employee');

                }).error(function (e) {
                    errorDisplay.show(e);
                })
        }
        else {
            $scope.employee.companyId = 1;
            employeeService.add($scope.employee)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('/employee');
                })
                .error(function (e) {
                    errorDisplay.show(e);
                });
        }
        //SALARY
        $scope.employeesalaryinfo.employeeId = $scope.salary.employeeId;
        var ESI = $scope.employeesalaryinfo.employeeSalaryInfoId
        if (ESI == null) {
            employeeService.addsalary($scope.employeesalaryinfo)
            .success(function (data) {
                alert($translate.instant('ALERT.CREATED'));
                //alert("Successfully");
            })
        } else {
            $scope.employeesalaryinfo.employee = null;
            employeeService.updatesalary($scope.employeesalaryinfo)
            .success(function (data) {
            })
        };
        //CONTACT INFO
        $scope.employeeContactInfo.employeeId = $routeParams.id;
        $scope.employeeContactInfo.employee = null;
        var ECI = $scope.employeeContactInfo.employeeContactInfoId;

        if (ECI == null) {
            employeeService.addEmployeeContact($scope.employeeContactInfo)
           .success(function (data) {
               alert($translate.instant('ALERT.CREATED'));
               //alert("Successfully");
           })
        }
        else {
            employeeService.updateEmployeeContact($scope.employeeContactInfo)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                })
        };

        //JOB INFO
        $scope.employeeJobInfo.employeeId = $routeParams.id;
        $scope.employeeJobInfo.birthDate = $scope.employeeJobInfo.joiningDate;
        $scope.employeeJobInfo.payrollMgnLevel = "lv1";

        var EJI = $scope.employeeJobInfo.employeeJobInfoId;
        if (EJI == null) {
            employeeService.addEmployeeJob($scope.employeeJobInfo)
           .success(function (data) {
               $location.url('/employee');
               $route.reload();
           })
        }
        else {
            $scope.employeeJobInfo.leaveSuppervisor = null;
            $scope.employeeJobInfo.employee = null;
            $scope.employeeJobInfo.claimSuppervisor = null;

            employeeService.updateEmplyeeJob($scope.employeeJobInfo)
                .success(function (data) {
                    $location.url('/employee');
                })
        }
        //BANK
        var idBankInfo = $scope.BankInfo.employeeBankInfoId
        $scope.BankInfo.employeeId = $routeParams.id;
        if (idBankInfo == null) {
            employeeService.addBankInfo($scope.BankInfo)
            .success(function (data) {
                $route.reload();
            })
        } else {
            $scope.BankInfo.employee = null;
            employeeService.updateBankInfo($scope.BankInfo)
            .success(function (data) {
                $route.reload();
            })
        };
        //FOREIGN WORKER
        var idFW = $scope.foreignworker.employeeForeignWorkerId
        $scope.foreignworker.employeeId = $routeParams.id;
        if (idFW == null) {
            employeeService.addEmployeeForeignWorker($scope.foreignworker)
            .success(function (data) {
                $route.reload();
            })
        } else {
            $scope.foreignworker.employee = null;
            employeeService.updateEmployeeForeignWorker($scope.foreignworker)
            .success(function (data) {
                $route.reload();
            })
        };
    }
    $scope.back = function () {
        $location.url('/employee');
    };
});
HRM.controller('employeeStatusController', function ($scope, $http, $location, $route, employeeService) {

    $scope.isAdd = false;
    $scope.labelName = "Add";

    $scope.employeeStatusList = []
    employeeService.queryEmployeeStatus().success(function (data, status) {
        $scope.employeeStatusList = data;
    })

    var loadlist = function () {
        employeeService.queryEmployeeStatus().success(function (data, status) {
            $scope.employeeStatusList = data;
        })
    }

    $scope.editES = function (e) {
        $scope.labelName = "Update";
        $scope.EmployeeStatusListLoad = {}
        employeeService.queryEmployeeStatusByID(e.employeeStatusId).success(function (data, status) {
            $scope.EmployeeStatusListLoad = data;
        }).error(function (error) {
            errorDisplay.show(e);
            $scope.isAdd = true;
        });
    };
    $scope.handleEmployeeStatus = function () {
        $scope.submitted = true;
        if (!$scope.employeeStatus.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.EmployeeStatusListLoad.employeeStatusId
        if (id != null) {
            employeeService.queryEmployeeStatusUpdate($scope.EmployeeStatusListLoad)
           .success(function (data) {
               alert($translate.instant('ALERT.UPDATED'));
               $scope.labelName = "Add";
               loadlist();
               $scope.EmployeeStatusListLoad = {}
           })
          .error(function (e) {
              errorDisplay.show(e);
          });
        }
        else {
            employeeService.queryEmployeeStatusAdd($scope.EmployeeStatusListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.EmployeeStatusListLoad = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }
    $scope.deleteEmployeeStatus = function (employeeStatusId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteEmployeeStatus(employeeStatusId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };


})
HRM.controller('employeeGroupController', function ($scope, $http, $location, $route, employeeService) {

    $scope.isAdd = false;
    $scope.labelName = "Add";

    $scope.employeeGroupList = {}
    employeeService.queryGroup().success(function (data, status) {
        $scope.employeeGroupList = data;
    })

    var loadlist = function () {
        employeeService.queryGroup().success(function (data, status) {
            $scope.employeeGroupList = data;
        })
    }
    $scope.editG = function (e) {
        $scope.labelName = "Update";
        $scope.EmployeeGroupListLoad = {}
        employeeService.queryGroupByID(e.employeeGroupId).success(function (data, status) {
            $scope.EmployeeGroupListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleEmployeeGroup = function () {
        $scope.submitted = true;
        if (!$scope.employeegroup.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.EmployeeGroupListLoad.employeeGroupId
        if (id != null) {
            employeeService.queryGroupUpdate($scope.EmployeeGroupListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.EmployeeGroupListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryGroupAdd($scope.EmployeeGroupListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.EmployeeGroupListLoad = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }
    $scope.deleteEmployeeGroup = function (employeeGroupId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteGroup(employeeGroupId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };
})
HRM.controller("PayrollAdditionController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {
    $scope.labelName = "Add";
    $scope.isAdd = false;
    employeeService.queryDepartment().success(function (data) {
        $scope.departmentlist = data;
    })
    employeeService.getallemployee().success(function (data) {
        $scope.employeelist = data;
    })
    employeeService.queryAditionType().success(function (data) {
        $scope.allAdditionType = data;
    })
    $scope.editE = function (e) {
        $scope.labelName = "Update";
        $scope.payrolladditiondata = {};
        employeeService.searchadditionById(e.employeeId).success(function (data) {
            $scope.payrolladditiondata = data;
            $scope.payrolladditiondata.employeeId = e.employeeId;
            $scope.payrolladditiondata.firstName = e.firstName;
        }).error(function (error) {
            $scope.payrolladditiondata.employeeId = e.employeeId;
            $scope.payrolladditiondata.firstName = e.firstName;
            $scope.labelName = "Add";
            $scope.isAdd = true;
        });
    };
    $scope.savePayrolAddition = function () {
        if (!$scope.EditForm.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        if ($scope.isAdd) {
            employeeService.addpayrolladdition($scope.payrolladditiondata)
            .success(function (data) {
                alert('Successfully');
                $location.url('/Payroll');
            })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        } else {
            $scope.payrolladditiondata.employee = null;
            employeeService.updatepayrolladdition($scope.payrolladditiondata)
            .success(function (data) {
                alert('Update Successfully');
                $location.url('/Payroll');
                $scope.payrolladditiondata.additionType = "";
            })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }
});
HRM.controller("PayrollDeductionController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {
    $scope.labelName = "Add";
    $scope.isAdd = false;
    employeeService.queryDepartment().success(function (data) {
        $scope.departmentlist = data;
    })
    employeeService.getallemployee().success(function (data) {
        $scope.employeelist = data;
    })
    employeeService.queryDeductionType().success(function (data) {
        $scope.alldeductiontype = data;
    })
    $scope.editE = function (e) {
        $scope.labelName = "Update";
        $scope.payrolldeductiondata = {};
        employeeService.searchDeductionById(e.employeeId).success(function (data, status) {
            $scope.payrolldeductiondata = data;
            $scope.payrolldeductiondata.employeeId = e.employeeId;
            $scope.payrolldeductiondata.firstName = e.firstName;
        }).error(function (error) {
            $scope.payrolldeductiondata.employeeId = e.employeeId;
            $scope.payrolldeductiondata.firstName = e.firstName;
            $scope.labelName = "Add";
            $scope.isAdd = true;
        });
    };
    $scope.insPayrolDeduction = function () {
        if (!$scope.DeductionEditForm.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        $scope.payrollDeduction = {};
        if ($scope.isAdd) {
            employeeService.addpayrollDeduction($scope.payrolldeductiondata)
            .success(function (data) {
                alert('Successfully');
                $location.url('/Payroll');
            })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        } else {
            $scope.payrolldeductiondata.employee = null;
            employeeService.updatepayrollDeduction($scope.payrolldeductiondata)
            .success(function (data) {
                alert('Update Successfully');
                $location.url('/Payroll');
            })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    };
    $scope.SearchEmployee = function () {
        alert("-----TO DO-----")
    }

});
HRM.controller("PayrollOvertimeController", function ($scope, $http, $location, $route, employeeService, errorDisplay) {
    $scope.labelName = "Add";
    $scope.isAdd = false;
    employeeService.queryDepartment().success(function (data) {
        $scope.departmentlist = data;
    })
    employeeService.getallemployee().success(function (data) {
        $scope.employeelist = data;
    })
    $scope.editE = function (e) {
        $scope.labelName = "Update";
        $scope.payrollovertimedata = {};
        employeeService.searchovertimeById(e.employeeId).success(function (data, status) {
            $scope.payrollovertimedata = data;
            $scope.payrollovertimedata.employeeId = e.employeeId;
            $scope.payrollovertimedata.firstName = e.firstName;
        }).error(function (error) {
            $scope.payrollovertimedata.employeeId = e.employeeId;
            $scope.payrollovertimedata.firstName = e.firstName;
            $scope.labelName = "Add";
            $scope.isAdd = true;

        });

    };
    $scope.insPayrollovertime = function () {
        if (!$scope.overtimeEditForm.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        $scope.payrollovertime = {};
        var x = $scope.payrollovertimedata.payrollOvertimeId;
        if ($scope.isAdd && x == null) {
            employeeService.addpayrollovertime($scope.payrollovertimedata)
            .success(function (data) {
                alert('Successfully');
                $location.url('/Payroll');
            })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });

        } else {
            $scope.payrollovertimedata.employee = null;
            employeeService.updatepayrollovertime($scope.payrollovertimedata)
            .success(function (data) {
                alert('Update Successfully');
                $location.url('/Payroll');
            })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    };
    $scope.SearchEmployee = function () {
        alert("-----TO DO-----")
    }
});
HRM.controller("DetailPayrollController", function ($scope, $http, $location, $route, employeeService, errorDisplay, $filter) {

    $scope.employeelist = {};
    $scope.payrollDetailData = {};
    $scope.payrolldetaildataLoad = {}
    $scope.employeeId = null;

    employeeService.getallemployee().success(function (data) {
        $scope.employeelist = data;
    })
    $scope.check = false
    employeeService.getPaymentmode().success(function (data) {
        $scope.PaymentmodeType = data;
    })
    //click Edit Grid
    $scope.editE = function (e) {
        $scope.check = false
        $scope.departmentName = {}
        $scope.employeeId = e.employeeId;
        $scope.firstName = e.firstName;

        employeeService.queryDepartmentByID(e.departmentId).success(function (data, status) {
            $scope.departmentName = data;
        });

        employeeService.getAllPayrollByEmployeeId($scope.employeeId).success(function (data, status) {
            $scope.CheckRecordPeriod = data;
        })
        $scope.salaryDetail = {}
        employeeService.searchemployeesalaryinfobyId($scope.employeeId).success(function (data) {
            $scope.salaryDetail = data;
            $scope.payrolldetaildataLoad.sdlContribution = data.sdlContribution
            $scope.payrolldetaildataLoad.baseSalary = data.basicSalary
        }).error(function () {
            alert("Please Update Employee Salary !")
        })

        $scope.payrolldetaildataLoad = {}
        employeeService.searchadditionById(e.employeeId).success(function (data) {
            $scope.payrolldetaildataLoad.addition = data.additionAmount;
        }).error($scope.payrolldetaildataLoad.addition = 0)

        $scope.deductionPoint = {}
        employeeService.searchDeductionById(e.employeeId).success(function (data) {
            $scope.deductionPoint = data;
            $scope.payrolldetaildataLoad.deduction = data.deductionAmount;
        }).error($scope.payrolldetaildataLoad.deduction = 0)
        employeeService.searchovertimeById(e.employeeId).success(function (data) {
            $scope.payrolldetaildataLoad.overtime = data.numberOfHours * data.amounPerHour;
        }).error($scope.payrolldetaildataLoad.overtime = 0)
    }

    $scope.getallDetailOfIdcurrent = function () {
        $scope.AllpayrollById = []
        employeeService.getAllPayrollByEmployeeId($scope.employeeId).success(function (data, status) {
            if (data.length > 0 && $scope.check == true) {
                $scope.payrollDetailId = data[0].payrollDetailId;
                $scope.AllpayrollById = data;
                $scope.getByperiod();
            } else {
                $scope.payrolldetaildataLoad.actualNoOfWorkingDaysInMonth = '';
                $scope.payrolldetaildataLoad.grossPay = '';
                $scope.payrolldetaildataLoad.grossPayCPF = '';
                $scope.payrolldetaildataLoad.netPay = '';
                $scope.payrolldetaildataLoad.employeeCPFAmount = '';
                $scope.payrolldetaildataLoad.employerCPFAmount = '';
                $scope.payrolldetaildataLoad.totalDeduction = '';
                $scope.payrolldetaildataLoad.paymentMode = "";
            }
        });


    }
    $scope.getByperiod = function () {
        $scope.payrolldetaildataLoad = []
        employeeService.getDetailsByID($scope.payrollDetailId).success(function (data) {
            $scope.payrolldetaildataLoad = data
            $scope.payrolldetaildataLoad.baseSalary = '';
            $scope.salaryDetail = {}
            employeeService.searchemployeesalaryinfobyId($scope.employeeId).success(function (data) {
                $scope.salaryDetail = data;
                $scope.payrolldetaildataLoad.sdlContribution = data.sdlContribution
                $scope.payrolldetaildataLoad.baseSalary = data.basicSalary
            }).error(function () {
                alert("Please Update Employee Salary !")
            })
        })
    }

    $scope.CaculatorPayroll = function () {
        id = $scope.employeeId;
        baseSalary = $scope.payrolldetaildataLoad.baseSalary;
        noWorkingInMonth = $scope.payrolldetaildataLoad.noOfWorkingDaysInMonth;
        noDayWorked = $scope.payrolldetaildataLoad.actualNoOfWorkingDaysInMonth;
        addition = $scope.payrolldetaildataLoad.addition;
        overtime = $scope.payrolldetaildataLoad.overtime;
        deduction = $scope.payrolldetaildataLoad.deduction;

        employeeService.getGrossSalary(id, baseSalary, noWorkingInMonth, noDayWorked, addition, overtime)
            .success(function (data, status) {
                $scope.GrossPay = data;
                $scope.payrolldetaildataLoad.grossPay = data;

                employeeService.getgrossCPF(id, $scope.salaryDetail.employeeId, data)
                    .success(function (data) {
                        $scope.payrolldetaildataLoad.grossPayCPF = data

                        employeeService.getEmployeeCPF(id, data, $scope.salaryDetail.employeeCPF)
                            .success(function (data) {
                                $scope.payrolldetaildataLoad.employeeCPFAmount = data

                                employeeService.getTotalDeduction(id, $scope.deductionPoint.payrollDeductionId, $scope.payrolldetaildataLoad.grossPay, data)
                                    .success(function (data, status) {

                                        $scope.payrolldetaildataLoad.totalDeduction = data;
                                        employeeService.getNetSalary(id, $scope.GrossPay, data)
                                            .success(function (data, status) {

                                                $scope.NetSalary = data;
                                                $scope.payrolldetaildataLoad.netPay = data
                                            })
                                    })
                                    .error(function () { alert("Not enough information to Calculate \"Total Deduction\".") })

                                employeeService.getEmployerCPF(id, $scope.payrolldetaildataLoad.grossPayCPF, $scope.salaryDetail.employerCPF)
                                    .success(function (data) {
                                        $scope.payrolldetaildataLoad.employerCPFAmount = data
                                    })
                            })
                    })
            });
    }
    $scope.insDetail = function () {

        $scope.payrolldetaildataLoad.employeeId = $scope.employeeId


        employeeService.addpayrolldetail($scope.payrolldetaildataLoad)
            .success(function (data) {
                alert('Successfully');
                $location.url('/Payroll');
            })
            .error(function () {
                alert("Period is existed OR Your Data Input incorrect ! ");
            })
    }
    $scope.updateDetail = function () {
        $scope.payrolldetaildataLoad.employee = null;
        employeeService.updatepayrolldetail($scope.payrolldetaildataLoad)
           .success(function (data) {
               alert('Successfully');
               $location.url('/Payroll');
               $scope.getallDetailOfIdcurrent();
           })
           .error(function () {
               alert("Period is existed OR Your Data Input incorrect !");
           });
    }
});
HRM.controller("payrollDetailReportController", function ($scope, $http, $location, $route, employeeService, $filter) {

    $scope.detailsTableData = null;
    $scope.searByperiod = function () {

        if ($scope.period) {
            var loaddetails = function () {
                $scope.loading = true;
                employeeService.getPayrollDetailReport($scope.period).success(function (data, status) {
                    $scope.detailsTableData = data;
                })
                    .finally(function () {
                        $scope.loading = false;
                    })
            }
        }
        loaddetails();
    }
})
HRM.controller("payrollEmployerReportController", function ($scope, $http, $location, $route, employeeService, $filter) {
    $scope.CPFTableData = null;
    $scope.searByperiodCPF = function () {
        if ($scope.periodCPF) {
            var LoadCPF = function () {
                employeeService.getPayrollEmployerCPFReport($scope.periodCPF).success(function (data, status) {
                    $scope.CPFTableData = data;
                })
            }
        }
        LoadCPF();
    }
    //SDL
    $scope.SDLTableData = null;
    $scope.searByperiodSDL = function () {
        if ($scope.periodSDL) {
            var LoadSDL = function () {
                employeeService.getPayrollEmployerSDLReport($scope.periodSDL).success(function (data, status) {
                    $scope.SDLTableData = data;
                })
            }
        }
        LoadSDL();
    }
})
HRM.controller('EmployeeListPayrollCtrl', function ($scope, $http, employeeService) {
    $scope.employeeTableData = null;
    var loadEmployee = function () {
        employeeService.getallemployee().success(function (data) {
            $scope.employeeTableData = data;
        })
    }
    loadEmployee();
    $scope.employee2TableData = null;
    var loadEmployee2 = function () {
        employeeService.getallemployee().success(function (data) {
            $scope.employee2TableData = data;
        })
    }
    loadEmployee2();
    $scope.employee3TableData = null;
    var loadEmployee3 = function () {
        employeeService.getallemployee().success(function (data) {
            $scope.employee3TableData = data;
        })
    }
    loadEmployee3();
    $scope.employee4TableData = null;
    var loadEmployee4 = function () {
        employeeService.getallemployee().success(function (data) {
            $scope.employee4TableData = data;
        })
    }
    loadEmployee4();
});
HRM.controller("AdditionTypeController", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.additionTypeList = []
    employeeService.queryAditionType().success(function (data, status) {
        $scope.additionTypeList = data;
    })
    $scope.editE = function (e) {
        $scope.labelName = "Update";
        $scope.additionTypeListLoad = {}
        employeeService.queryAditionTypeByID(e.additionTypeId).success(function (data, status) {
            $scope.additionTypeListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };

    var loadlist = function () {
        employeeService.queryAditionType().success(function (data, status) {
            $scope.additionTypeList = data;
        })
    }
    $scope.handleAdditionType = function () {
        $scope.submitted = true;
        if (!$scope.addition.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var y = $scope.additionTypeListLoad.additionTypeId
        if (y != null) {
            $scope.labelName = "Update"
            employeeService.queryAditionTypeUpdate($scope.additionTypeListLoad)
                .success(function (data) {
                    alert('Successfully');
                    $scope.labelName = "Add";
                    loadlist();
                    $scope.additionTypeListLoad = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
        else {
            employeeService.queryAditionTypeAdd($scope.additionTypeListLoad)
             .success(function (data) {
                 alert('Successfully');
                 $scope.labelName = "Add";
                 loadlist();
                 $scope.additionTypeListLoad = {}
             })
         .error(function (d) {
             alert($translate.instant('ALERT.FORM_ERROR'));
         });
        }
    }


    $scope.deleteFn = function (additionTypeId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteAT(additionTypeId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };


})
HRM.controller("DeductionTypeController", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.DeductionTypeList = []
    employeeService.queryDeductionType().success(function (data, status) {
        $scope.DeductionTypeList = data;
    })

    var loadlist = function () {
        employeeService.queryDeductionType().success(function (data, status) {
            $scope.DeductionTypeList = data;
        })
    }

    $scope.editE = function (e) {
        $scope.labelName = "Update";
        $scope.DeductionTypeListLoad = {}
        employeeService.queryDeductionTypeByID(e.deductionTypeId).success(function (data, status) {
            $scope.DeductionTypeListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleDeductionType = function () {
        $scope.submitted = true;
        if (!$scope.deduction.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var x = $scope.DeductionTypeListLoad.deductionTypeId
        if (x != null) {
            employeeService.queryDeductionTypeUpdate($scope.DeductionTypeListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.DeductionTypeListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryDeductionTypeAdd($scope.DeductionTypeListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.DeductionTypeListLoad = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }
    $scope.deleteFn = function (deductionTypeId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteDT(deductionTypeId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };
})
HRM.controller("nationalitycontroller", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.nationalityList = []
    employeeService.queryNationality().success(function (data, status) {
        $scope.nationalityList = data;
    })

    var loadlist = function () {
        employeeService.queryNationality().success(function (data, status) {
            $scope.nationalityList = data;
        })
    }

    $scope.editN = function (e) {
        $scope.labelName = "Update";
        $scope.nationalityListLoad = {}
        employeeService.queryNationalityByID(e.nationalityId).success(function (data, status) {
            $scope.nationalityListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleNationality = function () {
        $scope.submitted = true;
        if (!$scope.nationality.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.nationalityListLoad.nationalityId
        if (id != null) {
            employeeService.queryNationalityUpdate($scope.nationalityListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.nationalityListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryNationalityAdd($scope.nationalityListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.nationalityListLoad = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }

    $scope.deleteNationality = function (nationalityId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteNationality(nationalityId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };

})
HRM.controller("designationcontroller", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.designationList = []
    employeeService.queryDesignation().success(function (data, status) {
        $scope.designationList = data;
    })
    var loadlist = function () {
        employeeService.queryDesignation().success(function (data, status) {
            $scope.designationList = data;
        })
    }
    $scope.editN = function (e) {
        $scope.labelName = "Update";
        $scope.designationListLoad = {}
        employeeService.queryDesignationByID(e.designationId).success(function (data, status) {
            $scope.designationListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleDesignation = function () {
        $scope.submitted = true;
        if (!$scope.designation.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.designationListLoad.designationId
        if (id != null) {
            employeeService.queryDesignationUpdate($scope.designationListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.designationListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryDesignationAdd($scope.designationListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }

    $scope.deleteDesignation = function (designationId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteDesignation(designationId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };

})
HRM.controller("departmentcontroller", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.departmentList = []
    employeeService.queryDepartment().success(function (data, status) {
        $scope.departmentList = data;
    })
    var loadlist = function () {
        employeeService.queryDepartment().success(function (data, status) {
            $scope.departmentList = data;
        })
    }
    $scope.editN = function (e) {
        $scope.labelName = "Update";
        $scope.departmentListLoad = {}
        employeeService.queryDepartmentByID(e.departmentId).success(function (data, status) {
            $scope.departmentListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleDepartment = function () {
        $scope.submitted = true;
        if (!$scope.department.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.departmentListLoad.departmentId
        if (id != null) {
            employeeService.queryDepartmentUpdate($scope.departmentListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.departmentListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryDepartmentAdd($scope.departmentListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.departmentListLoad = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }

    $scope.deleteDepartment = function (departmentId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteDepartment(departmentId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };
})
HRM.controller("Companycontroller", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Save";
    $scope.CompanyObj = {}

    employeeService.querycompanyByID(1).success(function (data, status) {
        $scope.CompanyObj = data;
    })
    var loadlist = function () {
        employeeService.querycompanyByID(1).success(function (data, status) {
            $scope.CompanyObj = data;
        })
    }

    $scope.handleCompany = function () {
        $scope.submitted = true;
        if (!$scope.companyf.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.CompanyObj.companyId
        if (id != null) {
            employeeService.querycompanyUpdate($scope.CompanyObj)
           .success(function (data) {
               alert('Successfully');
               loadlist();
               $scope.CompanyObj = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.querycompanyAdd($scope.CompanyObj)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.CompanyObj = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }
})
HRM.controller("RaceController", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.RaceList = []
    employeeService.queryRace().success(function (data, status) {
        $scope.RaceList = data;
    })

    var loadlist = function () {
        employeeService.queryRace().success(function (data, status) {
            $scope.RaceList = data;
        })
    }

    $scope.editR = function (e) {
        $scope.labelName = "Update";
        $scope.RaceListLoad = {}
        employeeService.queryRaceByID(e.raceId).success(function (data, status) {
            $scope.RaceListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleRace = function () {
        $scope.submitted = true;
        if (!$scope.race.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.RaceListLoad.raceId
        if (id != null) {
            employeeService.queryRaceUpdate($scope.RaceListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.RaceListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryRaceAdd($scope.RaceListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.RaceListLoad = {}
                })
            .error(function (e) {
                errorDisplay.show(e);
            });
        }
    }

    $scope.deleteRace = function (raceId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteRace(raceId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (e) {
                    errorDisplay.show(e);
                })
        }
    };

})
HRM.controller("Religioncontroller", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.ReligionList = []
    employeeService.queryReligion().success(function (data, status) {
        $scope.ReligionList = data;
    })
    var loadlist = function () {
        employeeService.queryReligion().success(function (data, status) {
            $scope.ReligionList = data;
        })
    }
    $scope.editR = function (e) {
        $scope.labelName = "Update";
        $scope.ReligionListLoad = {}
        employeeService.queryReligionByID(e.religionId).success(function (data, status) {
            $scope.ReligionListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handlereligion = function () {
        $scope.submitted = true;
        if (!$scope.religionf.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.ReligionListLoad.religionId
        if (id != null) {
            employeeService.queryReligionUpdate($scope.ReligionListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.ReligionListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryReligionAdd($scope.ReligionListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }
    $scope.deleteR = function (religionId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteReligion(religionId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };

})
HRM.controller("HolidayController", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.HolidayList = []
    employeeService.queryHoliday().success(function (data, status) {
        $scope.HolidayList = data;
    })
    var loadlist = function () {
        employeeService.queryHoliday().success(function (data, status) {
            $scope.HolidayList = data;
        })
    }
    $scope.editH = function (e) {
        $scope.labelName = "Update";
        $scope.HolidayListLoad = {}
        employeeService.queryHolidayByID(e.holidayId).success(function (data, status) {
            $scope.HolidayListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleholiday = function () {
        $scope.submitted = true;
        if (!$scope.holiday.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.HolidayListLoad.holidayId
        if (id != null) {
            employeeService.queryHolidayUpdate($scope.HolidayListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.HolidayListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryHolidayAdd($scope.HolidayListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.HolidayListLoad = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }
    $scope.deleteH = function (holidayId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteHoliday(holidayId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };

})
HRM.controller("LeaveTypeController", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.LeaveTypeList = []
    employeeService.queryLeaveType().success(function (data, status) {
        $scope.LeaveTypeList = data;
    })
    var loadlist = function () {
        employeeService.queryLeaveType().success(function (data, status) {
            $scope.LeaveTypeList = data;
        })
    }

    $scope.editL = function (e) {
        $scope.labelName = "Update";
        $scope.LeaveTypeListLoad = {}
        employeeService.queryLeaveTypeByID(e.leaveTypeId).success(function (data, status) {
            $scope.LeaveTypeListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleLeaveType = function () {
        $scope.submitted = true;
        if (!$scope.leavetype.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.LeaveTypeListLoad.leaveTypeId
        if (id != null) {
            employeeService.queryLeaveTypeUpdate($scope.LeaveTypeListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.LeaveTypeListLoad = {}
           })
          .error(function (d) {
              alert($translate.instant('ALERT.FORM_ERROR'));
          });
        }
        else {
            employeeService.queryLeaveTypeAdd($scope.LeaveTypeListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.LeaveTypeListLoad = {}
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
    }

    $scope.deleteLeaveType = function (leaveTypeId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deleteLeaveType(leaveTypeId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };

})
HRM.controller('employeedetailreportcontroller', function ($scope, $http, employeeService) {

    $scope.detailsTableData = null;
    var loadEmployee = function () {
        employeeService.getallemployee().success(function (data) {
            $scope.detailsTableData = data;
        })
    }
    loadEmployee();
})
HRM.controller('EmployeeReportCtrl', function ($scope, $http, employeeService, $routeParams, $location) {

    var employeeId = $routeParams.id

    employeeService.getEmployeeDetailsReport(employeeId).success(function (data) {
        $scope.detailAll = data;

        if ($scope.detailAll.employeeSalaryInfo.employeePassType == 1)
            $scope.detailAll.employeeSalaryInfo.employeePassType = "NRIC"
        if ($scope.detailAll.employeeSalaryInfo.employeePassType == 2)
            $scope.detailAll.employeeSalaryInfo.employeePassType = "FIN"
    })

    employeeService.get(employeeId)
           .success(function (data) {
               $scope.employee = data;
               employeeService.queryEmployeeStatusByID($scope.employee.employeeStatusId).success(function (data) {
                   $scope.SatatusName = data;
               });
               employeeService.queryDepartmentByID($scope.employee.departmentId).success(function (data) {
                   $scope.deparName = data;
               });
               employeeService.queryGroupByID($scope.employee.employeeGroupId).success(function (data) {
                   $scope.GroupName = data;
               });
           });
    employeeService.getEmployeeJobInfoById(employeeId).success(function (data) {
        $scope.employeeJobInfo = data;
        employeeService.get($scope.employeeJobInfo.leaveSuppervisorId).success(function (data) {
            $scope.employeeJobInfo.fullnameLS = data.firstName + " " + data.lastName;
        })
        employeeService.get($scope.employeeJobInfo.claimSuppervisorId).success(function (data) {
            $scope.employeeJobInfo.fullnameCS = data.firstName + " " + data.lastName;
        })
        employeeService.queryDesignationByID($scope.employeeJobInfo.designationId).success(function (data) {
            $scope.DesignationName = data;
        });
    })

    $scope.back = function () {
        $location.url('/employeedetailreport');
    }

})
HRM.controller('ListEmployeeForLeavingListCtrl', function ($scope, $http, employeeService, $filter) {

    $scope.employeeListForLeavingTableData = null;
    var loadEmployeeListForLeaving = function () {
        employeeService.getallemployee().success(function (data) {
            $scope.employeeLeavingTableData = data;
        })
    }
    loadEmployeeListForLeaving();
});
HRM.controller('EmployeeLeavingListCtrl', function ($scope, $http, employeeService, $filter, $routeParams, $location, $route) {
    employeeId = $routeParams.id
    $scope.btnlabel = "Save";
    $scope.leaveObject = {}
    $scope.employeeLeavingTableData = []
    employeeService.SearchEmployeeLeavingById(employeeId).success(function (data) {
        $scope.employeeLeavingTableData = data;
    })
    employeeService.get(employeeId).success(function (data) {
        $scope.employeeName = data.firstName + " " + data.lastName;
        $scope.employeeID = data.employeeId;
    })
    employeeService.getAllLeaveInfoById(employeeId).success(function (data) {
        $scope.leavetypeList = data;
    });

    $scope.getLeavingId = function (e) {
        $scope.btnlabel = "Update";
        employeeService.queryLeavingByID(e.employeeLeavingId).success(function (data) {
            $scope.leaveInfo = data;

            $scope.YearInfo = data.employeeLeaveInfo.year
            $scope.CLY = data.employeeLeaveInfo.cyl

            employeeService.queryLeaveTypeByID(e.employeeLeaveInfo.leaveTypeId).success(function (data) {
                $scope.leave.cal = data.cal;
            })

            employeeService.getAllLeaveInfoById(e.employeeLeaveInfo.year, employeeId).success(function (data) {
                $scope.LeaveInfoList = data
            })
            employeeService.get(data.employeeId).success(function (data) {
                $scope.employeeName = data.firstName + " " + data.lastName;
                $scope.employeeID = data.employeeId;

                var from = $scope.leaveInfo.fromDate
                var returnx = from.substring(0, 1)
                var to = $scope.leaveInfo.toDate
                var returny = to.substring(0, 1)
                var CLYreturn = returny - returnx
                $scope.CYL = CLYreturn

            })
        })
    }

    $scope.getList = function () {
        employeeService.getAllLeaveInfoById($scope.YearInfo, employeeId).success(function (data) {
            $scope.LeaveInfoList = data
        })
    }

    $scope.getCYLbyType = function (e) {
        employeeService.queryLeaveInfoByID($scope.leaveInfo.employeeLeaveInfoId).success(function (data) {
            $scope.CYL = data.cyl
            employeeService.queryLeaveTypeByID(data.leaveTypeId).success(function (data) {
                $scope.leave.cal = data.cal;
            })
        });
    }

    $scope.handleLeave = function () {
        $scope.submitted = true;
        var x = $scope.leaveInfo.employeeLeavingId;
        if (x == null) {
            $scope.leaveInfo.employeeId = $scope.employeeID
            $scope.leaveInfo.employeeLeaveInfoId = $scope.leaveInfo.employeeLeaveInfoId;

            $scope.aaaa = {}

            $scope.aaaa.employeeId = $scope.employeeID
            $scope.aaaa.employeeLeaveInfoId = $scope.leaveInfo.employeeLeaveInfoId;
            $scope.aaaa.cyl = $('input.dataCYL').val()
            $scope.aaaa.year = $('select.yearCYL option:selected').val()
            $scope.aaaa.leaveTypeId = $scope.leaveInfo.employeeLeaveInfoId
            employeeService.queryLeaveInfoUpdate($scope.aaaa).success(function (data) {
            })

            employeeService.queryLeavingAdd($scope.leaveInfo)
                .success(function (data) {
                    alert('Successfully');
                    $scope.leaveInfo = {}
                    $route.reload();
                    employeeService.SearchEmployeeLeavingById(employeeId).success(function (data) {
                        $scope.employeeLeavingTableData = data;
                    })
                })
            .error(function (d) {
                alert($translate.instant('ALERT.FORM_ERROR'));
            });
        }
        else {
            $scope.leaveInfo.employee = null
            $scope.leaveInfo.leaveType = null
            $scope.leaveInfo.employeeLeaveInfo = null
            $scope.leaveInfo.employeeLeaveInfoId = $scope.leaveInfo.employeeLeaveInfoId;
            employeeService.queryLeavingUpdate($scope.leaveInfo)
               .success(function (data) {
                   alert('Successfully');
                   $scope.leaveInfo = {}
                   $route.reload();
                   employeeService.SearchEmployeeLeavingById(employeeId).success(function (data) {
                       $scope.employeeLeavingTableData = data;
                   })
               })
           .error(function (d) {
               alert($translate.instant('ALERT.FORM_ERROR'));
           });
        }
    }

    $scope.deleteFn = function (employeeLeavingId) {
        employeeService.deleteLeaving(employeeLeavingId)
            .success(function (data) {
                alert("Successfully")
                employeeService.SearchEmployeeLeavingById(employeeId).success(function (data) {
                    $scope.employeeLeavingTableData = data;
                })
            })
            .error(function (error) {
                alert(1)
            })
    };
    $scope.cancel = function () {
        $location.url('/leaving');
    }
});
HRM.controller("RangeController", function ($scope, $http, $location, $route, employeeService) {
    $scope.isAdd = false;
    $scope.labelName = "Add";
    $scope.RaceList = []
    employeeService.querycpfTable().success(function (data, status) {
        $scope.CPFList = data;
    })

    var loadlist = function () {
        employeeService.querycpfTable().success(function (data, status) {
            $scope.CPFList = data;
        })
    }

    $scope.editCPF = function (e) {
        $scope.labelName = "Update";
        $scope.CPFListLoad = {}
        employeeService.querycpfTableByID(e.cpfTableId).success(function (data, status) {
            $scope.CPFListLoad = data;
        }).error(function (error) {
            $scope.isAdd = true;
        });
    };
    $scope.handleCPFContribution = function () {
        $scope.submitted = true;
        if (!$scope.cpf.$valid) {
            alert($translate.instant('ALERT.FORM_ERROR'));
            return false;
        }
        var id = $scope.CPFListLoad.cpfTableId
        if (id != null) {
            employeeService.querycpfTableUpdate($scope.CPFListLoad)
           .success(function (data) {
               alert('Successfully');
               $scope.labelName = "Add";
               loadlist();
               $scope.CPFListLoad = {}
           })
          .error(function (d) {
              alert('"From Age and To Age is overlap with CPF Range you define"');
          });
        }
        else {
            employeeService.querycpfTableAdd($scope.CPFListLoad)
                .success(function (data) {
                    alert('Successfully');
                    loadlist();
                    $scope.CPFListLoad = {}
                })
            .error(function (d) {
                alert('"From Age and To Age is overlap with CPF Range you define"');
            });
        }
    }

    $scope.deleteCPF = function (cpfTableId) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            employeeService.deletecpfTable(cpfTableId)
                .success(function (data) {
                    alert("Successfully")
                    loadlist();
                })
                .error(function (error) {
                    alert("Indelibility.\nThis value is used in other areas.\nPlease Check !")
                })
        }
    };

})