'use strict';

EmergeApp.directive('portlet', function () {
    'use strict';
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '' +
            '<div class="portlet" ng-transclude>' +

            '</div>',
        link: function (scope, element, attrs) {
            element.sortable({
                connectWith: '.portlet',
                iframeFix: false,
                items: '.portlet-item',
                opacity: 0.8,
                helper: 'original',
                revert: true,
                forceHelperSize: true,
                placeholder: 'sortable-box-placeholder round-all',
                forcePlaceholderSize: true,
                tolerance: 'pointer',
                handle: '.panel-heading'
            }).bind('sortupdate', function (e, ui) {
                //console.log(e);
                //ui.item contains the current dragged element.
                //Triggered when the user stopped sorting and the DOM position has changed.
            });
        }
    }
})
    .directive('portletItem', function () {
        'use strict';
        return {
            require: '^portlet',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                title: '@'
            },
            template: '' +
                '<section class="panel portlet-item">'+
                '<header class="panel-heading font-bold">'+
                '<span class="h5">{{title}}</span>'+
                '<ul class="nav nav-pills pull-right">'+
                '<li>'+
                '<a class="panel-toggle text-muted">'+
                                '<i class="fa fa-caret-down text-active"></i>'+
                                '<i class="fa fa-caret-up text"></i>'+
                '</a>'+
                '</li>'+
                '</ul>'+
                '</header>'+
                '<div class="panel-body" ng-transclude>'+
                '</div>'+
                '</section>'
        }
    });

// panel toggle
$(document).on('click', '.panel-toggle', function (e) {
    e && e.preventDefault();
    var $this = $(e.target), $class = 'collapse', $target;
    if (!$this.is('a')) $this = $this.closest('a');
    $target = $this.closest('.panel');
    $target.find('.panel-body').toggleClass($class);
    $this.toggleClass('active');
});

EmergeApp.directive('ngGridMaster', ['$filter', '$timeout', '$compile', '$debounce', '$log', function ($filter, $timeout, $compile, $debounce, $log) {
    return {
        link: function (scope, element, attrs) {
            var msg = (attrs.showEmptyMsg) ? attrs.showEmptyMsg : 'No data available in table';
            var template = "<p ng-hide='items.length' style='padding:10px;'>" + msg + "</p>";
            var tmpl = angular.element(template);
            $compile(tmpl)(scope);
            $timeout(function () {
                element.find('.ngViewport').append(tmpl);
            }, 0);
        },
        controller: controller
    }
    function controller($scope, $attrs) {
        if (!$scope.sortOptions) {
            $log.error('Please include $scop.sortOptions in your ngGrid directive')
            return;
        }

        var firstLoaded = false;
        $scope.selectedItems = [];
        $scope.totalServerItems = 0;
        $scope.currentPage = 1;

        $scope.pageChanged = function (pageNo) {
            $scope.pagingOptions.currentPage = pageNo;
        };

        var customOptions = $scope.customOptions;

        var fixedOptions = {
            columnDefs: 'cols',
            data: 'items',
        };

        $scope.pagingOptions = {
            pageSizes: [15, 50, 100],
            pageSize: 15,
            currentPage: 1
        };
        // sort
        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: false
        };

        var defaultOptions = {
            selectedItems: $scope.selectedItems,
            showSelectionCheckbox: true,
            enablePaging: false,
            showFooter: true,
            headerRowHeight: 40,
            rowHeight: 40,
            enableRowSelection: false,
            enableHighlighting: true,
            useExternalSorting: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            sortInfo: $scope.sortOptions
        };

        $scope.options = {};

        angular.extend($scope.options, defaultOptions);
        angular.extend($scope.options, customOptions);
        angular.extend($scope.options, fixedOptions);


        $scope.$watch('pagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage || newVal.pageSize !== oldVal.pageSize)) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);
        $scope.$watch('filterOptions', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.$watch('sortOptions', function (newVal, oldVal) {
            if (newVal.fields[0] != oldVal.fields[0] || newVal.directions[0] != oldVal.directions[0]) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.$watch('search', $debounce(function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.options.filterOptions.filterText = newVal;
            }
        }, 300), true);

        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    }
}]);

EmergeApp.directive('tooltip', function () {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.tooltip();
        }
    }
});

EmergeApp.directive('datePicker', function ($timeout, $filter) {
    'use strict';
    return {
        restrict: 'A',
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            scope.$watch(attrs.ngModel, function (current, old) {
                if (!current) {
                    return;
                }
                if (current == old) {
                    return;
                }
                ngModel.$render();
            }, true);

            ngModel.$render = function () {
                if (scope.$eval(attrs.ngModel)) {
                    var selectedDate = $filter('date')(scope.$eval(attrs.ngModel), "dd/MM/yyyy");
                    // update the datepicker UI
                    element.datepicker('update', selectedDate);
                    // update the ngmodel value
                    ngModel.$setViewValue(element.datepicker('getUTCDate'));
                    ngModel.$setPristine(true)
                }
            };

            element.datepicker({
                format: "dd-mm-yyyy",
                todayBtn: true,
                autoclose: true,
                todayHighlight: true
            })
                .on('hide', function (e) {
                    scope.$apply(function () {
                        if(scope.$eval(attrs.ngModel)){
                            ngModel.$setViewValue(element.datepicker('getUTCDate'));
                        }
                        else {
                            return false;
                        }
                    });
                });
        }
    }
});

EmergeApp.directive("btnLoading", function () {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(
                function () {
                    return scope.$eval(attrs.btnLoading);
                },
                function (value) {
                    if (value) {
                        if (!attrs.hasOwnProperty('ngDisabled')) {
                            element.addClass('disabled').attr('disabled', 'disabled');
                        }

                        element.data('resetText', element.html());
                        element.html('<i class="fa fa-spinner fa-spin m-l-sm"></i> ' + element.data('loading-text'));
                    } else {
                        if (!attrs.hasOwnProperty('ngDisabled')) {
                            element.removeClass('disabled').removeAttr('disabled');
                        }

                        element.html(element.data('resetText'));
                    }
                }
            );
        }
    };
});

EmergeApp.directive('bsNavbar', function ($location) {
    'use strict';
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs, controller) {
            // Watch for the $location
            scope.$watch(function () {
                return $location.path();
            }, function (newValue, oldValue) {

                $('li[data-match-route]', element).each(function (k, li) {
                    var $li = angular.element(li),
                    // data('match-rout') does not work with dynamic attributes
                        pattern = $li.attr('data-match-route'),
                        regexp = new RegExp('^' + pattern + '$', ['i']);

                    if (regexp.test(newValue)) {
                        $li.addClass('active');
                    } else {
                        $li.removeClass('active');
                    }

                });
            });
        }
    };
});

EmergeApp.directive('showTab', function () {
    return {
        link: function (scope, element, attrs) {
            element.click(function (e) {
                e.preventDefault();
                element.tab('show');
            });
        }
    };
});

EmergeApp.directive('slimScroll', function () {
    return {
        link: function (scope, element, attrs) {
            var $self = $(element), $data = $self.data(), $slimResize;
            $data = { height: '100%' };
            $self.slimScroll($data);
            $(window).resize(function (e) {
                clearTimeout($slimResize);
                $slimResize = setTimeout(function () {
                    $self.slimScroll($data);
                }, 500);
            });
        }
    };
});

EmergeApp.directive('wysiwyg', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $(element).wysiwyg();
        }
    };
});

EmergeApp.directive('sparkline', function ($emerge, $timeout) {
    'use strict';
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {

            scope.$watch(function(){ return scope.recieveInfo;}, function (newVal, oldVal) {
                if(newVal!=null){
                    generateSparkline(false);
                }else{return false;}
            }, true);

            // chart js
            var generateSparkline = function ($re) {
                $(element).each(function () {
                    var $data = new Array();
                    $data = $(this).data();

                    if ($re && !$data.resize) return;

                    if ($data.type == 'bar') {
                        !$data.barColor && ($data.barColor = "#3fcf7f");
                        !$data.barSpacing && ($data.barSpacing = 2);
                        $(this).next('.axis').find('li').css('width', $data.barWidth + 'px').css('margin-right', $data.barSpacing + 'px');
                    }

                    ($data.type == 'pie') && $data.sliceColors && ($data.sliceColors = eval($data.sliceColors));
                    ($data.type == 'bar') && $data.stackedBarColor && ($data.stackedBarColor = eval($data.stackedBarColor));

                    $data.fillColor && ($data.fillColor.indexOf("#") !== -1) && isRgbaSupport() && ($data.fillColor = toRgba($data.fillColor, 0.5));

                    $data.valueSpots = { '0:': $data.spotColor };
                    $data.minSpotColor = false;
                    $(this).sparkline($data.data || "html", $data);

                    if ($(this).data("compositeData")) {
                        var $cdata = {};
                        $cdata = $(this).data("compositeConfig");
                        $cdata.composite = true;
                        $cdata.valueSpots = { '0:': $cdata.spotColor };
                        $cdata.fillColor && ($cdata.fillColor.indexOf("#") !== -1) && isRgbaSupport() && ($cdata.fillColor = toRgba($cdata.fillColor, 0.5));
                        $(this).sparkline($(this).data("compositeData"), $cdata);
                    }
                    if ($data.type == 'line') {
                        $(this).next('.axis').addClass('axis-full');
                    }
                });
            };

        }
    }
});

EmergeApp.directive('heroArea', function ($emerge, $timeout) {
    'use strict';
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
//            common function
            var m_names = new Array("Jan", "Feb", "Mar","Apr", "May", "June", "July", "Aug", "Sept","Oct", "Nov", "Dec");

            // chart js
            scope.$watch(function(){return scope.dataChartStatistics;}, function(newVal, oldVal) {
                if(newVal != null){
//                    console.log(newVal);
                    $(element).empty();
                    var dataInput = new Array();

                    angular.forEach(newVal, function (key, value) {
                        var temp = {};
                        key.period = key.period.replace("/", "-");
                        temp[key.xkey] = key.period;
                        temp[key.ykey] = key.order.order;
                        dataInput.push(temp);
                    });

//                    console.log(dataInput);

                    var buildArea = function () {
                        Morris.Area({
                                element: 'hero-area',
                                data: dataInput,
                                xkey: 'period',
                                ykeys: ['order'],
                                dateFormat: function(x){
                                    var date = new Date(x);
                                    var month = m_names[date.getMonth()];
                                    var year = date.getFullYear();
                                    var day = date.getDate();
                                    if(day!=null){
                                        return day + '-' + month + '-' + year;
                                    }
                                    return month + '-' + year;
                                },
                                xLabelFormat: function (x) {
                                    var date = new Date(x);
                                    var month = m_names[date.getMonth()];
                                    var year = date.getFullYear();
                                    var day = date.getDate();
                                    if(scope.selectStatistics != 'byYear'){
                                        return day + '-' + month;
                                    }else{
                                        return month + '-' + year;
                                    }
                                },
                                labels: ['Orders'],
                                hideHover: 'auto',
                                lineWidth: 2,
                                pointSize: 4,
                                lineColors: ['#59dbbf'],
                                fillOpacity: 0.5,
                                smooth: true
                            }
                        );
                    };
                    buildArea();
                    $timeout(function () {

                        $(element).each(function () {

                        });
                    }, 0);
                }else{return false;}
            }, true);

//            console.log(scope.dataChartStatistics);

        }
    }
});

EmergeApp.directive('highCharts', function ($emerge, $timeout) {
    'use strict';
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {

            scope.$watch(function(){return scope.recieveInfo;}, function (newVal, oldVal) {
                if(newVal!=null){
                    var lineChart = new Array();
                    var barChart = new Array();
                    var dateChart = new Array();

                    lineChart = scope.receiveChartLine;
                    barChart = scope.receiveChartBar;

                    angular.forEach(scope.recieveInfo.receivableAmountList, function (key, value) {
                        var dateTemp = new Date(value);
                        dateTemp = dateTemp.getDate() + '/' + (dateTemp.getMonth() + 1);
                        dateChart.push(dateTemp);
                    });

                    highCharts(lineChart, barChart, dateChart);

                }else{return false;}
            }, true);

            var highCharts = function (dataLine, dataBar, dateChart) {

                $(element).highcharts({
                    title: {
                        text: ''
                    },
                    xAxis: {
                        categories: dateChart
                    },
                    yAxis:{
                        title: {
                            text: ''
                        }
                    },
                    tooltip: {
                        shared: true
                    },
                    series: [
                        {
                            type: 'column',
                            name: 'Actual Receivable Amount',
                            data: dataBar
                        },
                        {
                            type: 'spline',
                            name: 'Receivable Amount',
                            data: dataLine,
                            marker: {
                                lineWidth: 2,
                                lineColor: Highcharts.getOptions().colors[3],
                                fillColor: 'white'
                            }
                        }
                    ],

                });
            };
        }
    }
});

EmergeApp.directive('bootstrapCalendar', function ($emerge, $timeout) {
    'use strict';
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
            // bootstrap calendar js
            var theMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var theDays = ["S", "M", "T", "W", "T", "F", "S"];
            return false;
//            $(element).calendar({
//                months: theMonths,
//                days: theDays,
//                req_ajax: {
//                    type: 'get',
//                    url: 'assets/js/calendar/json.php'
//                },
//                popover_options:{
//                    placement: 'top',
//                    html: true
//                },
//                tooltip_options:{
//                    placement: 'top',
//                    html: true,
//                    title: 'hello'
//                }
//            });


        }
    }
});

EmergeApp.directive('tags', function ($emerge, $timeout) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        template: '<div ui-select2="select2Tags" class="ui-select2"></div>', // ng-options="s.supplierId as s.companyName for s in suppliers"
        controller: function ($scope) {
            // SELECT2 AJAX EXAMPLE * DO NOT REMOVE
            $scope.select2Tags = {
                minimumInputLength: 3,
                'multiple': true,
                'simple_tags': true,
                'tags': []  // Can be empty list.
            };

            $scope.$watch('ngModel', function (val) {
                if (!angular.isString(val) || !val)
                    return;

                $scope.ngModel = val.split(',');
            }, true)
        }
    }
});
///************ OVERLAY DIRECTIVE *************/
//(function () {

EmergeApp.directive('heroArea', function ($emerge, $timeout) {
    'use strict';
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
            // chart js

            var buildArea = function () {
                Morris.Area({
                    element: 'hero-area',
                    data: [
                      { period: '2010 Q1', iphone: 2666, ipad: null, itouch: 2647 },
                      { period: '2010 Q2', iphone: 2778, ipad: 2294, itouch: 2441 },
                      { period: '2010 Q3', iphone: 4912, ipad: 1969, itouch: 2501 },
                      { period: '2010 Q4', iphone: 3767, ipad: 3597, itouch: 5689 },
                      { period: '2011 Q1', iphone: 6810, ipad: 1914, itouch: 2293 },
                      { period: '2011 Q2', iphone: 5670, ipad: 4293, itouch: 1881 },
                      { period: '2011 Q3', iphone: 4820, ipad: 3795, itouch: 1588 },
                      { period: '2011 Q4', iphone: 15073, ipad: 5967, itouch: 5175 },
                      { period: '2012 Q1', iphone: 10687, ipad: 4460, itouch: 2028 },
                      { period: '2012 Q2', iphone: 8432, ipad: 5713, itouch: 1791 }
                    ],
                    xkey: 'period',
                    ykeys: ['iphone', 'ipad', 'itouch'],
                    labels: ['iPhone', 'iPad', 'iPod Touch'],
                    hideHover: 'auto',
                    lineWidth: 2,
                    pointSize: 4,
                    lineColors: ['#59dbbf', '#aeb6cb', '#5dcff3'],
                    fillOpacity: 0.5,
                    smooth: true,
                });
            };

            $timeout(function () {
                $(element).each(function () {
                    buildArea();
                    //var morrisResizes;
                    //$(window).resize(function (e) {
                    //    clearTimeout(morrisResizes);
                    //    morrisResizes = setTimeout(function () {
                    //        $('.graph').html('');
                    //        buildArea();
                    //    }, 500);
                    //});
                });
            }, 0);
        }
    }
});

//    //Hook httpInterceptor factory into the $httpProvider interceptors so that we can monitor XHR calls
//    wcDirectivesApp.config(['$httpProvider', httpProvider]);

//    //Directive that uses the httpInterceptor factory above to monitor XHR calls
//    //When a call is made it displays an overlay and a content area
//    //No attempt has been made at this point to test on older browsers
//    wcDirectivesApp.directive('wcOverlay', ['$q', '$timeout', '$window', 'httpInterceptor', wcOverlayDirective]);

//}());