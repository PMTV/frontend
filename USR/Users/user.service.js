var USR = angular.module('USR', ['ngEmerge', 'ajoslin.promise-tracker']);

USR.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/login', { templateUrl: 'login.html' })
        .when('/users', { templateUrl: 'USR/Users/user.html' })
        .when('/users/new', { templateUrl: 'USR/Users/UserEdit/userEdit.html' })
        .when('/users/:id', { templateUrl: 'USR/Users/UserEdit/userEdit.html' });
}]);

USR.factory('userService', function ($rootScope, $http, $emerge, promiseTracker) {
    // Authorization header

    var UserServiceBase = {
        query: function () {
            return $emerge.query("users");
        },
        get: function (id) {
            return $emerge.get("users", id);
        },
        add: function (data) {
            return $emerge.add("users", data);
        },
        update: function (data, id) {
            return $emerge.update("users", id, data)
        },
        patch: function (data, id) {
            return $emerge.patch("users", id, data);
        },
        delete: function (id) {
            return $emerge.delete("users", id);
        },
        queryRoles: function () {
            return $emerge.query("users/userRoles");
        },
        getUrl: function () {
            return $emerge.getUrl("users");
        },
        queryUsersList: function () {
            return $emerge.query("ecm/account/GetAllUser");
        },
        getUserInfoById: function (id) {
            return $emerge.query("ecm/account/GetById?userId=" + id);
        },
        updateUser: function (data, id) {
            var url = $emerge.getApiUrl() + "ecm/Account/updateUserAdmin?userId="+id;
            return $http.put(url, data);
        },
        updateCustomer: function (dât, id) {
            var url = $emerge.getApiUrl() + "ecm/account/updateUserCustomer?userId="+id;
            return $http.put(url, data, {
                tracker: 'globalTracker'
            });
        },
        addNewUser: function (data) {
            return $emerge.add("ecm/Account/addUser", data);
        },
        deleteUser: function (id) {
            var url = $emerge.getApiUrl() + "ecm/account/deleteUser?userId="+id;
            return $http.delete(url, {
                tracker: 'globalTracker'
            });
        }
    };

    return UserServiceBase;
});

USR.factory('Auth', function ($http, $rootScope, $cookieStore, $location, $emerge) {
    var url = $emerge.getApiUrl();
    var User = {};
    return {
        authorize: function(accessLevel, role) {
            if(role === undefined)
                role = $rootScope.appUser.role;
            return accessLevel &amp; role;
        },

        isLoggedIn: function(user) {
            if(user === undefined)
                user = $rootScope.appUser;
            return user.role === userRoles.user || user.role === userRoles.admin;
        },

        register: function(user, success, error) {
            $http.post('/register', user).success(success).error(error);
        },

        login: function (user, success, error) {
            return $http({
                method: 'POST',
                url: url + 'Token',
                data: $.param(user),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
                .success(function (user) {
                    $rootScope.appUser = user;
                    $cookieStore.put("appUser", user);
                    window.location = "index.html";
                })
                .error(function (error) {
                }
            );
        },

        logout: function(success, error) {
            $http.post(url + 'Account/Logout')
                .success(function () {
                    $cookieStore.put("appUser", "");
                    window.location = "login.html";
                })
                .error(error);
        },

        AccessToken: function () {
            if ($rootScope.appUser) {
                return $rootScope.appUser.access_token
            } else {
                return "";
            }
        },

        getUser: function () {
            return $rootScope.appUser;
        }
    };
});