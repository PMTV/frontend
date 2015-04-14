

ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/payment', {templateUrl: 'ACC/AP/ApPayment/ApPayment.html'})
        .when('/payment/:id', {templateUrl: 'ACC/AP/ApPayment/ApPaymentEdit/ApPaymentEdit.html'})
        .when('/payment/new', {templateUrl: 'ACC/AP/ApPayment/ApPaymentEdit/ApPaymentEdit.html'})
}]);

ACC.factory('apPaymentService', function ($emerge, promiseTracker, $rootScope) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var ApPaymentBaseService = {
        getPurchaseOrderBySupplierId: function (id) {
            return $emerge.query('ecm/PaymentVoucher/getPurchaseOrderBySupplierId?supplierId=' + id);
        },
        getListPayment: function (page, step, searchText) {
            return $emerge.query('ecm/PaymentVoucher?page='+page+'&step='+step+'&q='+searchText);
        },
        getPaymentById: function (id) {
            return $emerge.query('ecm/PaymentVoucher/'+id);
        },
        deletePaymentVoucher: function (id) {
            return $emerge.delete('ecm/PaymentVoucher', id);
        },
        createPaymentVoucher: function (object) {
            return $emerge.add('ecm/PaymentVoucher', object);
        },
        updatePaymentVoucher: function (id, object) {
            return $emerge.update('ecm/PaymentVoucher', id, object);
        },
        savePDFPayment: function (id) {
            return $emerge.get('ecm/PaymentVoucher/'+id+'/GetPaymentVoucherPDF', '', { responseType: 'arraybuffer', tracker: 'null' });
        },
        sendEmailPDF: function (id, payment) {
            return $emerge.post('ecm/PaymentVoucher/'+id+'/SendPaymentVoucherEmail', payment);
        }
    };

    return ApPaymentBaseService;
});