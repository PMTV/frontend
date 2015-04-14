GNM.factory('mediaService', function ($http, $emerge) {

    return {
        add: function (module, id, media) {
            return $emerge.addTNM(module, id + "/uploadmedia/", media);
        },
        query: function (module) {
            return $emerge.query("packingLists");
        },
        get: function (module, id) {
            return $emerge.get(module, id + "/TaskNote");
        },
        upload: function (module, id, data) {
            return $emerge.upload(module, id + "/uploadMedia/", data);
        },
        delete: function (mediaId) {
            return $emerge.delete("productMedia", mediaId);
        },
        setDefault: function (mediaId) {
            return $emerge.update("productMedia", mediaId + "/setdefaultMedia");
        }
    }
});

GNM.directive('media', function ($upload, $modal, $log, $routeParams, $translate, errorDisplay, mediaService) {

    var moduleId = $routeParams.id;
    var module;

    return {
        restrict: 'EA',
        template: '' +
        '<div class="clearfix text-center m-b">' +
            '<div class="thumb-lg">' +
                '<a class="text-center thumb-lg" >' +
                    // '<span class="text-muted" ng-hide="newImage"><i class="fa fa-warning-sign"></i> No images</span><br><br>'+
                    '<span ng-repeat="item in imagesListArr">' +
                        '<img ng-show="item.isDefault" ng-src="{{newImage || item.filePath}}" class="media-lg">' +
                    '</span>' +
                '</a>' +
            '</div>' +
            '<br><br>' +
            '<button class="btn btn-warning btn-sm" ng-click="addMedia()"><i class="fa fa-picture"></i> Choose Image</button>' +
        '</div>',
        link: function (scope, element, attrs) {
            // watch for any changes to our data, rebuild the DataTable

            scope.$watch(attrs.aaData, function (value) {
                if (value) {
                    scope.imagesListArr = scope.$eval(attrs.aaData);
                }
            });

            scope.addMedia = function (index, id) {
                var dialog = $modal.open({
                    backdrop: true,
                    windowClass: 'xx-dialog',
                    keyboard: true,
                    templateUrl: 'GNM/Media/Modal/mediaEdit.html?a=aa',
                    controller: function ($scope, $log, $modalInstance, mediaService, $filter) {
                        // MODAL SCOPE
                        var moduleId = $routeParams.id;
                        var result = "";

                        //scope.$watch(attrs.aaData, function (value) {
                        //    var val = value || null;
                        //    if (val) {
                                //scope.imagesListArr = scope.$eval(attrs.aaData);
                                $scope.imagesArr = scope.$eval(attrs.aaData);
                        //    }
                        //});
                        // scope.loadProducts(attrs.type);

                        $scope.onFileSelect = function ($files) {
                            //$files: an array of files selected, each file has name, size, and type.
                            for (var i = 0; i < $files.length; i++) {
                                var file = $files[i];
                                $scope.upload = mediaService.upload("products", moduleId, file)
                                    .progress(function (evt) {
                                        $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                                        console.log($scope.progress);
                                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                                    }).success(function (data, status, headers, config) {
                                        // file is uploaded successfully
                                        $scope.selectedfilePath = data.filePath
                                        $scope.newImage = data.filePath;
                                        $scope.mediaId = data.mediaId;
                                        $scope.imagesArr.push(data);
                                        alert($translate.instant('ALERT.UPLOADED'));
                                    }).error(function (error) {
                                        $log.error(error);
                                        errorDisplay.show(error);
                                    });
                            }
                        };

                        $scope.onChangedFilePath = function (filePath, mediaId) {
                            $scope.mediaId = mediaId;
                            $scope.newImage = filePath;
                            $scope.selectedfilePath = filePath;
                        }

                        $scope.setDefault = function (mediaId) {
                            mediaService.setDefault(mediaId)
                                .success(function (data) {
                                    alert($translate.instant('ALERT.UPDATED'));
                                })
                        }

                        $scope.deleteMedia = function (mediaId, index) {
                            if (confirm($translate.instant('ALERT.DELETING'))) {
                                mediaService.delete(mediaId)
                                    .success(function (data) {
                                        $scope.imagesArr.splice(index, 1);
                                        alert($translate.instant('ALERT.DELETED'));
                                    })
                            }
                        }

                        $scope.save = function () {
                            $modalInstance.close();
                        };

                        $scope.ok = function () {
                            $modalInstance.close($scope.selectedfilePath);
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    },

                    resolve: {
                        product: function () {
                            return scope.product;
                        },
                        selectedfilePath: function () {
                            return scope.selectedfilePath;
                        },
                        newImage: function () {
                            return scope.newImage;
                        }
                    }
                });

                dialog.result.then(function (image) {
                    scope.newImage = image;
                }, function () {
                });
            }
        },
    };
});

