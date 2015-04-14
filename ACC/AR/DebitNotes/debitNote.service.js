
ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/debitNotes', { templateUrl: 'ACC/AR/DebitNotes/debitNote.html' })
        .when('/debitNotes/new', { templateUrl: 'ACC/AR/DebitNotes/DebitNoteEdit/debitNoteEdit.html' })
        .when('/debitNotes/:id', { templateUrl: 'ACC/AR/DebitNotes/DebitNoteEdit/debitNoteEdit.html' });
}]);

var oDatatable;

// FACTORY
ACC.factory('debitNoteService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("DebitNotes");
        },
        get: function (debitNoteId) {
            return $emerge.get("DebitNotes", debitNoteId);
        },
        add: function (debitNote) {
            // Exclude properties to update
            // invoice.supplier = null;
            // angular.forEach(invoice.invoiceDetailsList, function (key, value) {
            //     key.product = null;
            //     // key.productUOM = null;
            //     // key.productUOMId = key.productUOMId || null;
            // });

            return $emerge.add("DebitNotes", debitNote);
        },
        put: function (debitNoteId, debitNote) {
            // Exclude properties to update
            // purchase.supplier = null;
            // angular.forEach(debitNote.invoiceDetailsList, function (key, value) {
            //     key.product = null;
            //     // key.productUOM = null;
            //     // key.productUOMId = key.productUOMId || null;
            // });

            return $emerge.update("DebitNotes", debitNoteId, debitNote);
        },
        delete: function (debitNoteId) {
            return $emerge.delete("DebitNotes", debitNoteId);
        },
        // deleteItem: function (debitNoteId, invoiceDetailsId) {
        //     return $emerge.delete("DebitNotes", invoiceId + '/Item?invoiceDetailsId=' + invoiceDetailsId);
        // },
        duplicate: function (debitNoteId) {
            return $emerge.update("DebitNotes", debitNoteId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("DebitNotes");
        },
        printPDF: function (debitNoteId) {
            return $emerge.getUrl("DebitNotes/" + debitNoteId + "/Pdf");
        },
    };
});