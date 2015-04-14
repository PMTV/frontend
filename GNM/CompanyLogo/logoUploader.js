GNM.factory('logoFactory', function ($http) {
    var url = 'http://dev.higheridentity.com:8585/api/v1/customers/';
    return {
        getLogo: function(id)
        {
            $http.get(url+id);
        },
        updateLogo: function(id)
        {
            return $http.delete(url+id+'/UploadCompanyLogo/');
        }

    };
});

GNM.directive('companyLogo', function ($routeParams,logoFactory){


    var id = $routeParams.id;

    return {
        restrict:'A',
        templateUrl: 'GNM/CompanyLogo/companyLogo.partial.html',
        scope: {
            type:'@'
        },
        controller: function($scope, $upload, $http, $timeout, $location, $routeParams){

            var id = $routeParams.id;
            $scope.customer = {};

            var uploadUrl = 'http://dev.higheridentity.com:8585/api/v1/customers/' + id + '/UploadCompanyLogo/';

            $scope.uploadResult = [];

             $scope.onFileSelect = function($files) {
                //$files: an array of files selected, each file has name, size, and type.
                for (var i = 0; i < $files.length; i++) {
                  var $file = $files[i];
                  $scope.upload = $upload.upload({
                    url: uploadUrl, //upload.php script, node.js route, or servlet url
                    // method: POST or PUT,
                    // headers: {'headerKey': 'headerValue'}, withCredential: true,
                    //data: {myObj: $scope.myModelObj},
                    file: $file,
                    /* set file formData name for 'Content-Desposition' header. Default: 'file' */
                    //fileFormDataName: myFile,
                    /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
                    //formDataAppender: function(formData, key, val){} 
                  }).progress(function(evt) {
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                  }).success(function(data, status, headers, config) {
                    // file is uploaded successfully
                    $scope.customer.companyLogoFileName = data;
                    //alert($scope.result);
                    console.log(data);
                  });
                  //.error(...)
                  //.then(success, error, progress); 
                }
              };

              

            //     $scope.selectedFiles = [];
            //         $scope.progress = [];
            //         if ($scope.upload && $scope.upload.length > 0) {
            //             for (var i = 0; i < $scope.upload.length; i++) {
            //                 if ($scope.upload[i] != null) {
            //                     $scope.upload[i].abort();
            //                 }
            //             }
            //         }
            //         $scope.upload = [];
            //         $scope.selectedFiles = $files;
            //         $scope.dataUrls = [];
            //         for ( var i = 0; i < $files.length; i++) {
            //             var $file = $files[i];
            //             if (window.FileReader && $file.type.indexOf('image') > -1) {
            //                 var fileReader = new FileReader();
            //                 fileReader.readAsDataURL($files[i]);
            //                 function setPreview(fileReader, index) {
            //                     fileReader.onload = function(e) {
            //                         $timeout(function() {
            //                             $scope.dataUrls[index] = e.target.result;
            //                         });
            //                     }
            //                 }
            //                 setPreview(fileReader, i);
            //             }
            //             $scope.progress[i] = -1;
            //             if ($scope.uploadRightAway) {
            //                 $scope.start(i);
            //             }
            //         }
            //     };
                
            //     $scope.start = function(index) {
            //         $scope.progress[index] = 0;
            //         $scope.upload[index] = $upload.upload({
            //             url : uploadUrl,
            //             //headers: {'myHeaderKey': 'myHeaderVal'},
            //             data: {myObj: $scope.myModelObj},
            //             /* formDataAppender: function(fd, key, val) {
            //                 if (angular.isArray(val)) {
            //                     angular.forEach(val, function(v) {
            //                       fd.append(key, v);
            //                     });
            //                   } else {
            //                     fd.append(key, val);
            //                   }
            //             }, */
            //             file: $scope.selectedFiles[index],
            //             fileFormDataName: 'myFile'
            //         }).then(function(response) {
            //             $scope.uploadResult.push(response.data);
            //         }, null, function(evt) {
            //             $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
            //         });
            //     };

            //     $scope.deleteDocument = function(result)
            //     {
            //         documentFactory.deleteDocument(result.taskNoteId)
            //             .success (function (data){
            //                 $scope.uploadResult.splice($scope.uploadResult.indexOf(result),1);
            //             })
            //             .error (function (error){
            //                 console.log("delete doc error");
            //             });
            //     }
        },
        link: function (scope, element, attrs) {
            scope.$watch(scope.customer.companyLogoFileName, function(value) {
                  // do something when it changes
                  //alert(value);
                });
            // attrs.$observe('type', function(value){
            //     if(value == "customer")
            //     {
            //         url = 'http://dev.higheridentity.com:8585/api/v1/customers/';
            //     }
            // });
            // var id = $routeParams.id;

            // scope.customer.companyLogoFileName = '';

            // documentFactory.getLogo(id).then(function (data) {

            //     scope.customer.companyLogoFileName = (data.data);
            //     alert(scope.customer.companyLogoFileName);
            //     //console.log(scope.uploadResult);
            // });
            
        }
    };
});