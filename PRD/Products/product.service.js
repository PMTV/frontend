var PRD = angular.module('PRD', ['GNM','TNM']);
var productDatatable;

PRD.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/products', { templateUrl: 'PRD/Products/product.html' })
        .when('/products/new', {templateUrl: 'PRD/Products/ProductEdit/productEdit.html' })
        .when('/products/:id', { templateUrl: 'PRD/Products/ProductEdit/productEdit.html' });
}]);

PRD.factory("productService", function ($http, $rootScope, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    //var dataSvc = $emerge.dataService();

    var ProductServiceBase = {

        /* Products */
        queryAll: function (q, options) {
            return $emerge.query("products", null, options);
        },
        query: function (q, step, page, sort, asc, options) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc
            }
            return $emerge.query("products", params, options);
        },
        search: function (q, step, page) {
            return $emerge.query("products" + (q ? "?q=" + q : "?") + (step ? "step=" + step : "") + (page ? "&page=" + page : ""));
        },
        get: function (id) {
            return $emerge.get("products", id);
        },
        add: function (data) {
            return $emerge.add("products", data);
        },
        update: function (data) {
            return $emerge.update("products", data.productId, data)
        },
        patch: function (data, Id) {
            return $emerge.patch("products", data, Id);
        },
        delete: function (id) {
            return $emerge.delete("products", id);
        },

        /* Product Media */
        queryMedia: function () {
            return $emerge.query("productsMedia");
        },
        getMedia: function (id) {
            return $emerge.get("productsMedia", id);
        },
        addMedia: function (data) {
            return $emerge.add("productsMedia", data);
        },
        updateMedia: function (data, id) {
            return $emerge.update("productsMedia", data, id, data);
        },
        deleteMedia: function (id) {
            return $emerge.delete("productsMedia", id);
        },

        /* Product Types */
        queryType: function () {
            return $emerge.query("productsTypes");
        },
        getType: function (id) {
            return $emerge.get("productsTypes", id);
        },
        addType: function (data) {
            return $emerge.add("productsMedia", data);
        },
        updateType: function (data, id) {
            return $emerge.update("productsTypes", id, data);
        },
        deleteType: function (id) {
            return $emerge.delete("productsTypes", id);
        },

        /* Product UOMs */
        queryUOM: function () {
            return $emerge.query("productUoms");
        },
        getUOM: function (id) {
            return $emerge.get("productUoms", id);
        },
        addUOM: function (data) {
            return $emerge.add("productUoms", data);
        },
        updateUOM: function (data, id) {
            return $emerge.delete("productUoms", id, data);
        },
        deleteUOM: function (id) {
            return $emerge.delete("productUoms", id);
        },

        /* Product Categories */
        queryCategory: function () {
            return $emerge.query("productCategories");
        },
        getCategory: function (id) {
            return $emerge.get("products", id + "/categories");
        },
        addCategory: function (data) {
            return $emerge.add("productCategories", data);
        },
        updateCategory: function (data, id) {
            return $emerge.delete("productCategories", id, data);
        },
        deleteCategory: function (id) {
            return $emerge.delete("productCategories", id);
        },

        /* Product Brands */
        queryBrand: function () {
            return $emerge.query("productBrands");
        },
        getBrand: function (id) {
            return $emerge.get("productBrands", id);
        },
        addBrand: function (data) {
            return $emerge.add("productBrands", data);
        },
        updateBrand: function (data, id) {
            return $emerge.update("productBrands", id, data);
        },
        deleteBrand: function (id) {
            return $emerge.delete("productBrands", id);
        },
        getBarcodes: function (ids) {
            return $emerge.query('products/barcodes?productIds=' + ids);
        },
        getReview: function () {
            return $emerge.get(reviewUrl);
        },
        deleteReview: function (id) {
            return $emerge.delete(reviewUrl, id);
        },
        addReview: function (review) {
            return $emerge.add(reviewUrl, review)
        },
        getOption: function () {
            return $emerge.get(optionUrl);
        },
        getBatches: function (id) {
            return $emerge.query("productBatches");
        },
        addBatch: function (data) {
            return $emerge.post("productBatches", data);
        },
        getBatchesByProductId: function (id) {
            var params = {
                productId: id
            }
            return $emerge.query("productBatches", params);
        },
        getUrl: function () {
            return $emerge.getUrl("products");
        },

        // ecm: multi price
        updateMultiPrice: function (productId, data) {
            return $emerge.update('products/UpdateProductMultiPrices', productId, data);
        },
        updateQuantityPrice: function (productId, data) {
            return $emerge.update('products/UpdateProductQuantityPrices', productId, data);
        }
    }

    return ProductServiceBase;
});

var checkUrlParam = function(param){

}

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