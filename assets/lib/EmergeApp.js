'use strict';

// Declare app level module which depends on filters, and services
var EmergeApp = angular.module('EmergeApp', [
  'ngRoute', 'ngResource', 'ngCookies', 'ngAnimate',
  'ngEmerge', 'USR', 'Settings', 'GNM', 'CRM', 'ACC', 'PRD', 'PUR', 'ORD', 'INV', 'TNM', 'ECM', 'firebase', 'underscore', 'PRF', 'Dashboard',
  'ngDebounce', 'http-auth-interceptor', 'ui.sortable', 'ui.select2', 'toaster', 'ajoslin.promise-tracker', 'angularFileUpload', 'ui.bootstrap', 'textAngular', 'ngGrid', 'pascalprecht.translate', 'cfp.hotkeys' //, '$strap.directives', 'overlay'
]);

// Emerge App runtime config for Interceptor
EmergeApp.config(['$routeProvider', '$locationProvider', '$httpProvider', '$emergeProvider', function ($routeProvider, $locationProvider, $httpProvider, $emergeProvider) {
    $routeProvider
        .when('/', { templateUrl: 'Dashboard/dashboard.html' })
        .otherwise({ redirectTo: '/' });

    // Request Headers for Token
    $httpProvider.interceptors.push(function ($rootScope, $q, $window, $log, httpBuffer) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                //$log.logRequest(config);

                if ($rootScope.appUser)
                    config.headers.Authorization = 'Bearer ' + $rootScope.appUser.access_token; //$window.sessionStorage.token;

                return config;
            },
            // optional method
            'response': function (response) {
                // do something on success
                //$log.logResponse(response);
                return response || $q.when(response);
            },
            'responseError': function (rejection) {
                // if unauthorized, redirect users
                if (rejection.status === 401 && !rejection.config.ignoreAuthModule) {

                    var deferred = $q.defer();
                    httpBuffer.append(rejection.config, deferred);

                    $rootScope.$broadcast('event:auth-loginRequired', rejection);

                    return deferred.promise;
                }
                // otherwise, default behaviour
                return $q.reject(rejection);
            }
        };
    });

    //$emergeProvider.config.setUseHttps(false);
    //$emergeProvider.config.setBaseUrl("192.168.1.104", "api/v1");
    //$emergeProvider.config.setPort("8880");
    //$emergeProvider.config.setEnvironment("192.168.1.104");
    //$emergeProvider.config.setDebug(false);

    //$emergeProvider.config.setUseHttps(false);
    //$emergeProvider.config.setBaseUrl("dev2.higheridentity.com", "api/v1");
    //$emergeProvider.config.setPort("8880");
    //$emergeProvider.config.setEnvironment("localhost");
    //$emergeProvider.config.setDebug(false);

    $emergeProvider.config.setUseHttps(false);
    $emergeProvider.config.setBaseUrl("localhost", "api/v1");
    $emergeProvider.config.setPort("31865");
    $emergeProvider.config.setEnvironment("localhost");
    $emergeProvider.config.setDebug(false);

    //$emergeProvider.config.setUseHttps(false);
    //$emergeProvider.config.setBaseUrl("emerge.higheridentity.com", "api/v1");
    //$emergeProvider.config.setPort("");
    //$emergeProvider.config.setEnvironment("localhost");
    //$emergeProvider.config.setDebug(true);
    //$emergeProvider.config.setFireBaseRealTimeEnabled(false);

    //$emergeProvider.config.setUseHttps(false);
    //$emergeProvider.config.setBaseUrl("dev.higheridentity.com", "api/v1");
    //$emergeProvider.config.setPort("8585");
    //$emergeProvider.config.setEnvironment("production");
    //$emergeProvider.config.setFirebaseUrl("http://emergeapp.firebaseio.com");
    //$emergeProvider.config.setDebug(true);
}]);

// Emerge App on Initializing, set rootScope
EmergeApp.run(function ($rootScope, $route, $location, $cookieStore, $window, Auth, $emerge, $modal, httpBuffer, $translate) {
    // When redirected from login.html, get and set the $rootScope.appUser object with the Cookie Object
    $rootScope.appUser = $cookieStore.get("appUser");
    $rootScope.loginShow = false;
    $rootScope.auditLogEnabled = $emerge.auditLogEnabled;

    $rootScope.$on('event:auth-loginRequired', function () {
        // check whether usercookie exists
        if ($cookieStore.get("appUser")) {
            // if exists means cookie expired
            if (!$rootScope.loginShow) {
                $rootScope.loginShow = true;

                $modal.open({
                    backdrop: 'static',
                    keyboard: true,
                    windowClass: '',
                    templateUrl: 'USR/login.modal.html?a=a',
                    controller: function ($scope, $modalInstance) {
                        // MODAL SCOPE
                        $scope.appUser = {};
                        $scope.submitted = false;

                        $scope.login = function () {
                            $scope.submitted = true;
                            var user = $scope.appUser;

                            var userData = {
                                grant_type: 'password',
                                username: user.username,
                                password: user.password
                            }

                            if (!user.username && !user.password) {
                                $scope.submitted = false;
                                alert('Please enter your Username and Password');
                            } else {
                                Auth.login(userData)
                                    .success(function () {
                                        $rootScope.loginShow = false;
                                        httpBuffer.retryAll();
                                        $modalInstance.dismiss('cancel');
                                    })
                                    .error(function (error) {
                                        $scope.submitted = false;
                                        alert(error.error_description);
                                    });
                            }
                        };

                        $scope.cancel = function () {
                            //$modalInstance.dismiss('cancel');
                            window.location = "index.html";
                        };
                    }
                });
            }
        } else {
            // if not exists means they have either logged out or first time login, redirect user to login
            $window.location = "login.html";
        }

    });

    $rootScope.openAuditLog = function (module, recordId) {
        var dialog = $modal.open({
            backdrop: true,
            keyboard: true,
            windowClass: 'xx-dialog',
            templateUrl: 'GNM/AuditLog/auditLogModal.html?a=aaaaaaa',
            controller: function ($scope, $modalInstance, $modal, auditLogService) {
                $scope.auditLogs = [];
                $scope.auditLogsDetails = [];

                auditLogService.query(module, recordId).success(function (data) {
                    $scope.auditLogs = data;
                });

                //switch(module) {
                //    case 'quotations':
                //        loadDetail('quotationDetails', )
                //        break;
                //    case n:
                //        code block
                //        break;
                //    default:
                //    default code block
    //}

                $scope.getEventType = function (id) {
                    var arr = auditLogService.getEventTypes();
                    var status = _.find(arr, function (e) { return e.value == id; });

                    if (status) {
                        return status.name;
                    } else {
                        return "";
                    }
        }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
    }
        });

        dialog.result.then(function () {
        }, function () {

        });

        dialog.opened.then(function () {
    });
    }

    $rootScope.logout = function () {
        Auth.logout();
    }

    $rootScope.reload = function () {
        $route.reload();
    }

    $rootScope.changeLanguage = function (langKey) {
        $translate.use(langKey);
    };
})

// Emerge REST module and configuration
angular.module('ngEmerge', [])
    .provider('$emerge', [function () {
        var appHttp = "http://"; // http:// or https://
        var appBaseDomain = "localhost"; // dev.higheridentity.com or localhost
        var appBaseUrl = "api/v1"; // api/v1
        var appPort = ""; // 8585, 80 or custom port
        var appFirebaseUrl = "http://emergeapp.firebaseio.com";
        var appFirebaseRealtimeEnabled = false;
        var appAuditLogEnabled = false;

        var useLocalhost = false;
        var environment = "localhost";
        var debug = false;

        this.$get = function ($rootScope, $cookieStore, $http, $upload, $log, promiseTracker) {
            // build querystring
            function buildUrl(url, parameters) {
                var qs = "";
                for (var key in parameters) {
                    var value = parameters[key];
                    if (value)
                        qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
                }
                if (qs.length > 0) {
                    qs = qs.substring(0, qs.length - 1); //chop off last "&"
                    url = url + "?" + qs;
                }
                return url;
            }

            var dataService = {};
            var user = $cookieStore.get('appUser');
            var appUrl = "";
            var apiUrl = "";

            apiUrl = appHttp + appBaseDomain + (appPort ? (":" + appPort) : '') + "/" + appBaseUrl + "/";
            appUrl = appHttp + appBaseDomain + (appPort ? (":" + appPort) : '') + "/";

            $log.log(apiUrl);

            $rootScope.tracker = promiseTracker('globalTracker', {
                minDuration: 0, //add this so we can actually see it come up,
                activationDelay: 500
            });

            return {
                firebaseUrl: appFirebaseUrl,
                firebaseRealTimeEnabled: appFirebaseRealtimeEnabled,
                auditLogEnabled: appAuditLogEnabled,
                
                getAppUrl: function () {
                    return appUrl;
                },
                getApiUrl: function () {
                    return apiUrl;
                },
                getDebug: function () {
                    return debug;
                },
                query: function (controller, params, options) {
                    var options = options || {};
                    options["tracker"] = options["tracker"] || "globalTracker";

                    var url = apiUrl + controller;
                    url = buildUrl(url, params);


                    return $http.get(url, options);
                },
                get: function (controller, id, options) {
                    var options = options || {};
                    options["tracker"] = options["tracker"] || "globalTracker";

                    var url = apiUrl + controller + "/" + id;

                    return $http.get(url, options);
                },
                post: function (controller, data) {
                    var url = apiUrl + controller;

                    return $http.post(url, data);
                },
                add: function (controller, data) {
                    var url = apiUrl + controller;

                    return $http.post(url, data);
                },
                update: function (controller, id, data) {
                    var url = apiUrl + controller + "/" + id;

                    return $http.put(url, data)
                },
                patch: function (controller, id, data) {
                    var url = apiUrl + controller + "/" + id;

                    return $http({
                        url: url,
                        data: data,
                        method: "PATCH",
                    })
                },
                delete: function (controller, id, custom) {
                    var url = apiUrl + controller + "/" + id;

                    url = custom ? url + custom : url;

                    return $http.delete(url);
                },
                getPDF: function (controller) {
                    var url = appUrl + controller;

                    return $http.get(url, { responseType: 'arraybuffer' }, {
                        tracker: 'globalTracker'
                    });
                },
                getUrl: function (controller) {
                    return apiUrl + controller;
                },
                upload: function (controller, id, file) {
                    return $upload.upload({
                        url: apiUrl + controller + '/' + id,
                        file: file,
                    });
                }
            }
        };

        this.config = {
            setUseHttps: function (https) {
                if (https) {
                    appHttp = "https://";
                } else {
                    appHttp = "http://";
                }
            },

            setBaseUrl: function (domain, url) {
                appBaseDomain = domain;
                appBaseUrl = url;
            },

            setPort: function (port) {
                appPort = port;
            },

            setEnvironment: function (env) {
                environment = env;
            },

            setFirebaseUrl: function (url) {
                appFirebaseUrl = url;
            },

            setFireBaseRealTimeEnabled: function (e) {
                appFirebaseRealtimeEnabled = e;
            },

            setAuditLogEnabled: function (e) {
                appAuditLogEnabled = e;
            },

            setDebug: function (d) {
                debug = d;
            }
        }
    }]);
