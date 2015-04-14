
ECM.directive('productRating', function ($parse) {
    return {
        restrict : 'E',
        template :
            '<ul class="rating">'+
                '<li ng-repeat="star in stars" ng-click="toggle($index)">' +
                    '<i class="fa fa-star" ng-class="star"></i>' +
                '</li>'+
            '</ul>' +
            '<span> ({{ratingValue}} out of 5)</span>',
        scope : {
            max : '=',
            ratingValue: '=',
            onRatingSelected : '&'
        },
        link : function (scope, elem, attrs, ngModel) {

            scope.toggle = function (index) {
                scope.ratingValue = index + 1;
                scope.onRatingSelected({rating : index + 1});
            };

            scope.$watch('ratingValue', function(oldVal, newVal){
                if(newVal != oldVal){
                    updateStars();
                }
            });

            var updateStars = function () {
                scope.stars = [];
                var rating = scope.ratingValue;
                rating = (rating > 0 && rating != null) ? rating : 1;
                for(var i = 0; i<scope.max; i++){
                    if(i < rating)
                    {
                        scope.stars.push({ 'fa fa-star': true });
                    }else{
                        scope.stars.push({ 'fa fa-star-o': true });
                    }
                }
            };
        }
    }
});

PRD.directive('productreviewDatatable', ['productreviewService', '$filter', '$timeout', '$compile', function (productreviewService, $filter, $timeout, $compile) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            var oDatatable = element.dataTable({
                "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>",
                "sPaginationType": "full_numbers",
                "aoColumns": [
                    { "mData": "productReviewId" },
                    { "mData": "product.name" },
                    { "mData": "rating" },
                    { "mData": "title" },
                    { "mData": "comment" },
                    { "mData": "productId" }
                ],
                "aoColumnDefs": [
                    {
                        "aTargets": [5], // Column to target
                        "mRender": function (data, type, full) {
                            // 'full' is the row's data object, and 'data' is this column's data
                            // e.g. 'full[0]' is the comic id, and 'data' is the comic title
                            return '<a href="#/product-review/' + data + '" class="btn btn-success btn-sm btn-success btn-update m-r-xs">Edit</a><button type="button" class="btn btn-success btn-danger btn-sm btn-delete" ng-click="delete('+data+')">Delete</button> ';
                        }
                    },
                    {
                        "aTargets": [4], // Column to target
                        "bSortable": true,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "aTargets": [3], // Column to target
                        "bSortable": true,
                        "mRender": function (data, type, full) {
                            return (data != null) ? data : 'No data here';
                        }
                    },
                    {
                        "aTargets": [2], // Column to target
                        "bSortable": true,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    }
                    ,
                    {
                        "aTargets": [0], // Column to target
                        "bSortable": true,
                        "mRender": function (data, type, full) {
                           return data;
                        }

                    }
                ],
                "fnCreatedRow": function (nRow, aData, iDataIndex) {
                    $compile(nRow)(scope);
                    this.fnAdjustColumnSizing(true);
                },
                "fnInitComplete": function () {
                    this.fnAdjustColumnSizing(true);
                    element.css('width', '100%');
                }
            });

            scope.delete = function (id) {
                bootstrapConfirm('Do you want to proceed to Delete?', function() {
                    scope.deleteProducReviewById(id);
                });
            }

            // watch for any changes to our data, rebuild the DataTable
            scope.$watch(attrs.aaData, function (value) {
                var val = value || null;
                if (val) {
                    oDatatable.fnClearTable();
                    oDatatable.fnAddData(scope.$eval(attrs.aaData));
                }
            });
        }
    }
}]);

