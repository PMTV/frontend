var categoriesDatatable;

GNM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/categories', { templateUrl: 'GNM/Categories/category.html' })
        .when('/categories/new', {templateUrl: 'GNM/Categories/CategoryEdit/categoryEdit.html'})
        .when('/categories/:id', { templateUrl: 'GNM/Categories/CategoryEdit/categoryEdit.html'});
}]);

GNM.factory("categoriesService", function ($http, $rootScope, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    //var dataSvc = $emerge.dataService();

    var ProductServiceBase = {

        /* Products */
        query: function () {
            return $emerge.query("ProductCategories?rootcat=true");
        },
        get: function (id) {
            return $emerge.get("ProductCategories", id);
        },
        add: function (data) {
            return $emerge.add("ProductCategoriesInsert", data);
        },
        update: function (data) {
            return $emerge.update("ProductCategories", data.productId, data)
        },
        patch: function (data, Id) {
            return $emerge.patch("ProductCategories", data, Id);
        },
        delete: function (id) {
            return $emerge.delete("ProductCategories", id);
        }
    }

    return ProductServiceBase;
});

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