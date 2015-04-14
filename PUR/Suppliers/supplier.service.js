PUR.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/suppliers', { templateUrl: 'PUR/suppliers/supplier.html' })
        .when('/suppliers/new', { templateUrl: 'PUR/suppliers/SupplierEdit/supplierEdit.html' })
        .when('/suppliers/:id', { templateUrl: 'PUR/suppliers/SupplierEdit/supplierEdit.html' });
}]);

PUR.factory('supplierService', function ($http, $emerge) {

    return {
        query: function () {
            return $emerge.query("suppliers");
        },
        get: function (supplierId, options) {
            return $emerge.get("suppliers", supplierId, options);
        },
        add: function (supplier) {
            return $emerge.add("suppliers", supplier);
        },
        update: function (supplier) {
            return $emerge.update("suppliers", supplier.supplierId, supplier);
        },
        patch: function (supplier, supplierId) {
            return $emerge.patch("suppliers", supplierId, supplier);
            //return $http.patch(url + customer.customerId, customer);
        },
        delete: function (supplierId) {
            return $emerge.delete("suppliers", supplierId);
        },
        getUrl: function () {
            return $emerge.getUrl("suppliers");
        },
        deleteAddress: function (supplierId, addressId) {
            return $emerge.delete("suppliers", supplierId, "/address?addressId=" + addressId);
        },
        deleteContact: function (supplierId, contactId) {
            return $emerge.delete("suppliers", supplierId, "/contact?contactId=" + contactId);
        }
    };
});
