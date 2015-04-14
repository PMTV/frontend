// CONTROLLERS

// Sales Order List Controller
ORD.controller('PackingListListCtrl', function ($scope, $http, packingListService, errorDisplay) {

    $scope.packingListTableData = null;

    $scope.loadPackingList = function () {
        packingListService.query().success(function (data) {
            $scope.packingListTableData = data;
        })
    }

    $scope.deletePackingList = function (id) {
        packingListService.delete(id)
            .success(function (data) {
                $scope.loadPackingList();
            })
            .error(function (error) {
                errorDisplay.show(error);
            })
    };

    $scope.loadPackingList();
});

// Sales Order Edit Controller
ORD.controller('PackingListEditCtrl', function ($scope, $http, $route, $routeParams, $location, $filter, $translate, errorDisplay, packingListService, customerService, productService, $modal)
{
    var packingListId = $routeParams.id;
    $scope.packingList = {};
    $scope.packingList.salesOrderId = "";
    // $scope.packingList.tags = "";
    $scope.salesOrder = [];
    $scope.customer = null;
    $scope.newPackingListItem = {};

    $scope.busy = true;
    $scope.customerHidden = false;

    $scope.sortableOptionsList = [createOptions('A'), createOptions('B')];

    var origArr = [];
    

    function createOptions (listName) {
        var _listName = listName;
        var options = {
          placeholder: "app",
          connectWith: ".apps-container",
          update: function(e, ui) {
            // console.log(origArr.slice());
              // if ($(e.target).hasClass('first') &&
              //     e.target != ui.item.sortable.droptarget[0]) {
                    // clone the original model to restore the removed item
                    // console.log("orig2 "+ angular.toJson(origArr));
                    if (listName != "A")
                    $scope.salesOrderArr = angular.copy(origArr);
                    
                    // console.log($scope.salesOrderArr);
              // }
          },
          // stop: function(e, ui) {
           
          //   $scope.salesOrderArr = angular.copy(origArr);
          //   console.log($scope.salesOrderArr);
          //     console.log("list " + _listName + ": stop");
          // }
        };
        return options;
    }

   
    $scope.packingList.packingSectionList = [{packingSectionDetailsList:[]}];

 
    console.log($scope.packingList.packingSectionList);
    

    $scope.addPackingSection = function()
    {
        var item = {};
        item.packingSectionDetailsList = [];
        $scope.packingList.packingSectionList.push(item);
    }

    $scope.removeItem = function(parentIndex, index ,item)
    {
        $scope.packingList.packingSectionList[parentIndex].packingSectionDetailsList.splice(index, 1);
        $scope.salesOrderArr.push(item);
    }
  
    if (packingListId) {
        // Load Sales with salesId
        packingListService.get(packingListId).success(function (data) {
            // copy the result into scope model
            angular.copy(data, $scope.packingList);
            $scope.packingList.salesOrder = data.salesOrderId;

            $scope.customer = data.customer;
            $scope.busy = false;
        });
    } else {

        // $scope.packingList.packingSectionList = [];
        $scope.busy = false;
    }

    $scope.$watch('packingList.packingSectionList', function(newValue, oldValue){
        
        // console.log($scope.packingList.packingSectionList);
        // console.log($scope.salesOrderArr);
        $scope.salesOrderArr = angular.copy(origArr);

        if (angular.equals(newValue, oldValue)){
            return;
        }
        // console.log(newValue);
        // console.log(oldValue);

        angular.forEach(newValue, function(v,k){

            angular.forEach(v.packingSectionDetailsList, function(va, ka){
                // alert("222");
                // var currentObj = angular.copy(va);
                if (va.salesOrderId){
                    //va = v.packingSection.splice(ka,1);
                        //va.qty = va.qtyToTake;
                    //v.packingSection.push(va);
                }

                _.filter($scope.salesOrderArr, function(e){
                    // alert("asdasd");
                    // console.log(e.salesOrderDetailsId + " " + currentObj.salesOrderDetailsId);
                    if (e.salesOrderDetailsId == va.salesOrderDetailsId) { 
                        console.log(va.productQty);
                        e.productQty -= va.productQty;
                        // console.log("orig "+angular.toJson(origArr));
                        // remaining = total - qtyMinus;
                        //$scope.remaining = remaining;
                        // e.qty =  va.qtyToTake;
                        // e.qty -= va.qty;
                        // console.log("asd");
                        // e.qty - packingSectionDetail.qty 
                    } 
                })
                // _.filter($scope.salesOrderArr, function(e){
                //     if (e.salesOrderDetailsId == va.salesOrderDetailsId) { 
                //         console.log("asd");
                //         // e.qty - packingSectionDetail.qty 
                //     } 
                // );
            });
        });

    }, true);

    $scope.previewPDF = function()
    {
        var dialog = $modal.open({
            backdrop: true,
            windowClass: 'xx-dialog',
            keyboard: true,
            templateUrl: 'ORD/Deliveries/PackingLists/PackingListEdit/packingListPrint.html',
            controller: function ($scope, $log, $modalInstance, productService, $filter,packingList) {

                $scope.packingList = packingList;

                $scope.save = function () {
                        $modalInstance.close();
                };

                $scope.ok = function () {
                   $modalInstance.close();
                }

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };


            },
            resolve: {
               packingList: function () {
                   return $scope.packingList;
               }

            }
        });
    }
    

    // process the form
    $scope.savePackingList = function () {
        $scope.busy = true;
        // set scope variable submitted to true to force validation
        $scope.submitted = true;

        var newPackingList = {};
        angular.copy($scope.packingList, newPackingList);

        angular.forEach(newPackingList.packingSectionList, function(v,k){
            angular.forEach(v.packingSectionDetailsList, function(va, ka){
                va.product = null;
            });
        });
        // check if the form is valid
         if (!$scope.myForm.$valid) {
             $scope.busy = false;
             alert($translate.instant('ALERT.FORM_ERROR'));
             return false;
         }

        // if salesId not empty update, else add
        if (packingListId) {
            console.log(newPackingList);
            packingListService.update(packingListId, newPackingList)
                .success(function (data) {
                    alert($translate.instant('ALERT.UPDATED'));
                    $route.reload();
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });
        } else {
            packingListService.add(newPackingList)
                .success(function (data) {
                    alert($translate.instant('ALERT.CREATED'));
                    $location.url('packingList/' + data.packingListId);
                })
                .error(function (error) {
                    errorDisplay.show(error);
                })
                .finally(function () {
                    $scope.busy = false;
                });;
        }
    };

    // Hide the supplier side bar
    $scope.hideSupplier = function () {
        $scope.supplierHidden = true;
    }
   
    $scope.onChangedSalesOrder = function(salesOrder)
    {   
        // console.log(salesOrder);
        salesOrder = angular.fromJson(salesOrder);
        // $scope.salesOrderArr = salesOrder.salesOrderDetailsList;
        origArr = salesOrder.salesOrderDetailsList;
        $scope.packingList.salesOrderId = salesOrder.salesOrderId;
        $scope.salesOrderArr = angular.copy(origArr);
        // console.log(origArr);
        // console.log($scope.salesOrderArr);
        $scope.packingList.salesOrderId = salesOrder.salesOrderId;
        // packingListService.getbySOID(salesOrder.salesOrderId).success(function (data) {
        //     // copy the result into scope model
        //     angular.copy(data.packingSectionList, $scope.packingList.packingSectionList);

        //     $scope.customer = data.customer;
        //     $scope.busy = false;
        // });
    }
});
