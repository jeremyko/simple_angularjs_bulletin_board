/**
 * Created by kojunghyun on 14. 11. 30..
 */

'use strict';

var myControllerModule = angular.module('myControllerModule', ['ngRoute','myServiceModule']);

var nIndexStart;
var i;
var activatePageIndex;
var pageIndex;
var nextFirstPageIndex;
//-----------------------------------------------------------------------------
//controller : get paged data
myControllerModule.controller('FetchCtrl',
    ['$rootScope','$scope','$location','$routeParams','myHttpService','myGlobalDataService',
    function($rootScope,$scope, $location, $routeParams, myHttpService,myGlobalDataService) {
        myGlobalDataService.pageInfo.listPerPage = 5; //TODO : from option
        myGlobalDataService.pageInfo.currentPage = $routeParams.page;

        //--------------------------------------------------------------------
        //공통사용되는 함수를 $rootScope 에 정의...
        $rootScope.GoToUrl = function ( url ) {
            $location.path( url );
        };
        $rootScope.GoToPage = function ( page ) {
            $location.path( '/list/'+ page );
        };

        //--------------------------------------------------------------------
        //각 페이지에 표시될 게시물 순번을 생성한다.
        nIndexStart = ((myGlobalDataService.pageInfo.currentPage-1) * myGlobalDataService.pageInfo.listPerPage)+1 ;
        //console.log( "nIndexStart ="+nIndexStart ); //debug
        $scope.listIndexAry=[];
        for (i = 0; i < myGlobalDataService.pageInfo.listPerPage; i++) {
            $scope.listIndexAry.push ( nIndexStart+i );
            //console.log( "push :"+(nIndexStart+i) ); //debug
        }

        //--------------------------------------------------------------------
        myHttpService.getPagedList($routeParams.page, myGlobalDataService.pageInfo.listPerPage).success(function(data) {
            $scope.guestMsgs = data;
        });
    }]);

//-----------------------------------------------------------------------------
//controller : view data
myControllerModule.controller('ViewCtrl', ['$scope', '$routeParams','$location','myGlobalDataService','myHttpService',
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

//-----------------------------------------------------------------------------
//controller : write data
myControllerModule.controller('WriteCtrl', ['$scope', '$location','myGlobalDataService','myHttpService',
    function($scope,$location, myGlobalDataService,myHttpService) {

        $scope.currentPage = myGlobalDataService.pageInfo.currentPage;
        $scope.formData = {};
        $scope.CreateGuestMsg = function() {
            if ($scope.formData.user != undefined && $scope.formData.title != undefined && $scope.formData.contents != undefined) {
                myHttpService.create($scope.formData)
                .success(function() {
                    $scope.formData = {}; //reset
                    $location.path( "/list/1" );
                })
                .error (function () {
                    console.log('create Error'); //debug
                });
            }
        };
    }]);

//-----------------------------------------------------------------------------
//controller : edit data
myControllerModule.controller('EditCtrl', ['$scope','$location','myGlobalDataService','myHttpService',
    function($scope,$location,myGlobalDataService,myHttpService) {
        $scope.currentPage = myGlobalDataService.pageInfo.currentPage;
        $scope.formData = myGlobalDataService.already_fetched_data;

        $scope.UpdateGuestMsg = function() {
            if ($scope.formData.contents.length > 0) {
                console.log("contents valid");
                myHttpService.update($scope.formData)
                    .success(function() {
                        $scope.formData = {}; //reset
                        $location.path( "/list/"+$scope.currentPage );
                    })
                    .error (function () {
                        console.log('update Error'); //debug
                    });
            }else{
                console.log("contents invalid!!");
                //TODO
            }
        };
    }]);



