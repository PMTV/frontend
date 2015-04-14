
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
ACC.factory('againstInvoiceService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("CreditNotes");
        },
        get: function (creditNoteId) {

            return $emerge.get("CreditNotes", creditNoteId);
        },
        add: function (creditNote) {

            return $emerge.add("CreditNotes", creditNote);
        },
        put: function (creditNoteId, creditNote) {

            return $emerge.update("CreditNotes", creditNoteId, creditNote);
        },
        delete: function (creditNoteId) {
            return $emerge.delete("CreditNotes", creditNoteId);
        },
        duplicate: function (creditNoteId) {
            return $emerge.update("CreditNotes", creditNoteId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("CreditNotes");
        },
        printPDF: function (creditId) {
            return $emerge.getUrl("CreditNotes/" + creditId + "/Pdf");
        },
        deleteItem: function (creditId, creditNoteDetailsId) {
            return $emerge.delete("CreditNotes", creditId + '/Item?creditNoteDetailsId=' + creditNoteDetailsId);
        }
    };
});