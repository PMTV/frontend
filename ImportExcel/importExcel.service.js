EmergeApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/customerImport/', {
            templateUrl: 'ImportExcel/Import.html', controller: 'CustomerImportCtrl'
        }
        )
        .when('/supplierImport/', {
            templateUrl: 'ImportExcel/Import.html',controller:'SupplierImportCtrl'
        }
        )
        .when('/productImport/', {
            templateUrl: 'ImportExcel/Import.html', controller: 'ProductImportCtrl'
        }
        )
    ;
}]);

EmergeApp.factory('importExcelService', function ($emerge, promiseTracker) {
    // Authorization header

    var importExcelServiceBase = {
        
        getImport: function () {
            return $emerge.query("importExcel/import");//not yet
        },
        uploadExcel: function (data) {
            return $emerge.upload("importExcel", "uploadExcel", data);
        },
        getCustomerColumn: function () {
            return $emerge.query("importExcel/getCustomerColumn");
        },
        getExcelData: function (fileName, ctrlName, customer) {
            return $emerge.add("importExcel/getExcelData?fileName=" + fileName + "&ctrlName=" + ctrlName, customer);
        },
        getExcelColumn: function (fileName) {
            return $emerge.query("importExcel/getExcelColumn?fileName=" + fileName);
        },
        importCustomers: function (customers) {
            return $emerge.add("importExcel/importCustomers", customers);
        },
        importSuppliers: function (suppliers) {
            return $emerge.add("importExcel/importSuppliers", suppliers);
        },
        importProducts: function (products) {
            return $emerge.add("importExcel/importProducts", products);
        },
        getCustomColumn: function (ctrlName) {
            return $emerge.query("importExcel/getCustomColumn?ctrlName=" + ctrlName);
        }
    };

    return importExcelServiceBase;
});