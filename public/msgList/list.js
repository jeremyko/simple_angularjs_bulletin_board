/**
 * Created by kojunghyun on 14. 12. 31..
 */
'use strict';

var myControllerModule = angular.module('listModule', ['ngRoute','myServiceModule']);

//-----------------------------------------------------------------------------
//controller : get paged data
myControllerModule.controller('listCtrl',
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
            var nIndexStart = ((myGlobalDataService.pageInfo.currentPage-1) * myGlobalDataService.pageInfo.listPerPage)+1 ;
            //console.log( "nIndexStart ="+nIndexStart ); //debug
            $scope.listIndexAry=[];
            var i;
            for (i = 0; i < myGlobalDataService.pageInfo.listPerPage; i++) {
                $scope.listIndexAry.push ( nIndexStart+i );
                //console.log( "push :"+(nIndexStart+i) ); //debug
            }

            //--------------------------------------------------------------------
            myHttpService.getPagedList($routeParams.page, myGlobalDataService.pageInfo.listPerPage).success(function(data) {
                $scope.guestMsgs = data;
            });

            $scope.currentPage = 1;
            $scope.pageChanged = function() {
                console.log("pageChanged !!!");
            };

        }]);
