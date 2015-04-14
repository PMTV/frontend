

ORD.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/return-saleOrder', { templateUrl: 'ORD/ReturnSaleOrder/returnSaleOrder.html' })
//        .when('/test', { templateUrl: 'ORD/ReturnSaleOrder/test.html' })
        .when('/return-saleOrder/new', { templateUrl: 'ORD/ReturnSaleOrder/ReturnSaleOrderEdit/returnSaleOrderEdit.html'})
        .when('/return-saleOrder/:id', { templateUrl: 'ORD/ReturnSaleOrder/ReturnSaleOrderEdit/returnSaleOrderEdit.html'});
}]);


ORD.factory('returnSaleOrderService', function ($http, $emerge) {
    var ReturnSaleOrderBaseService = {
        getSaleOrderByCustomerId: function (id) {
            return $emerge.query('ecm/ReturnSaleOrder/getSaleOrderByCustomer?customerId=' + id);
        },
        createReturnSaleOrder: function (data) {
            return $emerge.add('ecm/ReturnSaleOrder', data);
        }
    };

    return ReturnSaleOrderBaseService;
});