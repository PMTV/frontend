ORD.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/sales', { templateUrl: 'ORD/sales/sales.html' })
        .when('/sales/new', { templateUrl: 'ORD/sales/salesEdit/salesEdit.html' })
        .when('/sales/:id', { templateUrl: 'ORD/sales/salesEdit/salesEdit.html' });
}]);

// FACTORY
ORD.factory('salesService', function ($http, $emerge) {

    return {
        getAllStatus: function () {
            var status = [
                { name: 'New', value: 1 },
                { name: 'In Progress', value: 2 },
                { name: 'Pending Approval', value: 3 },
                { name: 'Confirmed', value: 4 },
                { name: 'Delivered', value: 6 },
                { name: 'Completed', value: 7 }
            ];
            return status;
        },
        getStatus: function (statusId, isApproved) {
            var status = _.find(this.getAllStatus(), function (e) { return e.value == statusId });

            if (status) {
                // If "Pending Approval" AND "IsApproved"
                if (status.value == 3 && isApproved) {
                    status.name = "Approved";
                }

                return status.name;
            }

            return;
        },
        query: function (q, step, page, sort, asc, options) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc
            }

            return $emerge.query("salesOrders", params, options);
        },
        queryByCustomerId: function (customerId, q, step, page, sort, asc, options) {
            var params = {
                customerId: customerId,
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc
            }

            return $emerge.query("salesOrders", params, options);
        },
        get: function (salesId) {
            return $emerge.get("salesOrders", salesId);
        },
        cancel: function (salesId) {
            return $emerge.update("salesOrders", salesId + "/cancel");
        },
        add: function (sales) {
            // Exclude properties to update
            sales.customer = null;
            angular.forEach(sales.salesOrderDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
            });

            return $emerge.add("salesOrders", sales);
        },
        put: function (salesId, sales) {
            // Exclude properties to update
            sales.customer = null;
            sales.userCreated = null;
            angular.forEach(sales.salesOrderDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
            });

            return $emerge.update("salesOrders", salesId, sales);
        },
        update: function (salesId, sales) {
            return this.put(salesId, sales);
        },
        updateStatus: function (salesId, statusId) {
            return $emerge.update("salesOrders", salesId + "/status?statusId=" + statusId);
        },
        patch: function (salesId, sales) {
            return $emerge.patch("salesOrders", salesId, sales);
        },
        delete: function (salesId) {
            return $emerge.delete("salesOrders", salesId);
        },
        deleteItem: function (salesId, SalesOrderDetailsId) {
            return $emerge.delete("salesOrders", salesId + '/Item?salesOrderDetailsId=' + SalesOrderDetailsId);
        },
        duplicate: function (salesId) {
            return $emerge.update("salesOrders", salesId + "/Duplicate");
        },
        sendApproval: function (salesId) {
            return $emerge.update("salesOrders", salesId + "/SendApproval");
        },
        approve: function (salesId) {
            return $emerge.update("salesOrders", salesId + "/Approve");
        },
        convertToInvoice: function (salesId) {
            return $emerge.update("salesOrders", salesId + "/ConvertToInvoice");
        },
        convertToDelivery: function (salesId) {
            return $emerge.update("salesOrders", salesId + "/ConvertToDelivery");
        },
        getUrl: function () {
            return $emerge.getUrl("salesOrders");
        },
        getPDF: function (salesId) {
            return $emerge.get("salesOrders", salesId + "/pdf", { responseType: 'arraybuffer', tracker: 'null' });
        },
        getProformaInvoice: function(salesId, discount)
        {   
            var params = "";

            if (discount)
            {
                params = "?discount="+discount;
            }

            return $emerge.get("salesOrders", salesId + "/proformaapdf"+ params, { responseType: 'arraybuffer', tracker: 'null' });
        },
        emailPDF: function (salesId, email) {
            return $emerge.post("salesOrders/" + salesId + "/email", email);
        },

        getGetSalesOrderDetails: function (saleId) {
            return $emerge.query('ecm/salesOrders/' + saleId + '/GetSalesOrderDetails');
        },
        getByInvoice: function (invoiceId) {
            return $emerge.query('ecm/salesOrders/' + invoiceId + '/GetByInvoice');
        },
        getByCustomer: function (customerId) {
            return $emerge.query('ecm/salesOrders/GetByCustomer?customerId=' + customerId);
        },
        convertToDelivery: function (salesId) {
            return $emerge.update("salesOrders", salesId + "/ConvertToDelivery");
        },

        approveExceedCreditLimit: function (salesId) {
            return $emerge.update("salesOrders", salesId + "/ApproveExceedCreditLimit");
        },
        getExceedCreditLimitSalesOrders: function (pageSize, page) {
            return $emerge.query("ecm/salesOrders/GetExceedCreditLimitSalesOrders?page=" + page + "&pageSize=" + pageSize);
        }
    };
});

ORD.filter('salesStatus', function (salesService) {
    return function (input, isApproved) {
        return salesService.getStatus(input, isApproved);
    }
});