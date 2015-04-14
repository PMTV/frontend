'use strict';

//EmergeApp.config(["$provide", function ($provide) {
//    $provide.decorator("$log", function ($delegate, emergeLogger) {
//        return {
//            log: function () {
//                $delegate.log(arguments);
//            },

//            info: function () {
//                $delegate.info(arguments);
//            },

//            error: function () {
//                $delegate.error(arguments);
//            },

//            warn: function () {
//                $delegate.warn(arguments);
//            },

//            logResponse: function (config) {
//                if (config.status != '200')
//                    emergeLogger.logger(config.config.url, config.config.method, config.data, config.status, 'RES');
//            },

//            logRequest: function (config) {
//                if (config.method != 'GET')
//                    emergeLogger.logger(config.url, config.method, config.data, config.status, 'REQ');
//            }
//        };
//    });
//}]);

EmergeApp.factory("emergeLogger", function () {
    return {
        logger: function (url, method, data, status, type) {
            if (url.contains("api/v1")) {

                var logData = [];

                logData = (readCookie("emergeLogs"));

                if (!logData) {
                    var logData = [];
                }

                logData.push({
                    url: url,
                    method: method,
                    data: data,
                    status: status,
                    dateTime: new Date(),
                    type: type
                });

                createCookie("emergeLogs", logData);
            }
        },
        getLogs: function () {
            return (readCookie("emergeLogs"));
        }
    }
});

EmergeApp.service('errorDisplay', ['$translate', function ($translate) {
    return {
        show: function (e, status, headers, config) {
            var errors = '';

            if (status == 404) {
                errors = $translate.instant('ALERT.NOT_FOUND');
            } else {
                if (e.modelState) {
                    angular.forEach(e.modelState, function (k, v) {
                        errors += (k) + '\n';
                    });
                }

                if (e.customError) {
                    angular.forEach(e.customError.errors, function (k, v) {
                        errors += (k.errorMessage) + '\n';
                    });
                }

                if (e.message) {
                    errors += (e.message) + '\n';
                }

                if (!errors) {
                    errors = 'Error, Please try again later.'
                }
            }

            alert(errors);
        }
    };
}]);

EmergeApp.directive('debugMessage', function ($emerge) {
    'use strict';
    return {
        restrict: 'E',
        transclude: true,
        template: "<pre class='debug-message' ng-transclude></pre>",
        link: function (scope, element, attrs) {
            var debug = $emerge.getDebug();
            if (!debug)
                $(element).hide();
        }
    }
});

EmergeApp.directive('debugWindow', function ($emerge, $rootScope, $modal, $timeout, emergeLogger) {
    'use strict';
    return {
        restrict: 'E',
        transclude: true,
        template: '' +
            '<pre>' +
                '<ul class="list-unstyled">' +
                    '<li ng-repeat="error in errorArr | orderBy:\'dateTime\':true" ng-class="{\'text-danger\' : error.status != 200 && error.type == \'RES\'}"> <a ng-click="showModal(error)" class="btn-link"><span>{{error.dateTime | fromNow}}</span> [{{error.type}}, {{error.method}}] {{error.url}}</a></li>' +
                '</ul>' +
            '</pre>',
        link: function (scope, element, attrs) {
            var debug = $emerge.getDebug();
            if (!debug)
                element.hide();

            //var update = function () {
            //    scope.errorArr = emergeLogger.getLogs();

            //    $timeout(update, 3000)
            //}

            //update();

            scope.showModal = function (error) {
                scope.error = error;
                $modal.open({
                    backdrop: true,
                    keyboard: true,
                    windowClass: '',
                    template: '' +
                        '<pre>Type:<br />' +
                            '{{error.type}}<br /><br />' +
                            'Method:<br />{{error.method}}<br /><br />' +
                            'Url:<br />{{error.url}}<br /><br />' +
                            'Data:<br />{{error.data | json}}' +
                        '</pre>',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                })
            }
        }
    }
});

function createCookie(name, value, days) {
    localStorage.setItem(name, JSON.stringify(value))
}

function readCookie(name) {
    var item = localStorage.getItem(name);

    if (item)
        return JSON.parse(item);

    return null;
}

function eraseCookie(name) {
    localStorage.clear();
}