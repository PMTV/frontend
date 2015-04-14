var ORD = angular.module('ORD', []);

ORD.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/quotations', { templateUrl: 'ORD/quotations/quotation.html' })
        .when('/quotations/new', { templateUrl: 'ORD/quotations/quotationEdit/quotationEdit.html', controller: 'QuotationEditCtrl' })
        .when('/quotations/:id', { templateUrl: 'ORD/quotations/quotationEdit/quotationEdit.html', controller: 'QuotationEditCtrl' });
}]);

// FACTORY
ORD.factory('quotationService', function ($http, $emerge) {
    return {
        getAllStatus: function () {
            var status = [
                { name: 'New', value: 1 },
                { name: 'In Progress', value: 2 },
                { name: 'Pending Approval', value: 3 },
                { name: 'Confirmed', value: 4 },
                { name: 'Delivered', value: 6 },
                { name: 'Completed', value: 7 }
            ];
            return status;
        },
        getStatus: function (statusId, isApproved) {
            var status = _.find(this.getAllStatus(), function (e) { return e.value == statusId });

            if (status) {
                // If "Pending Approval" AND "IsApproved"
                if (status.value == 3 && isApproved) {
                    return "Approved";
                }

                return status.name;
            }

            return;
        },
        query: function (q, step, page, sort, asc, options) {
            var params = {
                q: q,
                step: step,
                page: page,
                sortName: sort,
                sortDirection: asc
            }

            return $emerge.query("quotations", params, options);
        },
        get: function (quotationId) {

            return $emerge.get("quotations", quotationId);
        },
        add: function (quotation) {
            // Exclude properties to update
            quotation.customer = null;
            angular.forEach(quotation.quotationDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
            });

            return $emerge.add("quotations", quotation);
        },
        put: function (quotationId, quotation) {
            // Exclude properties to update
            quotation.customer = null;
            quotation.userCreated = null;
            angular.forEach(quotation.quotationDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
            });

            return $emerge.update("quotations", quotationId, quotation);
        },
        update: function (quotationId, quotation) {
            return this.put(quotationId, quotation);
        },
        updateStatus: function (quotationId, statusId) {
            return $emerge.update("quotations", quotationId + "/status?statusId=" + statusId);
        },
        patch: function (quotationId, quotation) {
            return $emerge.patch("quotations", quotationId, quotation);
        },
        delete: function (quotationId) {
            return $emerge.delete("quotations", quotationId);
        },
        deleteItem: function (quotationId, quotationDetailsId) {
            return $emerge.delete("quotations", quotationId + "/Item?quotationDetailsId=" + quotationDetailsId);
        },
        convertToSO: function (quotationId, quotation) {
            return $emerge.update("quotations", quotationId + "/Convert", quotation);
        },
        approve: function (quotationId) {
            return $emerge.update("quotations", quotationId + "/Approve");
        },
        sendApproval: function (quotationId) {
            return $emerge.update("quotations", quotationId + "/SendApproval");
        },
        duplicate: function (quotationId) {
            return $emerge.update("quotations", quotationId + "/Duplicate");
        },
        getUrl: function () {
            return $emerge.getUrl("quotations");
        },
        getPDF: function (quotationId) {
            return $emerge.get("quotations", quotationId + "/pdf", { responseType: 'arraybuffer', tracker: 'null' });
        },
        emailPDF: function (quotationId, email) {
            return $emerge.post("quotations/" + quotationId + "/email", email);
        }
    };
});

ORD.filter('quotationStatus', function (quotationService) {
    return function (input, isApproved) {
        return quotationService.getStatus(input, isApproved);
    }
});