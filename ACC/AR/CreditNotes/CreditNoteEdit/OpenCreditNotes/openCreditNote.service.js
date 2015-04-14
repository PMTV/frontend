
ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/openCreditNotes', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/OpenCreditNotes/openCreditNote.html' })
        .when('/openCreditNotes/new', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/OpenCreditNotes/openCreditNoteEdit.html' })
        .when('/openCreditNotes/:id', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/OpenCreditNotes/openCreditNoteEdit.html' })

        .when('/advanceCreditNotes', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AdvanceCreditNotes/advanceCreditNote.html' })
        .when('/advanceCreditNotes/new', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AdvanceCreditNotes/advanceCreditNoteEdit.html' })
        .when('/advanceCreditNotes/:id', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AdvanceCreditNotes/advanceCreditNoteEdit.html' })

        .when('/againstInvoice', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AgainstInvoice/againstInvoice.html' })
        .when('/againstInvoice/new', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AgainstInvoice/againstInvoiceEdit.html' })
        .when('/againstInvoice/:id', { templateUrl: 'ACC/AR/CreditNotes/CreditNoteEdit/AgainstInvoice/againstInvoiceEdit.html' });
}]);

var oDatatable;

// FACTORY
ACC.factory('openCreditNoteService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("OpenCreditNotes");
        },
        get: function (openCreditNoteId) {

            return $emerge.get("OpenCreditNotes", openCreditNoteId);
        },
        add: function (openCreditNote) {

            return $emerge.add("OpenCreditNotes", openCreditNote);
        },
        put: function (openCreditNoteId, openCreditNote) {

            return $emerge.update("OpenCreditNotes", openCreditNoteId, openCreditNote);
        },
        delete: function (openCreditNoteId) {
            return $emerge.delete("OpenCreditNotes", openCreditNoteId);
        },
        duplicate: function (openCreditNoteId) {
            return $emerge.update("OpenCreditNotes", openCreditNoteId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("OpenCreditNotes");
        },
        getByCustomer: function (customerId) {
            return $emerge.query("ecm/OpenCreditNotes?customerId=" + customerId);
        },
        printPDF: function (openCreditNoteId) {
            return $emerge.getUrl("OpenCreditNotes/" + openCreditNoteId + "/Pdf");
        },
    };
});