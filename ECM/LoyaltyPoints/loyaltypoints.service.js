
ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/loyaltypoints', { templateUrl: 'ECM/LoyaltyPoints/LoyaltyPoints.html' })
        .when('/loyaltypoints/new', { templateUrl: 'ECM/LoyaltyPoints/LoyaltyPointEdit.html' })
        .when('/loyaltypoints/:id', { templateUrl: 'ECM/LoyaltyPoints/LoyaltyPointEdit.html' });
}]);



ECM.factory('loyaltypointsService', function ($rootScope, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var loyaltyPointsBase = {
        query: function(q, step, page, from, to) {
            return $emerge.query("ecm/LoyaltyPoint" + "?q=" + (q || "") + (step ? "&step=" + step : "") + (page ? "&page=" + page : "") + (from ? "&from=" + from : "") + (to ? "&to=" + to : ""));
        },

        get: function(id) {
            return $emerge.get('ecm/LoyaltyPoint', id);
        },

        add: function (loyaltypoints) {
            return $emerge.add('ecm/LoyaltyPoint', loyaltypoints);
        },
        
        update: function (loyaltypoints, data) {
            // TODO Remove when USR Module ready
            return $emerge.update("ecm/LoyaltyPoint", loyaltypoints, data);
        },
        
        delete: function (id) {
            return $emerge.delete("ecm/LoyaltyPoint", id);
        },
        dateFromDMYToMDY : function(obj) {
            var date = obj.substring(0, 2);
            var month = obj.substring(3, 5);
            var year = obj.substr(6);
            var rs = month + '/' + date + '/' + year;
            return rs;
        },
        dateFromMDYToDMY: function (obj) {
            var month = obj.substring(0, 2);
            var date = obj.substring(3, 5);
            var year = obj.substr(6);
            var rs = date + '/' + month + '/' + year;
            return rs;
        },
    };

    return loyaltyPointsBase;
});