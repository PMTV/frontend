var Settings = angular.module('Settings', []);

Settings.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
//        .when('/', { templateUrl: 'Dashboard/dashboard.html' })
        .when('/user', { templateUrl: 'Settings/UserManagement/userSetting.html' })
        .when('/general', { templateUrl: 'Settings/GeneralSettings/generalSetting.html' })
        .when('/account-summary', { templateUrl: 'Settings/AccountSummary/accountSummary.html' })
        .when('/personal-settings', { templateUrl: 'Settings/PersonalSettings/personalSettings.html' })
        .when('/company', { templateUrl: 'Settings/CompanySettings/companySetting.html' })
        .otherwise({ redirectTo: '/general' });
}]);

Settings.factory('settingService', function ($http, $emerge) {
    return {
        query: function () {
            return $emerge.query("currencies");
        },
        add: function (currency) {
            // TODO Remove when USR Module ready
            return $emerge.add("currencies", currency);
        },
        update: function (data) {
            return $emerge.update("currencies", data.currencyId, data);
        },
        delete: function (id) {
            // TODO Remove when USR Module ready
            return $emerge.delete("currencies", id);
        }
    };
});

/*
Get all the Currenciess information
+ $scope.deleteFn is called to delete a particular Currencies
+ CurrenciesId is stored once user click on delete button
*/
Settings.controller('UserSettingCtrl', function ($scope, $http, $translate, $log, userService, errorDisplay) {

    /**** USER *****/
    $scope.userList = [];
    $scope.user = {};
    $scope.index = 0;
    $scope.currentPage = 0;
    $scope.pageSize = 3;

    $scope.range = function (n) {
        return new Array(n);
    };
    $scope.numberOfPages = function () {
        return Math.ceil($scope.userList.length / $scope.pageSize);
    };
    userService.query()
        .success(function (data) {
            $scope.userList = data;
        })
        .error(function (error) {
            errorDisplay.show(error);
        });
    $scope.editUser = function (user, index) {
        $scope.user = user;
        $scope.index = index;
        $scope.showInfo = true;
    };
    $scope.updateUser = function (user) {
        user.roles = null;
        user.objectState = null;
        user.claims = null;
        user.login = null;
        userService.update(user, user.id)
            .success(function (data) {
                alert($translate.instant('ALERT.UPDATED'));
            })
            .error(function (error) {
                errorDisplay.show(error);
                $log.error(error);
            });
    };
    $scope.deleteUser = function (index, user) {
        if (confirm($translate.instant('ALERT.DELETING'))) {
            userService.delete(user.id)
                .success(function () {
                    $scope.userList.splice($scope.index, 1);
                    alert($translate.instant('ALERT.DELETED'));
                })
                .error(function (data) {
                    errorDisplay.show(data);
                });
        }

    };
});

Settings.controller('GeneralSettingCtrl', function ($scope, $http, $location, warehouseService, userService, deliveryMethodService, paymentTermService, deliveryTermService, currencyService, creditTermService, industryService, countryService, returnReasonService, giftService, $modal) {

    $scope.form = {};

    /***Account Summary***/
    $scope.doAccountSummary = function () {
      $location.path('/account-summary');
    };

    $scope.doPersonalSettings = function () {
        $location.path('/personal-settings');
    };

    /***Currency***/
    $scope.currencyArr = [];


    $scope.currentPage = 0;
    $scope.pageSize = 3;

    $scope.range = function (n) {
        return new Array(n);
    };
    $scope.numberOfPages = function () {
        return Math.ceil($scope.userList.length / $scope.pageSize);
    };
    currencyService.query()
        .success(function (data) {
            $scope.currencyArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    $scope.addCurrency = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/Currencies/CurrencyModalNew.html?a=a',
            controller: function ($scope, $modalInstance, currencyArr) {
                console.log($modal);
                // MODAL SCOPE
                $scope.busy = false;
                $scope.Currencies = {};
                $scope.CurrenciesArr = currencyArr;
                $scope.save = function () {
                    $scope.submitted = true;
                    if (!$scope.Currencies.code) {
                        return false;
                    }
                    $scope.busy = true;

                    if (!$scope.Currencies.currencyId) {
                        currencyService.add($scope.Currencies)
                            .success(function (data) {
                                $scope.CurrenciesArr.push(data);
                                alert("Currencies Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    } else {
                        currencyService.update($scope.Currencies)
                            .success(function (data) {
                                alert("Currencies updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        currencyService.delete(id)
                            .success(function () {
                                $scope.CurrenciesArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            });
                    });
                };
                $scope.editItem = function (item) {
                    $scope.Currencies = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                currencyArr: function () {
                    return $scope.currencyArr;
                }
            },
            link: function (scope, element, attrs) {
                // var defaultCurr = {};
                // scope.CurrenciesArr = [];

                // currencyService.query().then(function (data) 
                // {
                //     // Once ajax loaded, change first option text to "Please Select"
                //     element[0].options[0].text = 'Please Select';

                //     if (data.data.length <= 0) 
                //     {
                //         //alert('Please add a Currency first');
                //         // TODO Redirect to adding Supplier or popup
                //         return false;
                //     }
                //     scope.CurrenciesArr = (data.data);

                //     // set default value when ngModel is empty
                //     if (scope.ngModel == undefined) 
                //     {
                //         for (var cur in scope.CurrenciesArr) 
                //         {
                //             var c = scope.CurrenciesArr[cur];
                //             if (c.isDefault == true) 
                //             {
                //                 defaultCurr = c;
                //             }
                //         }
                //         scope.ngModel = defaultCurr.currencyId;
                //     }
                // });
            }
        }
    );
    };

    /***Credit term***/
    $scope.creditTermArr = [];

    creditTermService.query()
        .success(function (data) {
            $scope.creditTermArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    $scope.addCreditTerm = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/CreditTerms/CreditTermModalNew.html?a=a',
            controller: function ($scope, $modalInstance, creditTermsArr) {
                console.log($modal);
                // MODAL SCOPE
                $scope.busy = false;
                $scope.creditTerm = {};
                $scope.creditTermsArr = creditTermsArr;
                $scope.save = function () {
                    $scope.submitted = true;
                    if (!$scope.creditTerm.code) {
                        return false;
                    }

                    $scope.busy = true;

                    if (!$scope.creditTerm.creditTermId) {
                        creditTermService.add($scope.creditTerm)
                            .success(function (data) {
                                $scope.creditTermsArr.push(data);
                                alert("Credit Term Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    } else {
                        creditTermService.update($scope.creditTerm)
                            .success(function (data) {
                                alert("Credit Term updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        creditTermService.delete(id)
                            .success(function () {
                                $scope.creditTermsArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            });
                    });
                };
                $scope.editItem = function (item) {
                    $scope.creditTerm = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                creditTermsArr: function () {
                    return $scope.creditTermArr;
                }
            },
            link: function (scope, element, attrs) {

            }
        }
    );
    };
    /***industries***/
    $scope.industryArr = [];

    industryService.query()
        .success(function (data) {
            $scope.industryArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    $scope.addIndustry = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/Industries/IndustryModalNew.html?a=a',
            controller: function ($scope, $modalInstance, industryArr) {
                console.log($modal);
                // MODAL SCOPE
                $scope.busy = false;
                $scope.industry = {};
                $scope.industryArr = industryArr;
                $scope.save = function () {
                    $scope.submitted = true;
                    if (!$scope.industry.name) {
                        return false;
                    }
                    $scope.busy = true;

                    if (!$scope.industry.industryId) {
                        industryService.add($scope.industry)
                            .success(function (data) {
                                $scope.industryArr.push(data);
                                alert("Industry Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    } else {
                        industryService.update($scope.industry)
                            .success(function (data) {
                                alert("Industry updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        industryService.delete(id)
                            .success(function () {
                                $scope.industryArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            });
                    });
                };
                $scope.editItem = function (item) {
                    $scope.industry = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                industryArr: function () {
                    return $scope.industryArr;
                }
            },
            link: function (scope, element, attrs) {

            }
        }
    );
    };

    /***lead source***/
    // $scope.leadsourceArr =  [];

    // leadsourceService.query()
    //     .success(function (data){
    //         $scope.leadsourceArr = data;
    //         // console.log(data);
    //     })
    //     .error (function (error){
    //         alert(error);
    //     })

    // $scope.editIndustry = function()
    // {   
    //     // $scope.currencyArr = user;
    //     $scope.showLeadsource = true;
    // }

    /***uom***/
    // $scope.uomArr =  [];

    /***delivery terms***/
    $scope.deliveryTermArr = [];

    deliveryTermService.query()
        .success(function (data) {
            $scope.deliveryTermArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    $scope.addDeliveryTerm = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/DeliveryTerms/DeliveryTermModal.html?a=a',
            controller: function ($scope, $modalInstance, deliveryTermsArr) {
                console.log($modal);
                // MODAL SCOPE
                $scope.busy = false;
                $scope.deliveryTerm = {};
                $scope.deliveryTermsArr = deliveryTermsArr;
                $scope.save = function () {
                    $scope.submitted = true;
                    if (!$scope.deliveryTerm.code) {
                        return false;
                    }
                    $scope.busy = true;

                    if (!$scope.deliveryTerm.deliveryTermId) {
                        deliveryTermService.add($scope.deliveryTerm)
                            .success(function (data) {
                                $scope.deliveryTermsArr.push(data);
                                alert("Delivery Term Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    } else {
                        deliveryTermService.update($scope.deliveryTerm)
                            .success(function (data) {
                                alert("Delivery Term updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        deliveryTermService.delete(id)
                            .success(function () {
                                $scope.deliveryTermsArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            });
                    });
                };
                $scope.editItem = function (item) {
                    $scope.deliveryTerm = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                deliveryTermsArr: function () {
                    return $scope.deliveryTermArr;
                }
            },
            link: function (scope, element, attrs) {

            }
        }
    );
    };


    /***payment terms***/
    $scope.PaymentTermArr = [];

    paymentTermService.query()
        .success(function (data) {
            $scope.PaymentTermArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    $scope.addPaymentTerm = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/PaymentTerms/PaymentTermModalNew.html?a=a',
            controller: function ($scope, $modalInstance, PaymentTermArr) {
                console.log($modal);
                // MODAL SCOPE
                $scope.busy = false;
                $scope.paymentTerm = {};
                $scope.PaymentTermArr = PaymentTermArr;
                $scope.save = function () {
                    $scope.busy = true;

                    if (!$scope.paymentTerm.paymentTermId) {
                        paymentTermService.add($scope.paymentTerm)
                            .success(function (data) {
                                $scope.PaymentTermArr.push(data);
                                alert("Payment Term Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                        });
                    } else {
                        paymentTermService.update($scope.paymentTerm)
                            .success(function (data) {
                                alert("Payment Term updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        paymentTermService.delete(id)
                            .success(function () {
                                $scope.PaymentTermArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            });
                    });
                };
                $scope.editItem = function (item) {
                    $scope.paymentTerm = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                PaymentTermArr: function () {
                    return $scope.PaymentTermArr;
                }
            },
            link: function (scope, element, attrs) {

            }
        }
    );
    };

    /***delivery method***/
    $scope.DeliveryMethodArr = [];

    deliveryMethodService.query()
        .success(function (data) {
            $scope.DeliveryMethodArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    $scope.addDeliveryMethod = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/DeliveryMethods/DeliveryMethodModal.html?a=a',
            controller: function ($scope, $modalInstance, DeliveryMethodArr) {
                console.log($modal);
                // MODAL SCOPE

                $scope.busy = false;

                $scope.deliveryMethod = {};
                $scope.DeliveryMethodArr = DeliveryMethodArr;
                $scope.save = function () {
                    $scope.submitted = true;
                    if (!$scope.deliveryMethod.code) {
                        return false;
                    }
                    $scope.busy = true;

                    if (!$scope.deliveryMethod.deliveryMethodId) {
                        deliveryMethodService.add($scope.deliveryMethod)
                            .success(function (data) {
                                $scope.DeliveryMethodArr.push(data);
                                alert("Delivery Method Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    } else {
                        deliveryMethodService.update($scope.deliveryMethod)
                            .success(function (data) {
                                alert("Delivery Method updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        deliveryMethodService.delete(id)
                            .success(function () {
                                $scope.DeliveryMethodArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        ;
                    });
                };
                $scope.editItem = function (item) {
                    $scope.deliveryMethod = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                DeliveryMethodArr: function () {
                    return $scope.DeliveryMethodArr;
                }
            },
            link: function (scope, element, attrs) {

            }
        }
);
    };

    /***countries***/
    $scope.countrysArr = [];

    countryService.query()
        .success(function (data) {
            $scope.countrysArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    $scope.addCountry = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/Countries/CountryModalNew.html?a=a',
            controller: function ($scope, $modalInstance, countrysArr) {
                console.log($modal);
                // MODAL SCOPE
                $scope.busy = false;
                $scope.country = {};
                $scope.countrysArr = countrysArr;
                $scope.save = function () {
                    $scope.submitted = true;
                    if (!$scope.country.code) {
                        return false;
                    }
                    $scope.busy = true;

                    if (!$scope.country.countryId) {
                        countryService.add($scope.country)
                            .success(function (data) {
                                $scope.countrysArr.push(data);
                                alert("Country Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    } else {
                        countryService.update($scope.country)
                            .success(function (data) {
                                alert("Country updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        countryService.delete(id)
                            .success(function () {
                                $scope.countrysArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            });
                    });
                };
                $scope.editItem = function (item) {
                    $scope.country = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                countrysArr: function () {
                    return $scope.countrysArr;
                }
            },
            link: function (scope, element, attrs) {

            }
        }
    );
    };

    /***warehouse***/
    $scope.warehouseArr = [];

    warehouseService.query()
        .success(function (data) {
            $scope.warehouseArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    //$scope.addWarehouseItem = function() {
    //    $scope.warehouse.warehouseSectionsList.push({});
    //};
    //$scope.removeWahouseItem = function(index) {
    //    $scope.warehouse.warehouseSectionsList.splice(index, 1);
    //};

    $scope.addWarehouse = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/Warehouses/WarehouseModalNew.html?a=a',
            controller: function ($scope, $modalInstance, warehouseArr) {
                console.log($modal);
                // MODAL SCOPE
                $scope.busy = false;
                $scope.warehouse = {};
                $scope.warehouseArr = warehouseArr;
                $scope.warehouse.userId = 1;
                $scope.warehouse.status = 1;
                $scope.warehouse.warehouseSectionsList = [{ userId: 1 }];

                $scope.addSectionItem = function () {
                    $scope.warehouse.warehouseSectionsList.push({ userId: 1 });
                };
                $scope.removeSectionItem = function (index, id) {
                    if (id) {
                        bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                            warehouseService.deleteItem(index, id)
                                .success(function (data) {
                                    $scope.warehouse.warehouseSectionsList.splice(index, 1);
                                })
                                .error(function (data) {
                                    alert(data);
                                });
                        });
                    } else {
                        $scope.warehouse.warehouseSectionsList.splice(index, 1);
                    }
                };
                $scope.save = function () {
                    $scope.submitted = true;
                    //alert($scope.form.warehouseForm.$valid);
                    //if (!$scope.form.warehouseForm.$invalid) {
                    //    return false;
                    //}

                    if (!$scope.warehouse.warehouseCode) {
                        return false;
                    }

                    $scope.busy = true;
                    if (!$scope.warehouse.warehouseId) {
                        warehouseService.add($scope.warehouse)
                            .success(function (data) {
                                $scope.warehouseArr.push(data);
                                alert("Warehouse Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    } else {
                        warehouseService.update($scope.warehouse)
                            .success(function (data) {
                                alert("Warehouse updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        warehouseService.delete(id)
                            .success(function () {
                                $scope.warehouseArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            });
                    });
                };
                $scope.editItem = function (item) {
                    $scope.warehouse = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                warehouseArr: function () {
                    return $scope.warehouseArr;
                }
            },
            link: function (scope, element, attrs) {

            }
        }
    );
    };
    
    /***Gift***/
    $scope.giftArr = [];

    giftService.query()
        .success(function (data) {
            $scope.giftArr = data;
            // console.log(data);
        })
        .error(function (error) {
            alert(error);
        });
    $scope.addGift = function () {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'modal-preview',
            templateUrl: 'GNM/Gift/GiftModal.html?a=a',
            controller: function ($scope, $modalInstance, giftArr) {
                console.log($modal);
                // MODAL SCOPE
                $scope.busy = false;
                $scope.gift = {};
                $scope.giftArr = giftArr;
                $scope.save = function () {
                    $scope.submitted = true;
                    if (!$scope.gift.name) {
                        return false;
                    }

                    $scope.busy = true;

                    if (!$scope.gift.giftId) {
                        giftService.add($scope.gift)
                            .success(function (data) {
                                $scope.giftArr.push(data);
                                alert("Gift Successfully created!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    } else {
                        giftService.update($scope.gift)
                            .success(function (data) {
                                alert("Gift updated!");
                                $modalInstance.close();
                            })
                            .error(function (data) {
                                alert(data);
                            })
                        .finally(function () {
                            $scope.busy = false;
                            $scope.submitted = false;
                        });
                    }
                };

                $scope.removeItem = function (index, id) {
                    //$modalInstance.close();
                    bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                        giftService.delete(id)
                            .success(function () {
                                $scope.giftArr.splice(index, 1);
                                //alert('Successfully Deleted');
                            })
                            .error(function (data) {
                                alert(data);
                            });
                    });
                };
                $scope.editItem = function (item) {
                    $scope.gift = item;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                giftArr: function () {
                    return $scope.giftArr;
                }
            },
            link: function (scope, element, attrs) {

            }
        }
    );
    };

    /***returnReason***/
    $scope.returnReasonArr = [];

    returnReasonService.query()
        .success(function(data) {
            $scope.returnReasonArr = data;
            // console.log(data);
        })
        .error(function(error) {
            alert(error);
        });

    $scope.addReturnReason = function () {
        var dialog = $modal.open({
                backdrop: true,
                keyboard: true,
                windowClass: 'modal-preview',
                templateUrl: 'GNM/ReturnReason/ReturnReasonModal.html?a=a',
                controller: function ($scope, $modalInstance, returnReasonArr) {
                    console.log($modal);
                    // MODAL SCOPE
                    $scope.busy = false;
                    $scope.returnReason = {};
                    $scope.returnReasonArr = returnReasonArr;
                    $scope.save = function() {
                        $scope.submitted = true;
                        if (!$scope.returnReason.code) {
                            return false;
                        }
                        $scope.busy = true;

                        if (!$scope.returnReason.returnReasonId) {
                            returnReasonService.add($scope.returnReason)
                                .success(function(data) {
                                    $scope.returnReasonArr.push(data);
                                    alert("Return Reason Successfully created!");
                                    $modalInstance.close();
                                })
                                .error(function(data) {
                                    alert(data);
                                })
                                .finally(function() {
                                    $scope.busy = false;
                                    $scope.submitted = false;
                                });
                        } else {
                            returnReasonService.update($scope.returnReason)
                                .success(function(data) {
                                    alert("Return Reason updated!");
                                    $modalInstance.close();
                                })
                                .error(function(data) {
                                    alert(data);
                                })
                                .finally(function() {
                                    $scope.busy = false;
                                    $scope.submitted = false;
                                });
                        }
                    };

                    $scope.removeItem = function(index, id) {
                        //$modalInstance.close();
                        bootstrapDialogConfirm('Do you want to proceed to Delete?', function() {
                            returnReasonService.delete(id)
                                .success(function() {
                                    $scope.returnReasonArr.splice(index, 1);
                                })
                                .error(function(data) {
                                    alert(data);
                                });
                        });
                    }

                    $scope.editItem = function(item) {
                        $scope.returnReason = item;
                    }

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    returnReasonArr: function () {
                        return $scope.returnReasonArr;
                    }
                },
                link: function(scope, element, attrs) {

                }
            }
        );
    };
});

Settings.controller('SettingAddCtrl', function ($scope, $http, $location, currencyService) {
});

/*
Handle customer update
+ init to get the existing customer information
+ existing customer id is pass through when user click on edit button
+ new customer information is saved on $scope.new_customer
*/
Settings.controller('SettingUpdateCtrl', function ($scope, $http, $location, currencyService) {
    $scope.Currencies = {};
});

Settings.directive('settingDropdown', function ($modal, $log, currencyService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2" footer="Add" footerfn="addCurrency()">' +
                '<option value="">Loading Currency</option>' +
                '<option ng-repeat="c in CurrenciesArr" value="{{c.currencyId}}">{{c.code}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.CurrenciesArr = [];

            currencyService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    //alert('Please add a Currency first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }
                scope.CurrenciesArr = (data.data);
            });
            var dialog;
            scope.openSetting = function () {
                dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'GNM/Settings/SettingModalNew.html?a=a',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.Currencies = {};
                        $scope.CurrenciesArr = scope.CurrenciesArr;

                        $scope.save = function () {
                            $scope.submitted = true;
                            if (!$scope.Currencies.code) {
                                return false;
                            }
                            $scope.busy = true;

                            if (!$scope.Currencies.currencyId) {
                                currencyService.add($scope.Currencies)
                                    .success(function (data) {
                                        scope.CurrenciesArr.push(data);
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                    $scope.submitted = false;
                                });
                            } else {
                                currencyService.update($scope.Currencies)
                                    .success(function (data) {
                                        $modalInstance.close();
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    })
                                .finally(function () {
                                    $scope.busy = false;
                                    $scope.submitted = false;
                                });
                            }
                        };

                        $scope.removeItem = function (index, id) {
                            //$modalInstance.close();
                            bootstrapDialogConfirm('Do you want to proceed to Delete?', function () {
                                currencyService.delete(id)
                                    .success(function () {
                                        $scope.CurrenciesArr.splice(index, 1);
                                        //alert('Successfully Deleted');
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    });
                            });
                        };
                        $scope.editItem = function (item) {
                            $scope.Currencies = item;
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                    //resolve: {
                    //    items: function () {
                    //        return $scope.items;
                    //    }
                    //}
                });
                dialog.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };
        }
    };
});