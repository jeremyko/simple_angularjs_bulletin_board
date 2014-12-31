/**
 * Created by kojunghyun on 14. 12. 31..
 */
var myControllerModule = angular.module('viewModule', ['ngRoute','myServiceModule']);

myControllerModule.controller('viewCtrl', ['$scope', '$routeParams','$location','myGlobalDataService','myHttpService',
    function($scope, $routeParams,$location, myGlobalDataService, myHttpService) {

        $scope.currentPage = myGlobalDataService.pageInfo.currentPage;

        myHttpService.view($routeParams.msgObjId)
            .success(function(data) {
                $scope.msgObjId = $routeParams.msgObjId;
                $scope.userMsg = data;

                myGlobalDataService.already_fetched_data=data; //for editing
            });

        //delete
        $scope.deleteMsg = function (){
            myHttpService.delete($routeParams.msgObjId)
                .success(function() {
                    //TODO : 마지막 페이지의 마지막 게시물 삭제시, last 페이지 변경(-1)
                    $location.path( "/list/"+$scope.currentPage );
                })
                .error (function () {
                console.log('deleteMsg Error'); //debug
                $location.path( "/list/1" );
            });
        };

        //edit
        $scope.editMsg = function (){
            $location.path( "/edit/"+ $routeParams.msgObjId );
        };
    }]);