EmergeApp.controller('ImportExcelCtrl', function ($scope, importExcelService, $http, $translate, errorDisplay) {

    $scope.tabSelected = null;
    $scope.tabPath = null;
    $scope.uploadFileName = null;
    $scope.selected = null;
    $scope.excelColumnList = null;
    $scope.excelDataList = null;
    var customersData = $scope.customersData = null;
    $scope.notify = null;
    $scope.dropdownLoad = null;// = "Supplier";

    var tabUpload = 'ImportExcel/tabUpload.html?a=a';
    var tabMapping = 'ImportExcel/tabMapping.html?a=a';
    $scope.tabTable = null;
    var tabNotification = 'ImportExcel/tabNotification.html?a=a';

    $scope.loadNewLayout = function (id) {
        switch (id) {
            case 1:
                $scope.tabSelected = 'tab-upload';
                $scope.tabPath = tabUpload;
                break;
            case 2:
                $scope.tabSelected = 'tab-mapping';
                $scope.tabPath = tabMapping;
                break;
            case 3:
                $scope.tabSelected = 'tab-table';
                $scope.tabPath = $scope.tabTable;
                break;
            case 4:
                $scope.tabSelected = 'tab-notification';
                $scope.tabPath = tabNotification;
                break;
        }
        $scope.selected = id;
    };

    var _init = function () {
        $scope.loadNewLayout(1);
    };

    $scope.uploadNext = function () {
        importExcelService.getExcelColumn($scope.uploadFileName)
            .success(function (data) {
                $scope.excelColumnList = data;
                $scope.loadNewLayout(2);
            });

    };

    //$scope.mappingNext = function () {
    //    var customer = $scope.excelColumnList;
    //    importExcelService.getExcelData($scope.uploadFileName, customer)
    //        .success(function (data) {
    //            $scope.customersData = data;
    //            customersData = data;
    //            $scope.loadNewLayout(3);
    //        })
    //        .error(function (error) {
    //            $log.error(error);
    //            errorDisplay.show(error);
    //        })
    //    ;
    //};

    //$scope.tableNext = function () {
    //    var i = $scope.customersData.length;
    //    while (i--) {
    //        if ($scope.customersData[i].isCheck == true) {
    //            $scope.customersData.splice(i, 1);
    //        }
    //    }
    //    importExcelService.importCustomers($scope.customersData)
    //        .success(function (data) {
    //            $scope.notify = data;
    //            $scope.loadNewLayout(4);
    //        });
    //};

    $scope.onFileSelect = function ($files) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = importExcelService.uploadExcel(file)
                .success(function (data, status, headers, config) {
                    // file is uploaded successfully
                    $scope.uploadFileName = data.replace('"', '').replace('"', '');
                    console.log($scope.uploadFileName);
                    $scope.selectedfilePath = data.filePath;
                    alert($translate.instant('ALERT.UPLOADED'));
                }).error(function (error) {
                    $log.error(error);
                    errorDisplay.show(error);
                });
        }
    };

    $scope.getExcelColumn = function () {
        importExcelService.getExcelColumn($scope.uploadFileName)
            .success(function (data) {
                $scope.excelColumnList = data;
            }).error(function(error) {
                errorDisplay.show(error);
            })
;
    }

    _init();
});
