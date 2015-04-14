var categoriesDatatable;

PRD.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/productBrands', { templateUrl: 'PRD/Brands/brand.html' })
        .when('/productBrands/new', { templateUrl: 'PRD/Brands/BrandEdit/brandEdit.html' })
        .when('/productBrands/:id', { templateUrl: 'PRD/Brands/BrandEdit/brandEdit.html' });
}]);

//PRD.run(['productService', '$emerge', '$log', function (productService, $emerge, $log) {
//    angular.extend(productService, {
//        query: function () {
//            alert("asd");
//        },

//        // extend new method
//        test: function () {
//            alert("asdaa");
//        },

//        // this will override the getUrl base method
//        getUrl: function () {
//            $log.log("This method has been overriden");
//            return $emerge.getUrl("products");
//        }
//    })
//}]);