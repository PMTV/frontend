
ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/creditNoteApAgainstInvoice', { templateUrl: 'ACC/AP/CreditNoteApAgainstInvoice/CreditNoteApAgainstInvoice.html' })
        .when('/creditNoteApAgainstInvoice/new', { templateUrl: 'ACC/AP/CreditNoteApAgainstInvoice/CreditNoteApAgainstInvoiceEdit/CreditNoteApAgainstInvoiceEdit.html' })
        .when('/creditNoteApAgainstInvoice/:id', { templateUrl: 'ACC/AP/CreditNoteApAgainstInvoice/CreditNoteApAgainstInvoiceEdit/CreditNoteApAgainstInvoiceEdit.html' });
}]);

var oDatatable;

// FACTORY
ACC.factory('creditNoteApAgainstInvoiceService', function ($rootScope, $http, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    return {
        //query: function () {
        //    return $emerge.query("ecm/CreditNoteApAgainstInvoices");
        //},
        query: function (q, step, page, sort, asc, options) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc
            }

            return $emerge.query("ecm/CreditNoteApAgainstInvoices", params, options);
        },
        get: function (creditNoteApAgainstInvoiceId) {
            return $emerge.get("ecm/CreditNoteApAgainstInvoices", creditNoteApAgainstInvoiceId);
        },
        getByPuchaseOrder: function (purchaseOrderId) {
            return $emerge.get("ecm/CreditNoteApAgainstInvoices", "GetByPuchaseOrder?purchaseOrderId=" + purchaseOrderId);
        },
        add: function (creditNoteApAgainstInvoiceId) {

            return $emerge.add("ecm/CreditNoteApAgainstInvoices", creditNoteApAgainstInvoiceId);
        },
        put: function (creditNoteApAgainstInvoiceId, creditNoteApAgainstInvoice) {

            return $emerge.update("ecm/CreditNoteApAgainstInvoices", creditNoteApAgainstInvoiceId, creditNoteApAgainstInvoice);
        },
        delete: function (creditNoteApAgainstInvoiceId) {
            return $emerge.delete("ecm/CreditNoteApAgainstInvoices", creditNoteApAgainstInvoiceId);
        },
        getUrl: function () {
            return $emerge.getUrl("ecm/CreditNoteApAgainstInvoices");
        },
        printPDF: function (creditNoteApAgainstInvoiceId) {
            return $emerge.get("ecm/CreditNoteApAgainstInvoices/" + creditNoteApAgainstInvoiceId + "/Pdf", '', { responseType: 'arraybuffer', tracker: 'null' });
        },
        deleteItem: function (creditNoteApAgainstInvoiceDetailsId) {
            return $emerge.delete("ecm/CreditNoteApAgainstInvoices", 'Item?creditNoteApAgainstInvoiceDetailsId=' + creditNoteApAgainstInvoiceDetailsId);
        }
    };
});