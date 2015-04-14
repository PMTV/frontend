
ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/receipts', { templateUrl: 'ACC/AR/Receipts/receipt.html' })
        .when('/receipts/new', { templateUrl: 'ACC/AR/Receipts/ReceiptEdit/receiptEdit.html' })
        .when('/receipts/:id', { templateUrl: 'ACC/AR/Receipts/ReceiptEdit/receiptEdit.html' });
}]);

var oDatatable;

// FACTORY
ACC.factory('receiptService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        query: function () {
            return $emerge.query("Receipts");
        },
        get: function (receiptId) {
            return $emerge.get("Receipts", receiptId);
        },
        add: function (receipt) {
            // Exclude properties to update
            // invoice.supplier = null;
            // angular.forEach(invoice.invoiceDetailsList, function (key, value) {
            //     key.product = null;
            //     // key.productUOM = null;
            //     // key.productUOMId = key.productUOMId || null;
            // });

            return $emerge.add("Receipts", receipt);
        },
        put: function (receiptId, receipt) {
            // Exclude properties to update
            // purchase.supplier = null;
            // angular.forEach(debitNote.invoiceDetailsList, function (key, value) {
            //     key.product = null;
            //     // key.productUOM = null;
            //     // key.productUOMId = key.productUOMId || null;
            // });

            return $emerge.update("Receipts", receiptId, receipt);
        },
        delete: function (receiptId) {
            return $emerge.delete("Receipts" , receiptId);
        },
        // deleteItem: function (debitNoteId, invoiceDetailsId) {
        //     return $emerge.delete("DebitNotes", invoiceId + '/Item?invoiceDetailsId=' + invoiceDetailsId);
        // },
        duplicate: function (receiptId) {
            return $emerge.update("Receipts", receiptId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("Receipts");
        },
        printPDF: function (receiptId) {
            return $emerge.getUrl("Receipts/" + receiptId + "/Pdf");
        }
    };
});