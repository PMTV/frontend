
ECM.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/commission', { templateUrl: 'ECM/Commission/Commission.html' })
        .when('/commission/new', { templateUrl: 'ECM/Commission/CommissionEdit.html' })
        .when('/commission/:id', { templateUrl: 'ECM/Commission/CommissionEdit.html' });
}]);



ECM.factory('commissionService', function ($rootScope, $emerge, promiseTracker) {
    $rootScope.tracker = promiseTracker('globalTracker', {
        minDuration: 1000 //add this so we can actually see it come up
    });

    var commissionBase = {
        query: function(q, step, page) {
            return $emerge.query("ecm/Commission" + "?q=" + (q || "") + (step ? "&step=" + step : "") + (page ? "&page=" + page : ""));
        },

        get: function(id) {
            return $emerge.get('ecm/Commission', id);
        },

        add: function (commission) {
            return $emerge.add('ecm/Commission', commission);
        },
        
        update: function (commission, data) {
            // TODO Remove when USR Module ready
            return $emerge.update("ecm/Commission", commission, data);
        },
        
        delete: function (id) {
            return $emerge.delete("ecm/Commission", id);
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
        getEmployeeList: function(){
            return $emerge.query("ecm/CommissionHistory/GetSalePerson");
        }
    };

    return commissionBase;
});