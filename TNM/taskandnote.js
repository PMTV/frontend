var TNM = angular.module('TNM', []);

TNM.factory('taskNoteService', function ($http, $emerge) {

    return {
        addNote: function (module, id, note) {
            return $emerge.post(module + "/" + id + "/PostNote/", note);
        },
        addTask: function (module, id, note) {
            // note.userId = 1;

            return $emerge.post(module + "/" + id + "/PostTask/", note);
        },
        getUpload: function (module, id) {
            return $emerge.get(module, id + '/TaskNote?taskType=3')
        },
        query: function (module) {
            return $emerge.query("packingLists");
        },
        get: function (module, id) {

            return $emerge.get(module, id + "/TaskNote");
        },
        getbySOID: function (salesOrderId) {
            return $emerge.get("SalesOrders", salesOrderId + "/Packinglist");
        },
        delete: function (module, moduleId, id) {
            return $emerge.delete(module, moduleId + "/TaskNote?taskNoteId=" + id);
        },
        upload: function (module, moduleId, data) {
            return $emerge.upload(module, moduleId + '/PostUpload/', data)
        }
    }
});

TNM.controller('TaskNoteCtrl', function ($scope, $log, $http, $log, $filter, $routeParams, $route, $location, taskNoteService, errorDisplay, $modal, $timeout, $upload) {

    var id = $routeParams.id;

});


TNM.directive('tasknote', function (taskNoteService, $modal, $log, $routeParams, $translate, errorDisplay) {

    var taskNoteModuleId = $routeParams.id;

    return {
        restrict: 'A',
        templateUrl: 'TNM/taskandnote.html?a=aa',
        controller: function ($scope, $log, $http, $location, taskNoteService) {
            $scope.filterType = function (type) {
                if (type == 4) {
                    $scope.taskType = "";
                }
                else {
                    $scope.taskType = { 'taskType': type };

                }
            };
        },
        link: function (scope, element, attrs) {
            var module = attrs.module;
            var taskNoteModuleId = $routeParams.id;

            scope.tasknoteArr = [];

            scope.init = function (id) {
                taskNoteService.get(attrs.module, id)
                    .success(function (data) {
                        scope.tasknoteArr = data;
                        angular.forEach(data, function (v, k) {
                            if (v.filePath != null) {
                                v.fileExt = "";
                                v.fileExt = v.filePath.split('.').pop();
                            }
                        })
                    })
                    .error(function (error) {
                        errorDisplay.show(error);
                        $log.error(error);
                    })
            }

            // If there's an Id
            if (taskNoteModuleId) {
                scope.init(taskNoteModuleId);
            }

            scope.addTaskNote = function () {
                var dialog = $modal.open({
                    backdrop: false,
                    windowClass: 'xx-dialog',
                    keyboard: true,
                    templateUrl: 'TNM/Modal/taskNoteEdit.html?a=aaaa',
                    controller: function ($scope, $log, $modalInstance, taskNoteService, $routeParams) {
                        // // MODAL SCOPE
                        $scope.tnm = {};
                        $scope.tnm.type = 1;
                        $scope.tnm.taskNoteModuleId = parseInt($routeParams.id);

                        $scope.type =
                        [{
                            value: 1,
                            label: 'Note'
                        }, {
                            value: 2,
                            label: 'Task'
                        }
                        ];

                        $scope.onChangedType = function (type) {
                            if (type == 2) {
                                $scope.postType = "Task";
                            }
                            else {
                                $scope.postType = "Note";
                            }
                            $scope.tnm.type = type;
                        };

                        $scope.changeDate = function (date) {
                            $scope.tnm.dateTimeFrom = date;
                            $scope.tnm.dateTimeTo = date;
                        };

                        $scope.save = function (tnm) {
                            //note
                            if (tnm.type == 1) {
                                $scope.tnm.dateTimeFrom = "";
                                $scope.tnm.dateTimeTo = "";
                                $scope.tnm.taskType = tnm.type;
                                taskNoteService.addNote(module, taskNoteModuleId, tnm)
                                    .success(function (data) {
                                        $modalInstance.close();
                                        alert($translate.instant('ALERT.CREATED'));
                                        scope.tasknoteArr.push(data);
                                    })
                                    .error(function (error) {
                                        errorDisplay.show(error);
                                        $log.error(error);
                                    });
                            }
                            else if (tnm.type == 2) {
                                $scope.tnm.taskType = tnm.type;
                                taskNoteService.addTask(module, taskNoteModuleId, tnm)
                                    .success(function (data) {
                                        $modalInstance.close();
                                        alert($translate.instant('ALERT.CREATED'));
                                        scope.tasknoteArr.push(data);
                                    })
                                    .error(function (error) {
                                        errorDisplay.show(error);
                                        $log.error(error);
                                    });
                            }

                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                });

                dialog.result.then(function (arr) {
                    // $scope.product.productProductMappings = arr;

                }, function () {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }

            scope.addDocument = function () {
                var dialog = $modal.open({
                    backdrop: false,
                    windowClass: 'xx-dialog',
                    keyboard: true,
                    templateUrl: 'TNM/Modal/documentEdit.html?a=a',
                    controller: function ($scope, $log, $timeout, $modalInstance, taskNoteService) {
                        $scope.progress = 0;
                        $scope.onFileSelect = function ($files) {
                            //$files: an array of files selected, each file has name, size, and type.
                            for (var i = 0; i < $files.length; i++) {
                                var file = $files[i];

                                $scope.upload = taskNoteService.upload(module, taskNoteModuleId, file)
                                    .progress(function (evt) {
                                    $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                                }).success(function (data, status, headers, config) {
                                    // file is uploaded successfully
                                    scope.tasknoteArr.push(data);

                                        if (data.filePath != null) {
                                            data.fileExt = "";
                                            data.fileExt = data.filePath.split('.').pop();
                                            // alert(v.fileExt);
                                        }
                                        alert($translate.instant('ALERT.UPLOADED'));
                                    $modalInstance.close();
                                }).error(function (error) {
                                    $log.error(error);
                                    errorDisplay.show(error);
                                });
                            }
                        };

                        $scope.save = function () {
                            $modalInstance.close();
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    resolve: {
                    }
                });

                dialog.result.then(function (arr) {

                }, function () {
                });
            }

            scope.removeTNM = function (id) {
                if (confirm($translate.instant('ALERT.DELETING'))) {
                    taskNoteService.delete(attrs.module, taskNoteModuleId, id)
                        .success(function (data) {
                            alert($translate.instant('ALERT.DELETED'));
                            scope.tasknoteArr = _.filter(scope.tasknoteArr, function (item) {
                                return item.taskNoteId !== id
                            });
                        })
                }
            }

        }
    };
});