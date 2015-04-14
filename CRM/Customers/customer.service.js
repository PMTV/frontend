var CRM = angular.module('CRM', ['GNM', 'TNM']);

CRM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/customers', { templateUrl: 'CRM/Customers/customer.html' })
        .when('/customers/new', { templateUrl: 'CRM/Customers/CustomerEdit/customerEdit.html' })
        .when('/customers/:id', { templateUrl: 'CRM/Customers/CustomerEdit/customerEdit.html' });
}]);
CRM.factory('customerService', function ($emerge, promiseTracker) {
    // Authorization header

    var CustomerServiceBase = {
        query: function (q, step, page, sort, asc, options) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc,
                includeInactiveUser: 'false'
            }
            return $emerge.query("customers", params, options);
        },
        search: function (q, step, page) {
            return $emerge.query("customers" + (q ? "?q=" + q + "&" : "?") + (step ? "step=" + step : "") + (page ? "&page=" + page : ""));
        },
        get: function (id, options) {
            return $emerge.get("customers", id, options);
        },
        add: function (data) {
            return $emerge.add("customers", data);
        },
        update: function (data) {

            angular.forEach(data.addressList, function (v, k) {
                v.country = null;
            });

            return $emerge.update("customers", data.customerId, data);
        },
        patch: function (data, id) {
            return $emerge.patch("customers", id, data);
        },
        delete: function (id) {
            return $emerge.delete("customers", id);
        },
        getUrl: function () {
            return $emerge.getUrl("customers");
        },

        getLeadsource: function () {
            return $emerge.query("leadsources");
        },
        addLeadsource: function (patch) {
            // TODO Remove when USR Module ready
            return $emerge.add("leadsources", leadsource);
        },
        updateLeadsource: function (data) {
            return $emerge.update("leadsources", data.leadsourceId, data);
        },
        deleteLeadsource: function (id) {
            // TODO Remove when USR Module ready
            return $emerge.delete("leadsources", id);
        },
        getSalespipeline: function () {
            return $emerge.query("salesPipeline");
        },
        deleteAddress: function (id, addressId) {
            return $emerge.delete("customers", id, "/address?addressId=" + addressId);
        },
        deleteContact: function (customerId, contactId) {
            return $emerge.delete("customers", customerId, "/contact?contactId=" + contactId);
        },
        getCustomerWithUnPaidSalesOrder: function (customerId) {
            return $emerge.query("ecm/customers/" + customerId + "/GetCustomerWithUnPaidSalesOrder");
        },
        getImport: function () {
            return $emerge.query("customers/import");//not yet
        },
        uploadExcel: function (data) {
            return $emerge.upload("customers", "uploadExcel", data);
        },
        getCustomerColumn: function () {
            return $emerge.query("customers/getCustomerColumn");
        },
        getExcelData: function (fileName, customer) {
            return $emerge.add("customers/getExcelData?fileName=" + fileName, customer);
        },
        getExcelColumn: function (fileName) {
            return $emerge.query("customers/getExcelColumn?fileName=" + fileName);
        },
        importCustomers: function (customers) {
            return $emerge.add("customers/importCustomers", customers);
        }
    };

    return CustomerServiceBase;
});

CRM.filter('addressType', function () {
    return function (addressType) {
        var type = "";
        switch (Number(addressType)) {
            case 1:
                type = "Home";
                break;
            case 2:
                type = "Office";
                break;
            case 3:
                type = "Building";
                break;
            case 4:
                type = "Shipping";
                break;
        }

        return type;
    };
})