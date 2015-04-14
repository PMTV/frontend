var PRF = angular.module('PRF', ['ECM']);

PRF.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/profile', { templateUrl: 'PRF/Profile/profile.html' })
}]);

PRF.factory("profileService", function ($http, $rootScope, $emerge, promiseTracker) {

    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var ProfileBaseServices = {
        getProfile : function () {
            return $emerge.query("ecm/Profile");
        },
        getUrl : function () {
            return $emerge.getApiUrl() + "ecm/Profile";
        }
    };

    return ProfileBaseServices;
});