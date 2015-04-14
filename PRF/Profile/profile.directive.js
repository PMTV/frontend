PRF.directive('profileUpload', function () {
    return {
        restrict: 'EA',
        scope: true,
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var files = event.target.files;
                scope.profile.files = files[0];

                var oFReader = new FileReader();
                oFReader.readAsDataURL(files[0]);

                oFReader.onload = function (oFREvent) {
                    document.getElementById("imageUser").src = oFREvent.target.result;
                };

                for (var i = 0;i<files.length;i++) {
                    scope.$emit("fileSelected", { file: files[i] });
                }
            });
        }
    };
});