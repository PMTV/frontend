var ACC = angular.module('ACC', []);

ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/invoices', { templateUrl: 'ACC/AR/Invoices/invoice.html' })
        .when('/invoices/new', { templateUrl: 'ACC/AR/Invoices/InvoiceEdit/invoiceEdit.html' })
        .when('/invoices/:id', { templateUrl: 'ACC/AR/Invoices/InvoiceEdit/invoiceEdit.html' });
}]);

var oDatatable;

// FACTORY
ACC.factory('invoiceService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("invoices");
        },
        get: function (invoiceId) {
            return $emerge.get("invoices", invoiceId);
        },
        getByCustomerId: function (customerId) {
            return $emerge.query("invoices/GetByCustomer?customerId=" + customerId);
        },
        GetUnPaidInvoicesByCustomer: function (customerId) {
            return $emerge.query("invoices/GetUnPaidInvoicesByCustomer?customerId=" + customerId);
        },
        add: function (invoice) {
            // Exclude properties to update
            // invoice.supplier = null;
            angular.forEach(invoice.invoiceDetailsList, function (key, value) {
                key.product = null;
                // key.productUOM = null;
                // key.productUOMId = key.productUOMId || null;
            });

            return $emerge.add("invoices", invoice);
        },
        put: function (invoiceId, invoice) {
            // Exclude properties to update
            // purchase.supplier = null;
            angular.forEach(invoice.invoiceDetailsList, function (key, value) {
                key.product = null;
                // key.productUOM = null;
                // key.productUOMId = key.productUOMId || null;
            });

            return $emerge.update("invoices", invoiceId, invoice);
        },
        patch: function (invoiceId, invoice) {
            return $emerge.patch("invoices", invoiceId, invoice);
        },
        delete: function (invoiceId) {
            return $emerge.delete("invoices", invoiceId);
        },
        deleteItem: function (invoiceId, invoiceDetailsId) {
            return $emerge.delete("invoices", invoiceId + '/Item?invoiceDetailsId=' + invoiceDetailsId);
        },
        duplicate: function (invoiceId) {
            return $emerge.update("invoices", invoiceId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("invoices");
        },
        getPDF: function (invoiceId) {
            return $emerge.get("invoices", invoiceId + "/pdf", { responseType: 'arraybuffer', tracker: 'null' });
        },
        emailPDF: function (invoiceId, invoice) {
            return $emerge.post("invoices/" + invoiceId + "/email", invoice);
        }
    };
});