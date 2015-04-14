
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
ACC.factory('advanceCreditNoteService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("AdvanceCreditNotes");
        },
        get: function (advanceCreditNoteId) {

            return $emerge.get("AdvanceCreditNotes", advanceCreditNoteId);
        },
        add: function (advanceCreditNote) {

            return $emerge.add("AdvanceCreditNotes", advanceCreditNote);
        },
        put: function (advanceCreditNoteId, advanceCreditNote) {

            return $emerge.update("AdvanceCreditNotes", advanceCreditNoteId, advanceCreditNote);
        },
        delete: function (advanceCreditNoteId) {
            return $emerge.delete("AdvanceCreditNotes", advanceCreditNoteId);
        },
        duplicate: function (advanceCreditNoteId) {
            return $emerge.update("AdvanceCreditNotes", advanceCreditNoteId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("AdvanceCreditNotes");
        },
        printPDF: function (advanceCreditNoteId) {
            return $emerge.getUrl("AdvanceCreditNotes/" + advanceCreditNoteId + "/Pdf");
        },
    };
});