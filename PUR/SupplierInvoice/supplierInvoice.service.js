
PUR.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/purchase-invoice', { templateUrl: 'PUR/SupplierInvoice/supplierInvoice.html' })
        .when('/purchase-invoice/new', { templateUrl: 'PUR/SupplierInvoice/SupplierInvoiceEdit/supplierInvoiceEdit.html' })
        .when('/purchase-invoice/:id', { templateUrl: 'PUR/SupplierInvoice/SupplierInvoiceEdit/supplierInvoiceEdit.html' });
}]);


PUR.factory('supplierInvoiceService', function ($rootScope, $http, $emerge, promiseTracker){
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var SupplierInvoiceBaseService = {
        getPurchaseOrderBySupplierId: function (supplierId, isSupplierCreated) {
            return $emerge.query('ecm/SupplierInvoice/getPurchaseOrderBySupplierId?supplierId=' + supplierId + '&isSupplierCreated=' + isSupplierCreated);
        },
        getAllSupplierInvoiceList: function (page, step, searchText) {
            return $emerge.query('ecm/SupplierInvoice?page=' + page + '&step=' + step + '&q=' + searchText);
        },
        getSupplierInvoiceById: function (id) {
            return $emerge.query('ecm/SupplierInvoice?supplierInvoiceId=' + id);
        },
        createNewSupplierInvoice: function (object) {
            return $emerge.add('ecm/SupplierInvoice', object);
        },
        updateSupplierInvoice: function (object) {
            return $emerge.update('ecm/SupplierInvoice', object.supplierInvoiceId, object);
        },
        deleteSupplierInvoice: function (id) {
            return $emerge.delete('ecm/SupplierInvoice', id);
        },
        getBySupplier: function (supplierId) {
            return $emerge.query('ecm/SupplierInvoice/GetBySupplier?supplierId=' + supplierId);
        },
        savePDFSupplierInvoice: function (id) {
            return $emerge.get('ecm/SupplierInvoice/'+id+'/GetSupplierInvoicePDF', '', { responseType: 'arraybuffer', tracker: 'null' });
        },
        sendEmailPDF: function (id, supplierInvoice) {
            return $emerge.post('ecm/SupplierInvoice/'+id+'/SendSupplierInvoiceEmail', supplierInvoice);
        },
        deleteSupplierItem: function (supplierInvoiceid, supplierInvoiceDetailId) {
            return $emerge.delete("ecm/SupplierInvoice", supplierInvoiceid + '/Item?supplierInvoiceDetailId=' + supplierInvoiceDetailId);
        }
    };

    return SupplierInvoiceBaseService;

});