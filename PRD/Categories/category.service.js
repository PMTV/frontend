var categoriesDatatable;

PRD.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/productCategories', { templateUrl: 'PRD/Categories/category.html' })
        .when('/productCategories/new', { templateUrl: 'PRD/Categories/CategoryEdit/categoryEdit.html' })
        .when('/productCategories/:id', { templateUrl: 'PRD/Categories/CategoryEdit/categoryEdit.html' });
}]);

PRD.factory("categoryService", function ($http, $rootScope, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    //var dataSvc = $emerge.dataService();

    return {
        /* Products */
        query: function (q, step, page, sort, asc) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc
            }
            return $emerge.query("ProductCategories", params); //?rootcat=true
        },
        queryRoot: function (q, step, page, sort, asc) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc,
                rootcat: true
            }
            return $emerge.query("ProductCategories", params); //?rootcat=true
        },
        get: function (id) {
            return $emerge.get("ProductCategories", id);
        },
        add: function (data) {
            return $emerge.add("ProductCategories", data);
        },
        updateMany: function (data) {
            console.log(data);
            return $emerge.update("ProductCategories", "", data)
        },
        update: function (data) {
            return $emerge.update("ProductCategories", data.productCategoryId, data)
        },
        patch: function (data, Id) {
            return $emerge.patch("ProductCategories", data, Id);
        },
        delete: function (id) {
            return $emerge.delete("ProductCategories", id);
        }
    }
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