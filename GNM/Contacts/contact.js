GNM.directive('panelContact', function ($http, $translate, $timeout, customerService, supplierService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            customer: '=',
            supplier: '='
        },
        templateUrl: 'GNM/Contacts/contact.partial.html?a=aaa',
        link: function (scope, element, attrs) {
            
        },

        // the variable is available in directive controller,
        // and can be fetched as done in link function
        controller: ['$scope', function ($scope) {
            $scope.showContactForm = false;

            $scope.$watch('supplier', function (val) {
                if (val)
                    $scope.model = $scope.supplier;
            }, true);

            $scope.$watch('customer', function (val) {
                if (val)
                    $scope.model = $scope.customer;
            }, true);

            $scope.deleteContact = function (contact) {
                var index = $scope.model.contactList.indexOf(contact);

                var index = $scope.model.contactList.indexOf(contact);
                if (contact.contactId) {
                    if (confirm($translate.instant('ALERT.DELETING'))) {
                        if ($scope.model.supplierId) {
                            supplierService.deleteContact($scope.model.supplierId, contact.contactId).success(function () {
                                $scope.model.contactList.splice(index, 1);
                            });
                        }
                        else if ($scope.model.customerId) {
                            customerService.deleteContact($scope.model.customerId, contact.contactId).success(function () {
                                $scope.model.contactList.splice(index, 1);
                            });
                        }
                    }
                } else {
                    $scope.model.contactList.splice(index, 1);
                }
            };

            $scope.setDefault = function(contact)
            {   
                // console.log(contact);
                _.filter($scope.model.contactList, function(item){
                    // console.log(item);
                    item.default = false;
                });
                contact.default = true;
                // console.log($scope.model.contactList);
            }

            $scope.addContact = function () {
                $scope.submitted = true;

                if (!$scope.contactForm.$valid) {
                    return false;
                }

                // Hide the edit contact form
                $scope.showContactForm = false;
                var contactToAdd = angular.copy($scope.newContact);
                var index = $scope.model.contactList.indexOf($scope.newContact);

                // if contact not in contactList, add it in so that there's no duplicates
                if (index < 0) {

                    $scope.model.contactList.push(contactToAdd);
                }

                // reset newcontact scope to null
                $scope.newContact = {};
                $scope.mode = "";
                $scope.submitted = false;
            };

            $scope.editContact = function (contact) {
                var contactToEdit = angular.copy(contact);
                // reset newcontact scope to null
                $scope.newContact = contact;
                $scope.showContactForm = true;
                $scope.mode = "edit";
            };
        }]
    };
})