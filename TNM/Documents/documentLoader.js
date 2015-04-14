TNM.factory('documentFactory', function ($http) {
    var url = 'http://dev.higheridentity.com:8585/api/v1/customers/';
    return {

        deleteDocument: function(id)
        {
            return $http.delete(url+id+'/DeleteTaskNote?forceDel=true');
        },
        getDocument: function(id,taskType)
        {
            return $http.get(url+id+'/GetTaskNote?tasktype='+3);
        },
        deleteDocument: function(docId)
        {
            return $http.delete(url+docId+'/DeleteTaskNote?forceDel=true');
        }

    };
});

// TNM.controller('ModalDemoCtrl', function($scope, $modal, $log) {

//     $scope.user = {
//         user: 'name',
//         password: null
//     };

//     $scope.open = function () {

//         $modal.open({
//             templateUrl: 'myModalContent.html',
//             backdrop: true,
//             windowClass: 'modal',
//             controller: function ($scope, $modalInstance, $log, user) {
//                 $scope.user = user;
//                 $scope.submit = function () {
//                     $log.log('Submiting user info.');
//                     $log.log(user);
//                     $modalInstance.dismiss('cancel');
//                 }
//                 $scope.cancel = function () {
//                     $modalInstance.dismiss('cancel');
//                 };
//             },
//             resolve: {
//                 user: function () {
//                     return $scope.user;
//                 }
//             }
//         });
//     };
// });

TNM.directive('emergeDocument', function ($upload,$routeParams,documentFactory){

    var id = $routeParams.id;

    return {
        restrict:'A',
        templateUrl: 'TNM/document.partial.html',
        scope: {
            type:'@'
        },
        controller: function($scope, $upload, $http, $timeout,$location,$routeParams){

            //var id = $routeParams.id;
            var uploadUrl = 'http://dev.higheridentity.com:8585/api/v1/customers/' + id + '/PostUpload/';
            $scope.uploadResult = [];
            
            // $scope.modal = {content: 'Hello Modal', saved: false};
            //   $scope.viaService = function() {
            //     // do something
            //     var modal = $modal({
            //       template: 'TNM/Documents/modal.html',
            //       show: true,
            //       backdrop: 'static',
            //       scope: $scope
            //     });
            //   }
            //   $scope.parentController = function(dismiss) {
            //     console.warn(arguments);
            //     // do something
            //     dismiss();
            //   }

            $scope.onFileSelect = function($files) {

                $scope.selectedFiles = [];
                    $scope.progress = [];
                    if ($scope.upload && $scope.upload.length > 0) {
                        for (var i = 0; i < $scope.upload.length; i++) {
                            if ($scope.upload[i] != null) {
                                $scope.upload[i].abort();
                            }
                        }
                    }
                    $scope.upload = [];
                    $scope.selectedFiles = $files;
                    $scope.dataUrls = [];
                    for ( var i = 0; i < $files.length; i++) {
                        var $file = $files[i];
                        if (window.FileReader && $file.type.indexOf('image') > -1) {
                            var fileReader = new FileReader();
                            fileReader.readAsDataURL($files[i]);
                            function setPreview(fileReader, index) {
                                fileReader.onload = function(e) {
                                    $timeout(function() {
                                        $scope.dataUrls[index] = e.target.result;
                                    });
                                }
                            }
                            setPreview(fileReader, i);
                        }
                        $scope.progress[i] = -1;
                        if ($scope.uploadRightAway) {
                            $scope.start(i);
                        }
                    }
                };
                
                $scope.start = function(index) {
                    $scope.progress[index] = 0;
                    $scope.upload[index] = $upload.upload({
                        url : uploadUrl,
                        //headers: {'myHeaderKey': 'myHeaderVal'},
                        data: {myObj: $scope.myModelObj},
                        /* formDataAppender: function(fd, key, val) {
                            if (angular.isArray(val)) {
                                angular.forEach(val, function(v) {
                                  fd.append(key, v);
                                });
                              } else {
                                fd.append(key, val);
                              }
                        }, */
                        file: $scope.selectedFiles[index],
                        fileFormDataName: 'myFile'
                    }).then(function(response) {
                        $scope.uploadResult.push(response.data);
                    }, null, function(evt) {
                        $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
                    });
                };

                $scope.deleteDocument = function(result)
                {
                    documentFactory.deleteDocument(result.taskNoteId)
                        .success (function (data){
                            $scope.uploadResult.splice($scope.uploadResult.indexOf(result),1);
                        })
                        .error (function (error){
                            console.log("delete doc error");
                        });
                };

                // $scope.open = function () {

                //     var modalInstance = $modal.open({
                //       templateUrl: 'myModalContent.html',
                //       controller: ModalInstanceCtrl,
                //       resolve: {
                //         uploadResult: function () {
                //           return $scope.uploadResult;
                //         }
                //       }
                //     });

                //     modalInstance.result.then(function (selectedItem) {
                //       $scope.selected = selectedItem;
                //     }, function () {
                //       $log.info('Modal dismissed at: ' + new Date());
                //     });
                // };

                // var ModalInstanceCtrl = function ($scope, $modalInstance, result) {

                //   $scope.uploadResult = uploadResult;
                //   $scope.selected = {
                //     result: $scope.uploadResult[0]
                //   };

                //   $scope.ok = function () {
                //     $modalInstance.close($scope.selected.result);
                //   };

                //   $scope.cancel = function () {
                //     $modalInstance.dismiss('cancel');
                //   };
                // };

        },
        link: function (scope, element, attrs) {
            // attrs.$observe('type', function(value){
            //     if(value == "customer")
            //     {
            //         url = 'http://dev.higheridentity.com:8585/api/v1/customers/';
            //     }
            // });
            var id = $routeParams.id;

            scope.uploadResult = [];

            documentFactory.getDocument(id,3).then(function (data) {
                scope.uploadResult = (data.data);
                console.log(scope.uploadResult);
            });
            
        }
    };
});