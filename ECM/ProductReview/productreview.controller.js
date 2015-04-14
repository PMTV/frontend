ECM.controller('ProductReviewListCtrl', function ($scope, $rootScope, productreviewService){

    $scope.loadProductReviewList = function () {
        productreviewService.queryProductReviewList()
            .success(function (data, status) {
                $scope.productreviewDatatable = data;
            })
            .error(function(){alert('Error load product review list!');})
            .finally();
    };

    $scope.deleteProducReviewById = function (id) {
        productreviewService.deleteProductReview(id)
            .success(function (data, status) {
                alert('Delete product review successfull!');
                $scope.loadProductReviewList();
            })
            .error(function(){ alert('Delete product review error!'); });
    };

    $scope.loadProductReviewList();
});

ECM.controller('ProductReviewEditCtrl', function ($scope, $rootScope, $routeParams, $location, productreviewService) {

    var productId = null;
    $scope.productreviewData = {};
//    $scope.productreviewData.rating = 2;

    var _init = function () {
        productId = $routeParams.id;
        if (productId == null) {
            productreviewService.query().success(function (data, status) {
                $scope.productreviewData = data;
                $scope.productreviewData.customerId = '';
                $scope.productreviewData.productId = '';
            }).error(function (data, status) {
                alert('error load product review');
            });
        }else{
            productreviewService.queryProductReviewById(productId)
                .success(function (data, status) {
//                    $scope.rating = data.rating;
                    $scope.productreviewData = data;
                })
                .error(function(){alert('Error load product review information!');})
                .finally();
        }
    };
    
    $scope.save = function (reviewInfo) {
        $scope.submitted = true;
//        reviewInfo.rating = $scope.productreviewData.rating;

        if(!$scope.myForm.$valid){
            alert('Please check your input data!');
            return false;
        }

        $scope.saving = true;

        if(productId){
            productreviewService.updateProductReview(reviewInfo)
                .success(function (data, status) {
                    alert('Update product review successfull!');
                    $location.path('/product-review')
                })
                .error(function(){alert('Error update product review!');})
                .finally(function(){ $scope.saving = false; });
        }else{
            productreviewService.add(reviewInfo).
                success(function (data, status) {
                    alert('Create New Product Review Successfull!');
                    $location.path('/product-review');
                })
                .error(function(){alert('error save product review');})
                .finally(function(){ $scope.saving = false; });
        }
    };

    _init();

});