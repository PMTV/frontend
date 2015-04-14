ORD.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/deliveries', { templateUrl: 'ORD/Deliveries/DeliveryOrders/delivery.html' })
        .when('/deliveries/new', { templateUrl: 'ORD/Deliveries/DeliveryOrders/DeliveryEdit/deliveryEdit.html', controller: 'DeliveryEditCtrl' })
        .when('/deliveries/:id', { templateUrl: 'ORD/Deliveries/DeliveryOrders/DeliveryEdit/DeliveryEdit.html', controller: 'DeliveryEditCtrl' })
        .when('/deliveries/:id/preview', { templateUrl: 'ORD/Deliveries/DeliveryOrders/DeliveryEdit/DeliveryPrint.html', controller: 'DeliveryEditCtrl' });
}]);

// FACTORY
ORD.factory('deliveryService', function ($http, $emerge) {

    return {
        getAllStatus: function () {
            var status = [
                { name: 'New', value: 1 },
                { name: 'In Progress', value: 2 },
                //{ name: 'Pending Approval', value: 3 },
                { name: 'Delivered', value: 4 },
                { name: 'Completed', value: 5 }
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
        query: function () {
            return $emerge.query("deliveryorders");
        },
        get: function (deliveryId) {
            return $emerge.get("deliveryorders", deliveryId);
        },
        add: function (delivery) {
            // Exclude properties to update
            delivery.customer = null;
            angular.forEach(delivery.deliveryOrderDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
            });

            return $emerge.add("deliveryorders", delivery);
        },
        put: function (deliveryId, delivery) {
            // Exclude properties to update
            delivery.customer = null;
            delivery.warehouse = null;
            angular.forEach(delivery.deliveryOrderDetailsList, function (key, value) {
                key.product = null;
                key.productUOM = null;
                key.productUOMId = key.productUOMId || null;
                key.salesOrderDetails = null;
            });

            return $emerge.update("deliveryorders", deliveryId, delivery);
        },
        update: function (deliveryId, delivery) {
            return this.put(deliveryId, delivery);
        },
        updateStatus: function (deliveryId, statusId) {
            return $emerge.update("deliveryorders", deliveryId + "/status?statusId=" + statusId);
        },
        patch: function (deliveryId, delivery) {
            return $emerge.patch("deliveryorders", deliveryId, delivery);
        },
        delete: function (deliveryId) {
            return $emerge.delete("deliveryorders", deliveryId);
        },
        // deleteItem: function (deliveryId, QuotationDetailsId) {
        //     return $emerge.delete("deliveryorders", quotationId + '/Item?QuotationDetailsId=' + QuotationDetailsId);
        // },
        getUrl: function () {
            return $emerge.getUrl("deliveryorders");
        },
        getPDF: function (deliveryId) {
            return $emerge.get("deliveryorders", deliveryId + "/pdf", { responseType: 'arraybuffer', tracker: 'null' });
        },
        emailPDF: function (deliveryId, email) {
            return $emerge.post("deliveryorders/" + quotationId + "/email", email);
        }
    };
});

ORD.filter('deliveryStatus', function (deliveryService) {
    return function (input) {
        return deliveryService.getStatus(input);
    }
});