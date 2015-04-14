'use strict';

/* Filters */

EmergeApp.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

EmergeApp.filter('emptyReturn', function () {
    return function (input, char) {
        if (!char) {
            char = '-';
        }
        return input ? input : char;
    };
});

EmergeApp.filter('fromNow', function () {
    return function (date) {
        var dateNow = moment.unix(date / 1000);

        var valid = dateNow.isValid();

        if (valid) {
            return moment(dateNow).fromNow();
        } else {
            moment.lang('en', {
                relativeTime: {
                    future: "%s",
                    past: "%s",
                    s: "1s",
                    m: "1m",
                    mm: "%dm",
                    h: "h",
                    hh: "%dh",
                    d: "d",
                    dd: "%dd",
                    M: "m",
                    MM: "%dm",
                    y: "y",
                    yy: "%dy"
                }
            });
            return moment(date).fromNow(true);
        }
    }
});

EmergeApp.directive('time',
  [
    '$timeout',
    'fromNowFilter',
    function ($timeout, fromNowFilter) {
        return {
            restrict: 'A',
            scope: {
                time: '@'
            },
            link: function ($scope, element, attrs) {
                var intervalLength = 1000 * 10; // 10 seconds
                var filter = fromNowFilter;
                var timeoutId;

                $scope.$watch('time', function () {
                    // all the code here...
                    if (attrs.time) {
                        updateTime();
                        updateLater();
                    } else {
                        $timeout.cancel(timeoutId);
                    }
                });

                function updateTime() {
                    element.text(filter(attrs.time));
                }

                function updateLater() {
                    timeoutId = $timeout(function () {
                        updateTime();
                        updateLater();
                    }, intervalLength);
                }

                element.bind('$destroy', function () {
                    $timeout.cancel(timeoutId);
                });
            }
        };
    }
  ]
);
//angular.module('myApp.filters', []).
//  filter('interpolate', ['version', function(version) {
//    return function(text) {
//      return String(text).replace(/\%VERSION\%/mg, version);
//    }
//  }]);
