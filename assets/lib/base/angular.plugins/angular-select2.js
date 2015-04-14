/**
 * Enhanced Select2 Dropmenus
 *
 * @AJAX Mode - When in this mode, your value will be an object (or array of objects) of the data used by Select2
 *     This change is so that you do not have to do an additional query yourself on top of Select2's own query
 * @params [options] {object} The configuration options passed to $.fn.select2(). Refer to the documentation
 */

angular.module("ui.select2", [])
    .value('uiSelect2Config', {})
    .directive('uiSelect2', ['uiSelect2Config', '$timeout', '$compile', function (uiSelect2Config, $timeout, $compile) {
        var options = {};
        if (uiSelect2Config) {
            angular.extend(options, uiSelect2Config);
        }
        return {
            require: 'ngModel',
            priority: 199,
            replace: true,
            compile: function (tElm, tAttrs) {
                var watch,
                  repeatOption,
                  repeatAttr,
                  isSelect = tElm.is('select'),
                  isMultiple = angular.isDefined(tAttrs.multiple),
                  footer = tAttrs.footer,
                  footerFn = tAttrs.footerfn;

                // Enable watching of the options dataset if in use
                if (tElm.is('select')) {
                    repeatOption = tElm.find('optgroup[ng-repeat], optgroup[data-ng-repeat], option[ng-repeat], option[data-ng-repeat]');

                    if (repeatOption.length) {
                        repeatAttr = repeatOption.attr('ng-repeat') || repeatOption.attr('data-ng-repeat');
                        watch = jQuery.trim(repeatAttr.split('|')[0]).split(' ').pop();
                    }
                }

                return function (scope, elm, attrs, controller) {
                    // instance-specific options
                    var opts = angular.extend({}, options, scope.$eval(attrs.uiSelect2));

                    /*
                    Convert from Select2 view-model to Angular view-model.
                    */
                    var convertToAngularModel = function (select2_data) {
                        var model;
                        if (opts.simple_tags) {
                            model = [];
                            angular.forEach(select2_data, function (value, index) {
                                model.push(value.id);
                            });
                        } else {
                            model = select2_data;

                            if (opts.dataBinder) {

                            }
                        }
                        return model;
                    };

                    /*
                    Convert from Angular view-model to Select2 view-model.
                    */
                    var convertToSelect2Model = function (angular_data) {
                        var model = [];
                        if (!angular_data) {
                            return model;
                        }

                        if (opts.simple_tags) {
                            model = [];
                            if (!angular.isArray(angular_data)) {
                                angular_data = angular_data.split(',');
                            }

                            angular.forEach(
                              angular_data,
                              function (value, index) {
                                  model.push({ 'id': value, 'text': value });
                              });
                        } else {
                            model = angular_data;
                        }
                        return model;
                    };

                    if (isSelect) {
                        // Use <select multiple> instead
                        delete opts.multiple;
                        delete opts.initSelection;
                    } else if (isMultiple) {
                        opts.multiple = true;
                    }

                    if (controller) {
                        // Watch the model for programmatic changes
                        scope.$watch(tAttrs.ngModel, function (current, old) {
                            if (!current) {
                                return;
                            }
                            if (current === old) {
                                return;
                            }
                            controller.$render();
                        }, true);
                        controller.$render = function () {
                            if (isSelect) {
                                elm.select2('val', controller.$viewValue);
                            } else {
                                if (opts.multiple) {
                                    elm.select2(
                                      'data', convertToSelect2Model(controller.$viewValue));
                                } else {
                                    
                                    if (angular.isObject(controller.$viewValue)) {
                                        elm.select2('data', controller.$viewValue);
                                    } else if (!controller.$viewValue) {
                                        elm.select2('data', null);
                                    } else {
                                        elm.select2('val', controller.$viewValue);
                                    }

                                    if (angular.isObject(controller.$viewValue))
                                    {
                                        //controller.$setViewValue(convertToAngularModel(opts.dataBinder(elm.select2('data'))));    
                                    }
                                    
                                }
                            }
                        };

                        // Watch the options dataset for changes
                        if (watch) {
                            scope.$watch(watch, function (newVal, oldVal, scope) {
                                if (angular.equals(newVal, oldVal)) {
                                    return;
                                }
                                // Delayed so that the options have time to be rendered
                                $timeout(function () {
                                    elm.select2('val', controller.$viewValue);
                                    // Refresh angular to remove the superfluous option
                                    elm.trigger('change');
                                    if (newVal && !oldVal && controller.$setPristine) {
                                        controller.$setPristine(true);
                                    }
                                });
                            });
                        }

                        // Update valid and dirty statuses
                        controller.$parsers.push(function (value) {
                            var div = elm.prev();
                            div
                              .toggleClass('ng-invalid', !controller.$valid)
                              .toggleClass('ng-valid', controller.$valid)
                              .toggleClass('ng-invalid-required', !controller.$valid)
                              .toggleClass('ng-valid-required', controller.$valid)
                              .toggleClass('ng-dirty', controller.$dirty)
                              .toggleClass('ng-pristine', controller.$pristine);
                            return value;
                        });

                        if (!isSelect) {
                            // Set the view and model value and update the angular template manually for the ajax/multiple select2.
                            elm.bind("change", function () {
                                if (scope.$$phase || scope.$root.$$phase) {
                                    return;
                                }
                                if (!opts.dataBinder) {
                                    opts.dataBinder = function (data) {
                                        return data;
                                    };
                                }
                                scope.$apply(function () {
                                    //controller.$setViewValue(convertToAngularModel(elm.select2('data')));
                                    //convertToAngularModel(elm.select2('val')));
                                    controller.$setViewValue(convertToAngularModel(opts.dataBinder(elm.select2('data'))));
                                });
                            });

                            if (opts.initSelection) {
                                var initSelection = opts.initSelection;
                                opts.initSelection = function (element, callback) {
                                    initSelection(element, function (value) {
                                        controller.$setViewValue(convertToAngularModel(elm.select2('val')));
                                        // controller.$setViewValue(convertToAngularModel(opts.dataBinder(value))); // Does not fire trigger
                                        callback(value);
                                    });
                                };
                            }
                        }
                    }

                    elm.bind("$destroy", function () {
                        elm.select2("destroy");
                    });

                    attrs.$observe('disabled', function (value) {
                        elm.select2('enable', !value);
                    });

                    attrs.$observe('readonly', function (value) {
                        elm.select2('readonly', !!value);
                    });

                    if (attrs.ngMultiple) {
                        scope.$watch(attrs.ngMultiple, function (newVal) {
                            attrs.$set('multiple', !!newVal);
                            elm.select2(opts);
                        });
                    }

                    // Initialize the plugin late so that the injected DOM does not disrupt the template compiler
                    $timeout(function () {
                        elm.select2(opts);

                        /* customized */

                        if (footer) {
                            var content = '<hr style="margin:5px"><div><a class="btn btn-xs pull-right" ng-click="' + footerFn + '");">' + footer + '</button></div></span>';
                            content = angular.element('<div></div>').html(content).contents();
                            var compiled = $compile(content);
                            elm.select2('container').find("div.select2-drop").append(content);

                            compiled(scope);
                        }

                        var enterPressed = false;

                        var input = elm.select2('container').find("input.select2-input");

                        input.keyup(function (event) {
                            if (event.which == 13) {
                                enterPressed = true;
                            }
                        });

                        elm.on('select2-loaded', function (e) {
                            if (enterPressed && !opts.multiple) {
                                var result = convertToAngularModel(e.items.results[0]);
                                controller.$setViewValue(result);
                                elm.select2('val', result);

                                elm.trigger('change');
                                elm.select2('close');
                            }
                            enterPressed = false;
                        })
                        /* /customized */

                        // Set initial value - I'm not sure about this but it seems to need to be there
                        elm.select2('data', controller.$modelValue);
                        // important!
                        controller.$render();

                        // Not sure if I should just check for !isSelect OR if I should check for 'tags' key
                        if (!opts.initSelection && !isSelect) {
                            var isPristine = controller.$pristine;
                            controller.$setViewValue(
                              convertToAngularModel(elm.select2('data'))
                            );
                            if (isPristine) {
                                controller.$setPristine();
                            }
                            elm.prev().toggleClass('ng-pristine', controller.$pristine);
                        }
                    });
                };
            }
        };
    }]);























///**
//* Enhanced Select2 Dropmenus
//*
//* @AJAX Mode - When in this mode, your value will be an object (or array of objects) of the data used by Select2
//* This change is so that you do not have to do an additional query yourself on top of Select2's own query
//* @params [options] {object} The configuration options passed to $.fn.select2(). Refer to the documentation
//*/
//angular.module('ui.select2', []).value('uiSelect2Config', {}).directive('uiSelect2', ['uiSelect2Config', '$timeout', '$compile', function (uiSelect2Config, $timeout, $compile) {
//    var options = {};
//    if (uiSelect2Config) {
//        angular.extend(options, uiSelect2Config);
//    }
//    return {
//        require: 'ngModel',
//        priority: 1,
//        compile: function (tElm, tAttrs) {
//            var watch,
//              repeatOption,
//              repeatAttr,
//              isSelect = tElm.is('select'),
//              isMultiple = angular.isDefined(tAttrs.multiple),
//              footer = tAttrs.footer,
//              footerFn = tAttrs.footerfn;

//            // Enable watching of the options dataset if in use
//            if (tElm.is('select')) {
//                repeatOption = tElm.find('optgroup[ng-repeat], optgroup[data-ng-repeat], option[ng-repeat], option[data-ng-repeat]');

//                if (repeatOption.length) {
//                    repeatAttr = repeatOption.attr('ng-repeat') || repeatOption.attr('data-ng-repeat');
//                    watch = jQuery.trim(repeatAttr.split('|')[0]).split(' ').pop();
//                }
//            }

//            return function (scope, elm, attrs, controller) {
//                // instance-specific options
//                var opts = angular.extend({}, options, scope.$eval(attrs.uiSelect2));

//                /*
//        Convert from Select2 view-model to Angular view-model.
//        */
//                var convertToAngularModel = function (select2_data) {
//                    var model;
//                    if (opts.simple_tags) {
//                        model = [];
//                        angular.forEach(select2_data, function (value, index) {
//                            model.push(value.id);
//                        });
//                    } else {
//                        model = select2_data;
//                    }
//                    return model;
//                };

//                /*
//        Convert from Angular view-model to Select2 view-model.
//        */
//                var convertToSelect2Model = function (angular_data) {
//                    var model = [];
//                    if (!angular_data) {
//                        return model;
//                    }

//                    if (opts.simple_tags) {
//                        model = [];
//                        angular.forEach(
//                          angular_data,
//                          function (value, index) {
//                              model.push({ 'id': value, 'text': value });
//                          });
//                    } else {
//                        model = angular_data;
//                    }
//                    return model;
//                };

//                if (isSelect) {
//                    // Use <select multiple> instead
//                    delete opts.multiple;
//                    delete opts.initSelection;
//                } else if (isMultiple) {
//                    opts.multiple = true;
//                }

//                if (controller) {
//                    // Watch the model for programmatic changes
//                    scope.$watch(tAttrs.ngModel, function (current, old) {
//                        if (!current) {
//                            return;
//                        }
//                        if (current === old) {
//                            return;
//                        }
//                        controller.$render();
//                    }, true);
//                    controller.$render = function () {
//                        if (isSelect) {
//                            elm.select2('val', controller.$viewValue);
//                        } else {
//                            if (opts.multiple) {
//                                var viewValue = controller.$viewValue;
//                                if (angular.isString(viewValue)) {
//                                    viewValue = viewValue.split(',');
//                                }
//                                elm.select2(
//                                  'data', convertToSelect2Model(viewValue));
//                            } else {
//                                if (angular.isObject(controller.$viewValue)) {
//                                    elm.select2('data', controller.$viewValue);
//                                } else if (!controller.$viewValue) {
//                                    elm.select2('data', null);
//                                } else {
//                                    elm.select2('val', controller.$viewValue);
//                                }
//                            }
//                        }
//                    };

//                    // Watch the options dataset for changes
//                    if (watch) {
//                        scope.$watch(watch, function (newVal, oldVal, scope) {
//                            if (angular.equals(newVal, oldVal)) {
//                                return;
//                            }
//                            // Delayed so that the options have time to be rendered
//                            $timeout(function () {
//                                elm.select2('val', controller.$viewValue);
//                                // Refresh angular to remove the superfluous option
//                                elm.trigger('change');
//                                if (newVal && !oldVal && controller.$setPristine) {
//                                    controller.$setPristine(true);
//                                }
//                            });
//                        });
//                    }

//                    // Update valid and dirty statuses
//                    controller.$parsers.push(function (value) {
//                        var div = elm.prev();
//                        div
//                          .toggleClass('ng-invalid', !controller.$valid)
//                          .toggleClass('ng-valid', controller.$valid)
//                          .toggleClass('ng-invalid-required', !controller.$valid)
//                          .toggleClass('ng-valid-required', controller.$valid)
//                          .toggleClass('ng-dirty', controller.$dirty)
//                          .toggleClass('ng-pristine', controller.$pristine);
//                        return value;
//                    });

//                    if (!isSelect) {
//                        // Set the view and model value and update the angular template manually for the ajax/multiple select2.
//                        elm.bind("change", function (e) {
//                            e.stopImmediatePropagation();

//                            if (scope.$$phase || scope.$root.$$phase) {
//                                return;
//                            }
//                            scope.$apply(function () {
//                                controller.$setViewValue(
//                                  convertToAngularModel(elm.select2('val')));
//                            });
//                        });

//                        if (opts.initSelection) {
//                            var initSelection = opts.initSelection;
//                            opts.initSelection = function (element, callback) {
//                                initSelection(element, function (value) {
//                                    var isPristine = controller.$pristine;
//                                    controller.$setViewValue(convertToAngularModel(elm.select2('val')));
//                                    //controller.$setViewValue(convertToAngularModel(value));
//                                    callback(value);
//                                    if (isPristine) {
//                                        controller.$setPristine();
//                                    }
//                                    elm.prev().toggleClass('ng-pristine', controller.$pristine);
//                                });
//                            };
//                        }
//                    }
//                }

//                elm.bind("$destroy", function () {
//                    elm.select2("destroy");
//                });

//                attrs.$observe('disabled', function (value) {
//                    elm.select2('enable', !value);
//                });

//                attrs.$observe('readonly', function (value) {
//                    elm.select2('readonly', !!value);
//                });

//                if (attrs.ngMultiple) {
//                    scope.$watch(attrs.ngMultiple, function (newVal) {
//                        attrs.$set('multiple', !!newVal);
//                        elm.select2(opts);
//                    });
//                }

//                // Initialize the plugin late so that the injected DOM does not disrupt the template compiler
//                $timeout(function () {
//                    elm.select2(opts);
//                    if (footer) {
//                        var content = '<hr style="margin:5px"><div><a class="btn btn-xs pull-right" ng-click="' + footerFn + '");">' + footer + '</button></div></span>';
//                        content = angular.element('<div></div>').html(content).contents();
//                        var compiled = $compile(content);
//                        elm.select2('container').find("div.select2-drop").append(content);

//                        compiled(scope);
//                    }

//                    /* customized */
//                    var enterPressed = false;

//                    var input = elm.select2('container').find("input.select2-input");

//                    input.keyup(function (event) {
//                        if (event.which == 13) {
//                            enterPressed = true;
//                        }
//                    });

//                    elm.on('select2-loaded', function (e) {
//                        if (enterPressed && !opts.multiple) {
//                            var result = convertToAngularModel(e.items.results[0]);
//                            controller.$setViewValue(result);
//                            elm.select2('val', result);

//                            elm.trigger('change');
//                            elm.select2('close');
//                        }
//                        enterPressed = false;
//                    })
//                    /* /customized */

//                    // Set initial value - I'm not sure about this but it seems to need to be there
//                    elm.select2('data', controller.$modelValue);
//                    // important!
//                    controller.$render();

//                    // Not sure if I should just check for !isSelect OR if I should check for 'tags' key
//                    if (!opts.initSelection && !isSelect) {
//                        var isPristine = controller.$pristine;
//                        controller.$setViewValue(
//                          convertToAngularModel(elm.select2('data'))
//                        );
//                        if (isPristine) {
//                            controller.$setPristine();
//                        }
//                        elm.prev().toggleClass('ng-pristine', controller.$pristine);
//                    }
//                });
//            };
//        }
//    };
//}]);




















/**
* Enhanced Select2 Dropmenus
*
* @AJAX Mode - When in this mode, your value will be an object (or array of objects) of the data used by Select2
* This change is so that you do not have to do an additional query yourself on top of Select2's own query
* @params [options] {object} The configuration options passed to $.fn.select2(). Refer to the documentation
*/
//angular.module('ui.select2', []).value('uiSelect2Config', {}).directive('uiSelect2', ['uiSelect2Config', '$timeout', function (uiSelect2Config, $timeout) {
//    var options = {};
//    if (uiSelect2Config) {
//        angular.extend(options, uiSelect2Config);
//    }
//    return {
//        require: 'ngModel',
//        priority: 1,
//        compile: function (tElm, tAttrs) {
//            var watch,
//              repeatOption,
//              repeatAttr,
//              isSelect = tElm.is('select'),
//              isMultiple = angular.isDefined(tAttrs.multiple);

//            // Enable watching of the options dataset if in use
//            if (tElm.is('select')) {
//                repeatOption = tElm.find('optgroup[ng-repeat], optgroup[data-ng-repeat], option[ng-repeat], option[data-ng-repeat]');

//                if (repeatOption.length) {
//                    repeatAttr = repeatOption.attr('ng-repeat') || repeatOption.attr('data-ng-repeat');
//                    watch = jQuery.trim(repeatAttr.split('|')[0]).split(' ').pop();
//                }
//            }

//            return function (scope, elm, attrs, controller) {
//                // instance-specific options
//                var opts = angular.extend({}, options, scope.$eval(attrs.uiSelect2));

//                /*
//        Convert from Select2 view-model to Angular view-model.
//        */
//                var convertToAngularModel = function (select2_data) {
//                    var model;
//                    if (opts.simple_tags) {
//                        model = [];
//                        angular.forEach(select2_data, function (value, index) {
//                            model.push(value.id);
//                        });
//                    } else {
//                        model = select2_data;
//                    }
//                    return model;
//                };

//                /*
//        Convert from Angular view-model to Select2 view-model.
//        */
//                var convertToSelect2Model = function (angular_data) {
//                    var model = [];
//                    if (!angular_data) {
//                        return model;
//                    }

//                    if (opts.simple_tags) {
//                        model = [];
//                        angular.forEach(
//                          angular_data,
//                          function (value, index) {
//                              model.push({ 'id': value, 'text': value });
//                          });
//                    } else {
//                        model = angular_data;
//                    }
//                    return model;
//                };

//                if (isSelect) {
//                    // Use <select multiple> instead
//                    delete opts.multiple;
//                    delete opts.initSelection;
//                } else if (isMultiple) {
//                    opts.multiple = true;
//                }

//                if (controller) {
//                    // Watch the model for programmatic changes
//                    scope.$watch(tAttrs.ngModel, function (current, old) {
//                        if (!current) {
//                            return;
//                        }
//                        if (current === old) {
//                            return;
//                        }
//                        controller.$render();
//                    }, true);
//                    controller.$render = function () {
//                        if (isSelect) {
//                            elm.select2('val', controller.$viewValue);
//                        } else {
//                            if (opts.multiple) {
//                                var viewValue = controller.$viewValue;
//                                if (angular.isString(viewValue)) {
//                                    viewValue = viewValue.split(',');
//                                }
//                                elm.select2(
//                                  'data', convertToSelect2Model(viewValue));
//                            } else {
//                                if (angular.isObject(controller.$viewValue)) {
//                                    elm.select2('data', controller.$viewValue);
//                                } else if (!controller.$viewValue) {
//                                    elm.select2('data', null);
//                                } else {
//                                    elm.select2('val', controller.$viewValue);
//                                }
//                            }
//                        }
//                    };

//                    // Watch the options dataset for changes
//                    if (watch) {
//                        scope.$watch(watch, function (newVal, oldVal, scope) {
//                            if (angular.equals(newVal, oldVal)) {
//                                return;
//                            }
//                            // Delayed so that the options have time to be rendered
//                            $timeout(function () {
//                                elm.select2('val', controller.$viewValue);
//                                // Refresh angular to remove the superfluous option
//                                elm.trigger('change');
//                                if (newVal && !oldVal && controller.$setPristine) {
//                                    controller.$setPristine(true);
//                                }
//                            });
//                        });
//                    }

//                    // Update valid and dirty statuses
//                    controller.$parsers.push(function (value) {
//                        var div = elm.prev();
//                        div
//                          .toggleClass('ng-invalid', !controller.$valid)
//                          .toggleClass('ng-valid', controller.$valid)
//                          .toggleClass('ng-invalid-required', !controller.$valid)
//                          .toggleClass('ng-valid-required', controller.$valid)
//                          .toggleClass('ng-dirty', controller.$dirty)
//                          .toggleClass('ng-pristine', controller.$pristine);
//                        return value;
//                    });

//                    if (!isSelect) {
//                        // Set the view and model value and update the angular template manually for the ajax/multiple select2.
//                        elm.bind("change", function (e) {
//                            e.stopImmediatePropagation();

//                            if (scope.$$phase || scope.$root.$$phase) {
//                                return;
//                            }
//                            scope.$apply(function () {
//                                controller.$setViewValue(
//                                  convertToAngularModel(elm.select2('data')));
//                            });
//                        });

//                        if (opts.initSelection) {
//                            var initSelection = opts.initSelection;
//                            opts.initSelection = function (element, callback) {
//                                initSelection(element, function (value) {
//                                    var isPristine = controller.$pristine;
//                                    controller.$setViewValue(convertToAngularModel(value));
//                                    callback(value);
//                                    if (isPristine) {
//                                        controller.$setPristine();
//                                    }
//                                    elm.prev().toggleClass('ng-pristine', controller.$pristine);
//                                });
//                            };
//                        }
//                    }
//                }

//                elm.bind("$destroy", function () {
//                    elm.select2("destroy");
//                });

//                attrs.$observe('disabled', function (value) {
//                    elm.select2('enable', !value);
//                });

//                attrs.$observe('readonly', function (value) {
//                    elm.select2('readonly', !!value);
//                });

//                if (attrs.ngMultiple) {
//                    scope.$watch(attrs.ngMultiple, function (newVal) {
//                        attrs.$set('multiple', !!newVal);
//                        elm.select2(opts);
//                    });
//                }

//                // Initialize the plugin late so that the injected DOM does not disrupt the template compiler
//                $timeout(function () {
//                    elm.select2(opts);

//                    /* customized */
//                    var enterPressed = false;

//                    var input = elm.select2('container').find("input.select2-input");

//                    input.keyup(function (event) {
//                        if (event.which == 13) {
//                            enterPressed = true;
//                        }
//                    });

//                    elm.on('select2-loaded', function (e) {
//                        if (enterPressed && !isMultiple) {
//                            var result = convertToAngularModel(e.items.results[0]);
//                            controller.$setViewValue(result);
//                            elm.select2('val', result);

//                            elm.trigger('change');
//                            elm.select2('close');
//                        }
//                        enterPressed = false;
//                    })
//                    /* /customized */

//                    // Set initial value - I'm not sure about this but it seems to need to be there
//                    elm.select2('data', controller.$modelValue);
//                    // important!
//                    controller.$render();

//                    // Not sure if I should just check for !isSelect OR if I should check for 'tags' key
//                    if (!opts.initSelection && !isSelect) {
//                        var isPristine = controller.$pristine;
//                        controller.$setViewValue(
//                          convertToAngularModel(elm.select2('data'))
//                        );
//                        if (isPristine) {
//                            controller.$setPristine();
//                        }
//                        elm.prev().toggleClass('ng-pristine', controller.$pristine);
//                    }
//                });
//            };
//        }
//    };
//}]);