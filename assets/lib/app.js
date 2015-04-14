'use strict';

// Declare app level module which depends on filters, and services
var EmergeApp = angular.module('EmergeApp', [
  'ngRoute', 'ngResource', 'CRM', 'TNM', 'GNM', 'PRD','angularFileUpload','ui.bootstrap','$strap.directives'
]);

EmergeApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', { templateUrl: 'Dashboard/dashboard.html' });
    $routeProvider.otherwise({ redirectTo: '/' });
}]);


EmergeApp.directive('showTab',
    function () {
        return {
            link: function (scope, element, attrs) {
                element.click(function (e) {
                    e.preventDefault();
                    $(element).tab('show');

                    var $self = $(element), $data = $self.data(), $slimResize;
                    $self.slimScroll($data);
                    $(window).resize(function(e) {
                        clearTimeout($slimResize);
                        $slimResize = setTimeout(function(){$self.slimScroll($data);}, 500);
                    });
                });
            }
        };
    });
