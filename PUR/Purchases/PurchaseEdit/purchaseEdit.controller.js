// CONTROLLERS

// Purchase Order List Controller
PUR.controller('PurchaseListCtrl', function ($scope, $http, purchaseService, $translate) {
    $scope.purchaseTableData = null;

    $scope.columnDefs = [
            { field: 'purchaseOrderNumber', displayName: '#Purchase Order Number' },
            { field: 'supplier.companyName', displayName: 'Company Name' },
             { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date', visible: false },
            { field: 'purchaseOrderId', displayName: 'Actions', cellTemplate: '<a href="#/purchases/{{row.entity.purchaseOrderId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.purchaseOrderId)">Delete</a>', sortable: false, headerClass: 'unsortable' }
    ];

    var loadPurchases = function () {
        purchaseService.query().success(function (data) {
            $scope.purchaseTableData = data;
        })
    };

    $scope.deletePurchase = function (id) {
        purchaseService.delete(id)
            .success(function (data) {
                alert($translate.instant('ALERT.DELETED'));
                loadPurchases();
            })
            .error(function (error) {
                console.log(error);
            })
    };

    loadPurchases();
});

// Purchase Order Edit Controller
PUR.controller('PurchaseEditCtrl', function ($scope, $rootScope, $emerge, $firebase, $http, $route, $routeParams, $location, $timeout, $interval, $modal, $translate, $log, hotkeys, errorDisplay, purchaseService, supplierService, productService) {

    var purchaseId = $routeParams.id;
    $scope.purchase = {};
    $scope.purchase.tags = "";
    $scope.newPurchaseItem = {};
    $scope.supplier = null;
    $scope.selected = {};

    $scope.busy = false;
    $scope.supplierHidden = false;

    $scope.userList = [];

    var userName = $rootScope.appUser.userName,
        userId = $rootScope.appUser.userId;

    hotkeys.add({
        combo: 'ctrl+s',
        description: 'Save Purchase',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            $scope.savePurchase();
            event.preventDefault();
        }
    });

    var _init = function () {
        purchaseId = $routeParams.id;

        $scope.totalQuantity = 0;
        $scope.totalPrice = 0;
        $scope.totalGST = 0;
        $scope.totalGrand = 0;

        if (purchaseId) {
            // Load Purchase with purchaseId
            purchaseService.get(purchaseId).success(function (data) {
                $scope.purchase = data;
                $scope.busy = false;

                if ($emerge.firebaseRealTimeEnabled) {
                    $scope.firebasePurchase(data);
                }
            })
            .error(function (data, status, headers, config) {
                errorDisplay.show(data, status, headers, config);
            });
        } else {
            $scope.purchase.purchaseOrderDetailsList = [];
            $scope.busy = false;
        }
    }

    $scope.firebasePurchase = function (data) {
        var purchaseRef = new Firebase($emerge.firebaseUrl + "/purchaseOrders/");
        var purchaseRef2 = purchaseRef.child("PO_" + purchaseId);
        var purchaseRef3 = purchaseRef2.child("viewing");
        var idRef = purchaseRef.child("id");

        $scope.firebaseObj = {};
        $scope.firebaseObj2 = {};

        $scope.firebaseObj = $firebase(purchaseRef2);
        $scope.firebaseObj.$on("loaded", function (data2) {
            if (!data2) {
                $log.log('Room not found, creating room.');
                $scope.userList = $firebase(purchaseRef3);
                purchaseRef3.child(userId).set(userName);

                $interval(
                    function () {
                        purchaseRef2.child('PO').set(angular.fromJson(angular.toJson(data)));
                    }
                , 1000);
            }
            else {
                $log.log('Room found, listening.');
                $scope.userList = $firebase(purchaseRef3);
                purchaseRef3.child(userId).set(userName, function (result) { });

                _reSet = function () {
                    $timeout(function () {
                        purchaseRef2.once("value", function (data3) {
                            if (data3.val() != null) {
                                $scope.purchase = data3.val().PO;
                                $scope.purchase.supplierId = data3.val().PO.supplier;
                            }
                            _reSet();
                        });
                    }, 1000)
                };
                _reSet();

                $scope.purchase = data2.PO;
            }

            purchaseRef2.child("viewing").child(userId).onDisconnect().remove();
            purchaseRef3.on("child_removed", function (data) {
                purchaseRef3.once("value", function (data) {
                    var userList = _.filter(data.val(), function (e) {
                        return e;
                    });

                    if ((userList.length - 1) < 1) {
                        purchaseRef2.onDisconnect().remove();
                    }
                });
            });

            purchaseRef3.on("value", function (data) {
                var userList = _.filter(data.val(), function (e) {
                    return e;
                });

                if ((userList.length) == 1) {
                    purchaseRef2.onDisconnect().remove();
                } else {
                    purchaseRef2.onDisconnect().cancel();
                    purchaseRef2.child("viewing").child(userId).onDisconnect().remove();
                }
            });
        });
    }

    $scope.arrayAsync = {
        minimumInputLength: 3,
        id: function (obj) {
            return obj.productId; // use slug field for id
        },
        query: function (query) {
            productService.query(query.term, {tracker: 'none'}).success(function (data) {
                query.callback({ results: data.results });
            });
        },
        formatResult: function (data) {
            return data.name;
        },
        formatSelection: function (data) {
            return data.name || data.productName;
        },
        initSelection: function (element, callback) {
            var val = $(element).select2('val');
            //return callback((data));
        },
        escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
    };

    // process the form
    $scope.savePurchase = function () {
        var newPurchase = {};
        angular.copy($scope.purchase, newPurchase);
        newPurchase.tags = $scope.purchase.tags.length > 0 ? $scope.purchase.tags.join() : "";
        $scope.busy = true;
        // set scope variable submitted to true to force validation
        $scope.submitted = true;

        $timeout(function () {
            // check if the form is valid
            if (!$scope.myForm.$valid) {
                $scope.busy = false;
                alert($translate.instant('ALERT.FORM_ERROR'));
                return false;
            }

            // if purchaseId not empty update, else add
            if (purchaseId) {
                // Check if isApprovalRequired and if isApproved, if yes, prompt saving will resend for Approval process
                if (newPurchase.settings.isApprovalRequired && newPurchase.settings.isApproved) {
                    if (confirm($translate.instant('ALERT.APPROVAL_RESEND', { type: 'Purchase' }))) {

                    } else {
                        $scope.busy = false;
                        return;
                    }
                }
                purchaseService.put(purchaseId, newPurchase)
                    .success(function (data) {
                        alert($translate.instant('ALERT.UPDATED'));
                        $route.reload();
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });
            } else {
                purchaseService.add(newPurchase)
                    .success(function (data) {
                        alert($translate.instant('ALERT.CREATED'));
                        $location.url('purchases/' + data.purchaseOrderId);
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });;
            }
        })
    };

    $scope.sendApproval = function () {
        if (confirm($translate.instant('ALERT.APPROVAL_SEND'))) {
            $scope.approving = true;
            purchaseService.sendApproval(purchaseId).success(function (data) {
                alert($translate.instant('ALERT.SENT'));
                $location.url('purchases');
            })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.approving = false;
                });
        }
    };

    $scope.approve = function () {
        if (confirm($translate.instant('ALERT.APPROVAL_APPROVING'))) {
            $scope.approving = true;
            purchaseService.approve(purchaseId).success(function (data) {
                alert($translate.instant('ALERT.APPROVAL_APPROVED'));
                $location.url('purchases');
            })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.approving = false;
                });
        }
    };

    $scope.receive = function() {
        if (confirm($translate.instant('ALERT.CONVERTING'))) {
            $scope.duplicating = true;
            purchaseService.convert(purchaseId)
                .success(function (data) {
                    // alert(data.salesOrderId);
                    alert($translate.instant('ALERT.CONVERTED'));
                    $location.url('acquisitions/'+data.inventoryAcquisitionId);

                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.duplicating = false;
                });
        }
    }

    $scope.copyPurchase = function () {
        if (confirm($translate.instant('ALERT.DUPLICATING'))) {
            $scope.duplicating = true;
            purchaseService.duplicate(purchaseId)
                .success(function (data) {
                    // alert(data.salesOrderId);
                    alert($translate.instant('ALERT.DUPLICATED'));
                    $location.url('purchases/' + data.purchaseOrderId);

                })
                .error(function (error) {
                    errorDisplay.show(error);
                    $log.error(error);
                })
                .finally(function () {
                    $scope.duplicating = false;
                });
        }
    }

    $scope.openPurchasePDF = function (purchase) {
        var purchaseOrderId = purchase.purchaseOrderId;

        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'PUR/Purchases/PurchaseEdit/PurchasePDF.modal.html?a=a',
            controller: function ($scope, $log, $modalInstance, purchaseService, $filter, $sce, errorDisplay) {
                // assign new $scope.purchase to show in modal frontend for PDF Customized
                $scope.purchase = purchase;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    purchaseService.getPDF(purchase.purchaseOrderId)
                        .success(function (data) {
                            // on success, open the pdf in iFrame
                            var file = new Blob([data], { type: 'application/pdf' });
                            var fileURL = URL.createObjectURL(file);
                            $scope.pdfUrl = $sce.trustAsResourceUrl(fileURL);
                        })
                        .error(function (data, status, headers, config) {
                            if (status == 403) {
                                alert($translate.instant('ALERT.APPROVAL_REQUIRED'));
                                return;
                            }

                            errorDisplay.show(data, status, headers, config);
                        })
                        .finally(function () {
                            $scope.loading = false;
                        });
                }

                // init Preview PDF
                $scope.previewPDF();

                $scope.saveCustomized = function (purchase) {
                    purchaseService.patch(purchaseOrderId, purchase)
                        .success(function (data) {
                            alert($translate.instant('ALERT.UPDATED'));
                        })
                        .error(function (error) {
                            errorDisplay.show(error);
                            $log.error(error);
                        });
                }

                // open email dialog
                $scope.openEmail = function () {
                    $modal.open({
                        backdrop: 'static',
                        windowClass: 'modal-md',
                        keyboard: true,
                        templateUrl: 'PUR/Purchases/PurchaseEdit/PurchasePDFEmail.modal.html?a=a',
                        controller: function ($scope, $log, $modalInstance, errorDisplay) {
                            $scope.email = {};
                            // set the initial message for the email body
                            $scope.email.body = "Dear Sir / Madam, <br/><br/>Attached is a copy of Purchase Order.<br/><br/><br/>For additional enquires, please contact Us <br/><br/>Thank you.<br/><br/><br/>";

                            if ($scope.supplier)
                                $scope.email.recipientEmail = $scope.supplier.email;

                            $scope.sendEmail = function (emailForm) {
                                $scope.busyEmail = true;

                                // check if the form is valid
                                if (!emailForm.$valid) {
                                    $scope.busyEmail = false;
                                    alert($translate.instant('ALERT.FORM_ERROR'));
                                    return false;
                                }

                                // call api to send email
                                purchaseService.emailPDF(purchaseOrderId, $scope.email)
                                    .success(function (data) {
                                        alert($translate.instant('ALERT.SENT'));
                                    })
                                    .error(function (error) {
                                        errorDisplay.show(error);
                                        $log.error(error);
                                    })
                                    .finally(function () {
                                        $scope.busyEmail = false;
                                    });
                            }

                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };
                        }
                    });
                };

                $scope.ok = function () {
                    $modalInstance.close();
                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        });
    }

    // Add item into $scope.purchase.purchaseOrderDetailsList
    $scope.addItem = function () {
        $scope.purchase.purchaseOrderDetailsList.push({});
    }

    // Remove item from $scope.purchase.purchaseOrderDetailsList
    $scope.removeItem = function (index, purchaseOrderDetailsId) {
        var purchaseId = $routeParams.id;
        // check if purchaseOrderDetailsId is null, if not null, call delete item API
        if (purchaseOrderDetailsId) {
            if (confirm($translate.instant('ALERT.DELETING'))) {
                purchaseService.deleteItem(purchaseId, purchaseOrderDetailsId)
                    .success(function (data) {
                        $scope.purchase.purchaseOrderDetailsList.splice(index, 1);
                    })
                    .error(function (data) {
                        errorDisplay.show(data);
                    });
            }
        } else {
            $scope.purchase.purchaseOrderDetailsList.splice(index, 1);
        }
    }

    $scope.getUOMNumber = function (uomId, uomList) {
        var returnValue = 1;

        angular.forEach(uomList, function (key, value) {
            if (key.productUOMId == uomId) {
                returnValue = key.value;
                return false;
            };
        });

        return returnValue;
    }

    // Load Supplier on dropdown select change
    $scope.onChangedSupplier = function (supplierId) {
        if ($scope.selected.supplier != null) {
            $scope.supplier = $scope.selected.supplier;
            return;
        }

        var currentId = $scope.supplier != null ? $scope.supplier.supplierId : null;
        if (supplierId != currentId) {
            // clear supplier object
            $scope.supplier = null;

            if (supplierId) {
                supplierService.get(supplierId, { tracker: 'none' })
                    .success(function (data) {
                        $scope.supplier = data;

                        $scope.purchase.supplier = data;
                        // If the purchase order is new, use the supplier default data
                        if (!purchaseId) {
                            $scope.purchase.creditTermId = data.defaultCreditTermId;
                            $scope.purchase.currencyId = data.defaultCurrencyId;
                        }
                    })
                    .error(function () {
                        // TODO ERROR
                    });
            }
        }
    }

    $scope.onChangedProduct = function (index, item) {
        var newItem = {};
        newItem.product = {};
        // Get the purchaseOrderDetailsId so able to update the line item
        newItem.purchaseOrderDetailsId = $scope.purchase.purchaseOrderDetailsList[index].purchaseOrderDetailsId;

        newItem.productId = item.productId;
        newItem.productName = item.name;
        newItem.unitPrice = item.priceCost;
        newItem.description = item.description;
        newItem.qty = 1;

        newItem.product.uom = item.uom;
        newItem.product.productUOMList = item.productUOMList;

        $scope.purchase.purchaseOrderDetailsList[index] = newItem;
    }

    $scope.$watch('purchase', function (oldVal, newVal) {
        var totalQuantity;
        var totalPrice;
        var totalDiscount = 0;
        var totalAdditional;
        var totalGST;
        var totalGrand;
        var quotation = $scope.purchase;

        // Total Quantities of all items
        totalQuantity = _.reduce($scope.purchase.purchaseOrderDetailsList, function (memo, num) {
            var _qty = 0;
            if (num) {
                _qty = num.qty;
            }

            return Number(memo) + _qty;
        }, 0);

        // Total Price of all items
        totalPrice = _.reduce($scope.purchase.purchaseOrderDetailsList, function (currentTotal, value) {
            var _total = 0;

            if (value.unitPrice && value.qty) {
                _total += (value.unitPrice * value.qty);
            }

            return currentTotal + _total;
        }, 0);

        $scope.totalPrice = totalPrice;

        // get Total Delivery and Additional Charges
        totalAdditional = quotation.additionalCharges + quotation.freight;

        // Include Discount Amount
        if (quotation.discountType && quotation.discountAmount) {
            if (quotation.discountType == 1) {
                // Percentage
                totalDiscount = (totalPrice + totalAdditional) * (quotation.discountAmount) / 100;
            } else {
                // Fixed
                totalDiscount = quotation.discountAmount;
            }
        }

        // Include Delivery Charge and Additional Charge
        totalPrice = totalPrice + totalAdditional - totalDiscount;
        totalGST = 0; //totalPrice * 0.07 > 0 ? totalPrice * 0.07 : 0;
        totalGrand = totalPrice + totalGST;

        $scope.totalQuantity = totalQuantity || 0;
        $scope.totalGST = totalGST;
        $scope.totalGrand = totalGrand;

    }, true);

    _init();
});
