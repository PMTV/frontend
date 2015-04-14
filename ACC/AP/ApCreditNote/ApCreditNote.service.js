
ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/apCreditNote', { templateUrl: 'ACC/AP/ApCreditNote/ApCreditNote.html' })
        .when('/apCreditNote/new', { templateUrl: 'ACC/AP/ApCreditNote/ApCreditNoteEdit/ApCreditNoteEdit.html' })
        .when('/apCreditNote/:id', { templateUrl: 'ACC/AP/ApCreditNote/ApCreditNoteEdit/ApCreditNoteEdit.html' });
}]);

var oDatatable;

// FACTORY
ACC.factory('apCreditNoteService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("ecm/ApCreditNotes");
        },
        get: function (apCreditNoteId) {

            return $emerge.get("ecm/ApCreditNotes", apCreditNoteId);
        },
        add: function (apCreditNoteId) {

            return $emerge.add("ecm/ApCreditNotes", apCreditNoteId);
        },
        put: function (apCreditNoteId, apCreditNote) {

            return $emerge.update("ecm/ApCreditNotes", apCreditNoteId, apCreditNote);
        },
        delete: function (apCreditNoteId) {
            return $emerge.delete("ecm/ApCreditNotes", apCreditNoteId);
        },
        duplicate: function (apCreditNoteId) {
            return $emerge.update("ecm/ApCreditNotes", apCreditNoteId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("ecm/ApCreditNotes");
        },
        printPDF: function (creditId) {
            return $emerge.getUrl("ecm/ApCreditNotes/" + creditId + "/Pdf");
        },
        deleteItem: function (apCreditNoteDetailsId) {
            return $emerge.delete("ecm/ApCreditNotes", 'Item?apCreditNoteDetailsId=' + apCreditNoteDetailsId);
        }
    };
});