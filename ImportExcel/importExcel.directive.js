EmergeApp.directive('customfieldDropdown', function ($modal, $log, importExcelService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            loadname : '='
        },
		template: '' +
            '<select ui-select2 class="ui-select2" >' + // footer="Add" footerfn="addReturnReason()">' +
                '<option value="">Loading Custom Field</option>' +
                '<option ng-repeat="c in customFieldArr" value="{{c}}">{{c}}</option>' +
            '</select>',
		link: function (scope, element, attrs) {
		    scope.customFieldArr = [];

		    importExcelService.getCustomColumn(scope.loadname).then(function (data) {
		        // Once ajax loaded, change first option text to "Please Select"
				element[0].options[0].text = 'Please Select';
				//console.log(data);
				scope.customFieldArr = (data.data);
			});

		}
	};
});