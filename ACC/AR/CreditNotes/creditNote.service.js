
ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/openCreditNotes', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/OpenCreditNotes/openCreditNote.html' })
        .when('/openCreditNotes/new', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/OpenCreditNotes/openCreditNotesEdit.html' })
        .when('/openCreditNotes/:id', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/OpenCreditNotes/openCreditNotesEdit.html' })

        .when('/advanceCreditNotes', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AdvanceCreditNotes/advanceCreditNote.html' })
        .when('/advanceCreditNotes/new', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AdvanceCreditNotes/advanceCreditNoteEdit.html' })
        .when('/advanceCreditNotes/:id', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AdvanceCreditNotes/advanceCreditNoteEdit.html' })

        .when('/againstInvoice', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AgainstInvoice/againstInvoice.html' })
        .when('/againstInvoice/new', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AgainstInvoice/againstInvoiceEdit.html' })
        .when('/againstInvoice/:id', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AgainstInvoice/againstInvoiceEdit.html' });
}]);

var oDatatable;

// FACTORY
ACC.factory('creditNoteService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("CreditNotes");
        },
        get: function (invoiceId) {
            return $emerge.get("CreditNotes", invoiceId);
        },
        add: function (invoice) {
            // Exclude properties to update
            // invoice.supplier = null;
            angular.forEach(invoice.invoiceDetailsList, function (key, value) {
                key.product = null;
                // key.productUOM = null;
                // key.productUOMId = key.productUOMId || null;
            });

            return $emerge.add("CreditNotes", invoice);
        },
        put: function (invoiceId, invoice) {
            // Exclude properties to update
            // purchase.supplier = null;
            angular.forEach(invoice.invoiceDetailsList, function (key, value) {
                key.product = null;
                // key.productUOM = null;
                // key.productUOMId = key.productUOMId || null;
            });

            return $emerge.update("CreditNotes", invoiceId, invoice);
        },
        delete: function (invoiceId) {
            return $emerge.delete("CreditNotes", invoiceId);
        },
        deleteItem: function (invoiceId, invoiceDetailsId) {
            return $emerge.delete("CreditNotes", invoiceId + '/Item?invoiceDetailsId=' + invoiceDetailsId);
        },
        duplicate: function (invoiceId) {
            return $emerge.update("CreditNotes", invoiceId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("CreditNotes");
        },
        printPDF : function(creditId) {
            return $emerge.get("CreditNotes", creditId + "/Pdf");
        }
    };
});