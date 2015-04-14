

ACC.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/prepayment', {templateUrl: 'ACC/AP/ApPrepayment/ApPrepayment.html'})
        .when('/prepayment/:id', {templateUrl: 'ACC/AP/ApPrepayment/ApPrepaymentEdit/ApPrepaymentEdit.html'})
        .when('/prepayment/new', {templateUrl: 'ACC/AP/ApPrepayment/ApPrepaymentEdit/ApPrepaymentEdit.html'})
}]);

ACC.factory('apPrepaymentService', function ($emerge, promiseTracker, $rootScope) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var ApPrepaymentBaseService = {
        getPurchaseOrderList: function (id) {
            return $emerge.query('ecm/Prepayment/getPurchaseOrderBySupplierId?supplierId='+id);
        },
        getListPrepayment: function (page, step, searchText) {
            return $emerge.query('ecm/Prepayment?page='+page+'&step='+step+'&q='+searchText);
        },
        getPrepaymentById: function (id) {
            return $emerge.query('ecm/Prepayment/'+id);
        },
        createPrepayment: function (object) {
            return $emerge.add('ecm/Prepayment', object);
        },
        updatePrepayment: function (id, object) {
            return $emerge.update('ecm/Prepayment', id, object);
        },
        deletePrepayment: function (id) {
            return $emerge.delete('ecm/Prepayment', id);
        },
        savePDFPrepayment: function (id) {
            return $emerge.get('ecm/Prepayment/'+id+'/GetPrepaymentPDF', '', { responseType: 'arraybuffer', tracker: 'null' });
        },
        sendEmailPDF: function (id, prepayment) {
            return $emerge.post('ecm/Prepayment/'+id+'/SendPrepaymentEmail', prepayment);
        }
    };

    return ApPrepaymentBaseService;
});