// CONTROLLERS

// Sales Order List Controller
ORD.controller('DeliveryListCtrl', function ($scope, $http, deliveryService, errorDisplay) {
    $scope.deliveries = [];
    var selectedDeliveries = $scope.selectedDeliveries = [];

    $scope.columnDefs = [
            { field: 'deliveryOrderNumber', displayName: 'Delivery Order #' },
            { field: 'customerCompany', displayName: 'Company Name' },
            { field: 'customerName', displayName: 'Customer Name' },
            { field: 'deliveryOrderStatusId', displayName: 'Status', cellTemplate: '<div class="ngCellText">{{row.entity.deliveryOrderStatusId | deliveryStatus}}</div>' },
            { field: 'dateCreated', displayName: 'Date Created', cellFilter: 'date', visible: false },
            { field: 'deliveryOrderId', displayName: 'Actions', cellTemplate: '<a href="#/deliveries/{{row.entity.deliveryOrderId}}" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><a class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete(row.entity.deliveryOrderId)">Delete</a>', sortable: false, headerClass: 'unsortable', width: '15%' }
    ];

    $scope.gridOptions = {
        showColumnMenu: true,
        showGroupPanel: false
    };
});

// Sales Order Edit Controller
ORD.controller('DeliveryEditCtrl', function ($scope, $http, $route, $routeParams, $location, $filter, $modal, $anchorScroll, $timeout, $translate, hotkeys, errorDisplay, deliveryService, customerService, productService, salesService) {
    var deliveryId = $routeParams.id;
    $scope.delivery = {};
    $scope.delivery.tags = "";

    $scope.customer = null;
    $scope.selected = {}; // to use with customersDropdown directive

    $scope.selectedSalesOrder = {};
    $scope.customerId = null;
    $scope.getTotalQuantity = 0;

    $scope.busy = false;
    $scope.customerHidden = false;

    hotkeys.add({
        combo: 'ctrl+s',
        description: 'Save Delivery Order',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event, hotkey) {
            $scope.saveDelivery();
            event.preventDefault();
        }
    });

    $scope.selectStatus = function (statusId) {
        $scope.changingStatus = true;

        deliveryService.updateStatus(deliveryId, statusId)
            .success(function (data) {
                // if status set back to "Pending Approval", set "isApproved" to false
                if (statusId == 3) {
                    //$scope.delivery.settings.isApproved = false;
                };
                $scope.delivery.deliveryOrderStatusId = statusId;
                alert($translate.instant('ALERT.UPDATED'));
            })
            .error(function (error, status) {
                // if error is 403 (forbidden), set "isApproved" to false
                if (status == 403) {
                    //$scope.delivery.settings.isApproved = false;
                };
                errorDisplay.show(error);
                $log.error(error);
            })
        .finally(function () {
            $scope.changingStatus = false;
        });
    };


    var _init = function () {
        // $routeParams.id will contain the primary key of the item to edit, or be empty

        $scope.statusArr = deliveryService.getAllStatus();

        // if we are creating a new product
        if (deliveryId) {
            // Load Sales with salesId
            $scope.showFirst = true;

            deliveryService.get(deliveryId).success(function (data) {
                // copy the result into scope model
                angular.copy(data, $scope.delivery);

                var temp = $scope.delivery.dateDelivered;
                if($scope.delivery.dateUpdated != null){
                    temp = $scope.delivery.dateUpdated;
                }
                $scope.delivery.dateDelivery = $filter('date')(temp, "dd/MM/yyyy");

                // set tags by scope tags populated via tagsChanged method
                $scope.delivery.tags = data.tags;

                // assign customer object to scope, this will show the customer sidebar

                $scope.customer = data.customer;
                $scope.busy = false;
            });
        } else {
            $scope.delivery.deliveryOrderDetailsList = [];
            $scope.busy = false;
            $scope.showSecond = true;
        }
    }

    $scope.openDeliveryPDF = function (delivery) {
        var deliveryOrderId = delivery.deliveryOrderId;

        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'modal-lg',
            keyboard: true,
            templateUrl: 'ORD/Deliveries/DeliveryOrders/DeliveryEdit/deliveryPDF.modal.html?a=aaa',
            controller: function ($scope, $log, $modalInstance, deliveryService, $filter, $sce, errorDisplay) {
                // assign new $scope.quotation to show in modal frontend for PDF Customized
                $scope.delivery = delivery;
                $scope.loading = false;

                $scope.previewPDF = function () {
                    $scope.loading = true;
                    $scope.pdfUrl = "";

                    // Load PDF using API
                    deliveryService.getPDF(delivery.deliveryOrderId)
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

                $scope.saveCustomized = function (delivery) {
                    deliveryService.patch(deliveryOrderId, delivery)
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
                        templateUrl: 'ORD/Deliveries/DeliveryOrders/DeliveryEdit/deliveryPDFEmail.modal.html?a=a',
                        controller: function ($scope, $log, $modalInstance, errorDisplay) {
                            $scope.email = {};
                            // set the initial message for the email body
                            $scope.email.body = "Dear Sir / Madam, <br/><br/>Attached is a copy of Delivery Order.<br/><br/><br/>For additional enquires, please contact Us <br/><br/>Thank you.<br/><br/><br/>";

                            if ($scope.customer)
                                $scope.email.recipientEmail = $scope.customer.email;

                            $scope.sendEmail = function (emailForm) {
                                $scope.busyEmail = true;

                                // check if the form is valid
                                if (!emailForm.$valid) {
                                    $scope.busyEmail = false;
                                    alert($translate.instant('ALERT.FORM_ERROR'));
                                    return false;
                                }

                                // call api to send email
                                deliveryService.emailPDF(deliveryOrderId, $scope.email)
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

    $scope.checkExist = function (item) {
        var Exists = $.grep($scope.delivery.deliveryOrderDetailsList, function (e) {
            return e.salesOrderDetailsId === item.salesOrderDetailsId;
        })
        if (Exists.length) {
            item.checked = true;

        } else {
            item.checked = false;
        }
    }

    $scope.selectItem = function (item) {
        var exists = _.filter($scope.delivery.deliveryOrderDetailsList, function (e) {
            return e.salesOrderDetailsId === item.salesOrderDetailsId;
        })

        if (exists.length) {
            item.checked = false;

        } else {
            item.checked = true;
            var newItem = {};
            newItem.salesOrderDetailsId = item.salesOrderDetailsId;
            newItem.salesOrderNumber = $scope.selectedSalesOrder.salesOrderNumber;
            newItem.remarks = item.remarks;
            newItem.qty = item.qty;
            newItem.productName = item.productName;
            newItem.productUOMName = item.productUOMName;
            newItem.productUOMValue = item.productUOMValue;
            $scope.delivery.deliveryOrderDetailsList.push(newItem);
        }
    }

    $scope.removeSelected = function (index) {
        $scope.delivery.deliveryOrderDetailsList.splice(index, 1);
    }

    $scope.addDeliveryItem = function () {
        $scope.delivery.deliveryOrderDetailsList.push({});
    }
    $scope.removeDishesItem = function (index) {
        $scope.delivery.deliveryOrderDetailsList.splice(index);
    }
    $scope.selectCategory = function (id) {
        $scope.delivery.deliveryOrderDetailsList[0].productId = id;
        $scope.delivery.deliveryOrderDetailsList[1].productId = id;
    }

    $scope.tagsChanged = function () {
        var tags = $scope.delivery.tags;

        if (angular.isArray(tags)) {
            $scope.delivery.tags = tags.join();
        }
    }

    // process the form
    $scope.saveDelivery = function () {
        var newDelivery = {};
        angular.copy($scope.delivery, newDelivery);
        newDelivery.dateDelivery = $filter('date')(newDelivery.dateDelivery, "yyyy/MM/dd hh:mm:ss");
        
        $timeout(function () {
            $scope.busy = true;
            // set scope variable submitted to true to force validation
            $scope.submitted = true;

            // check if the form is valid
            if (!$scope.myForm.$valid) {
                $scope.busy = false;
                alert($translate.instant('ALERT.FORM_ERROR'));
                return false;
            }

            // if salesId not empty update, else add
            if (deliveryId) {
                deliveryService.update(deliveryId, newDelivery)
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
                deliveryService.add(newDelivery)
                    .success(function (data) {
                        alert($translate.instant('ALERT.CREATED'));
                        $location.url('deliveries/' + data.deliveryOrderId);
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                    })
                    .finally(function () {
                        $scope.busy = false;
                    });;
            }
        });
    };

    // Add item into $scope.quotation.quotationOrderDetailsList
    $scope.addDeliveryItem = function () {
        $scope.delivery.deliveryOrderDetailsList.push({});
    }

    // Remove item from $scope.sales.salesOrderDetailsList
    $scope.removeDeliveryItem = function (index, deliveryOrderDetailsId) {
        var deliveryId = $routeParams.id;
        // check if salesOrderDetailsId is null, if not null, call delete item API
        if (deliveryOrderDetailsId) {
            if (confirm('Delete Item from delivery order?')) {
                deliveryService.deleteItem(deliveryId, deliveryOrderDetailsId)
                    .success(function (data) {
                        $scope.delivery.deliveryOrderDetailsList.splice(index, 1);
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                    });
            }
        } else {
            $scope.delivery.deliveryOrderDetailsList.splice(index, 1);
        }
    }

    $scope.onChangedSalesOrder = function (id) {
        if (id) {
            salesService.get(id)
                .success(function (data) {
                    $scope.selectedSalesOrder = data;
                })
        }
    }

    // Load Customer on dropdown select change
    $scope.onChangedCustomer = function (customerId) {
        if (isNaN(customerId)) {
            return;
        }

        if ($scope.selected.customer != null) {
            $scope.customer = $scope.selected.customer;
            console.log($scope.customer);
            return;
        }

        var currentId = $scope.customer != null ? $scope.customer.customerId : null;
        if (customerId != currentId) {
            // clear customer object
            $scope.customer = null;

            if (customerId) {
                customerService.get(customerId, { tracker: 'none' })
                    .success(function (data) {
                        $scope.customer = data;
                    })
                    .error(function (error) {
                        // TODO ERROR
                        errorDisplay.show(error);
                    });
            }
        }
    }

    $scope.onChangedTags = function () {
        var tags = $scope.delivery.tags;

        if (angular.isArray(tags)) {
            $scope.delivery.tags = tags.join();
        }
    }

    $scope.$watch('delivery.deliveryOrderDetailsList', function (newval, oldval) {
        var sum = _.reduce($scope.delivery.deliveryOrderDetailsList, function (memo, num) { return Number(memo) + Number(num.qty); }, 0);
        $scope.getTotalQuantity = sum;
    }, true);

    _init();
});
