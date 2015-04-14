GNM.factory('giftService', function ($http, $emerge) {
    return {
        query: function () {
            return $emerge.query("ecm/gift");
        },
        add: function (data) {
            // TODO Remove when USR Module ready
            return $emerge.add("ecm/gift", data);
        },
        update: function (data) {
            return $emerge.update("ecm/gift", data.giftId, data);
        },
        delete: function (giftId) {
            // TODO Remove when USR Module ready
            return $emerge.delete("ecm/gift", giftId);
        }
    };
});

/*
Get all the creditTerms information
- $scope.deleteFn is called to delete a particular creditTerm
- creditTermId is stored once user click on delete button
*/
GNM.controller('GiftCtrl', function ($scope, $http, CreditTermService) {

});

GNM.controller('GiftAddCtrl', function ($scope, $http, $location, CreditTermService) {
});

GNM.controller('GiftUpdateCtrl', function ($scope, $http, $location, CreditTermService) {
    $scope.giftTerm = {};
});

GNM.directive('giftDropdown', function ($log, $modal, giftService) {
    return {
        restrict: 'E',
        replace: true,
        template: '' +
            '<select ui-select2 class="ui-select2">' +
                '<option value="">Loading Gift Terms</option>' +
                '<option ng-repeat="c in giftArr" value="{{c.giftId}}">{{c.name}}</option>' +
            '</select>',
        link: function (scope, element, attrs) {
            scope.giftArr = [];

            giftService.query().then(function (data) {
                // Once ajax loaded, change first option text to "Please Select"
                element[0].options[0].text = 'Please Select';

                if (data.data.length <= 0) {
                    // alert('Please add a Credit Term first');
                    // TODO Redirect to adding Supplier or popup
                    return false;
                }

                scope.giftArr = (data.data);
            });
            var dialog;
            scope.addCreditTerm = function () {
                dialog = $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: 'modal-preview',
                    templateUrl: 'GNM/Gift/GiftModal.html',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.busy = false;
                        $scope.gift = {};
                        $scope.giftArr = scope.giftArr;

                        $scope.save = function () {
                            $scope.submitted = true;
                            if (!$scope.gift.name) {
                                return false;
                            }
                            $scope.busy = true;

                            if (!$scope.gift.giftId) {
                                giftService.add($scope.gift)
                                    .success(function (data) {
                                        scope.giftArr.push(data);
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
                                        //scope.creditTermsArr.push(data);
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
                            bootstrapConfirm('Do you want to proceed to Delete?', function () {
                                giftService.delete(id)
                                    .success(function () {
                                        scope.giftArr.splice(index, 1);
                                        $scope.giftArr.splice(index, 1);
                                        alert('Successfully Deleted');
                                    })
                                    .error(function (data) {
                                        alert(data);
                                    });
                            });
                        }

                        $scope.editItem = function (item) {
                            $scope.gift = item;
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.manage = function () {
                            console.log(dialog);
                        }
                    }
                });
                dialog.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
        }
    };
});