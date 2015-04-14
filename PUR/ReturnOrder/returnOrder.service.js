
PUR.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/returnOrder', { templateUrl: 'PUR/ReturnOrder/returnOrder.html' })
        .when('/returnOrder/new', { templateUrl: 'PUR/ReturnOrder/ReturnOrderEdit/ReturnOrderEdit.html' })
        .when('/returnOrder/:id', { templateUrl: 'PUR/ReturnOrder/ReturnOrderEdit/ReturnOrderEdit.html' });
}]);


PUR.factory('returnOrderService', function ($rootScope, $http, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var returnOrderBaseService = {
        query: function (q, step, page, sort, asc, options) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc
            }

            return $emerge.query("ecm/ReturnOrder", params, options);
        },
        get: function (returnOrderId) {
            return $emerge.get("ecm/ReturnOrder", returnOrderId);
        },
        add: function (returnOrder) {
            return $emerge.add("ecm/ReturnOrder", returnOrder);
        },
        put: function (returnOrderId, returnOrder) {
            return $emerge.update("ecm/ReturnOrder", returnOrderId, returnOrder);
        },
        delete: function (returnOrderId) {
            return $emerge.delete("ecm/ReturnOrder", returnOrderId);
        },
        getUrl: function () {
            return $emerge.getUrl("ecm/ReturnOrder");
        },
        printPDF: function (returnOrderId) {
            return $emerge.get('ecm/ReturnOrder/' + returnOrderId + '/Pdf', '', { responseType: 'arraybuffer', tracker: 'null' });
        },
        deleteItem: function (returnOrderDetailsId) {
            return $emerge.delete("ecm/ReturnOrder", 'Item?returnOrderDetailsId=' + returnOrderDetailsId);
        }
    };

    return returnOrderBaseService;

});