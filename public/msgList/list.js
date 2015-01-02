/**
 * Created by kojunghyun on 14. 12. 31..
 */
'use strict';

var myControllerModule = angular.module('listModule', ['ui.bootstrap','ngRoute','myServiceModule']);

//-----------------------------------------------------------------------------
//controller : get paged data
myControllerModule.controller('listCtrl',
    ['$rootScope','$scope','$http','$location','myHttpService','myGlobalDataService',
        function($rootScope,$scope,$http, $location, myHttpService,myGlobalDataService) {

            myGlobalDataService.pageInfo.listPerPage = 5;

            $scope.listPerPage = myGlobalDataService.pageInfo.listPerPage ; //TEST

            //console.log("listCtrl init!!");//debug
            //--------------------------------------------------------------------
            //공통사용되는 함수를 $rootScope 에 정의...
            $rootScope.GoToPage = function () {
                $location.path( '/list' );
            };

            $rootScope.GoToUrl = function (url) {
                $location.path( url );
            };

            //$scope.listIndexAry=myGlobalDataService.pageInfo.listIndexAry;

            //console.log( "listCtrl  :myHttpService.getPagedList!!" ); //debug
            myHttpService.getPagedList(myGlobalDataService.pageInfo.currentPage, myGlobalDataService.pageInfo.listPerPage);
            $scope.guestMsgs = myGlobalDataService.msgDatas;

            //$scope.testStr = "listCtrl!!!"; //test

            $scope.oneAtATime = true;
            //delete TODO


            //------------------------------------------------------------
            $scope.editMsg = function (msgObjId) {
                console.log("delete : id->", msgObjId); //debug
            };

            //------------------------------------------------------------
            $scope.deleteMsg = function (msgObjId){
                console.log("delete : id->", msgObjId); //debug

                var pageInfo = myGlobalDataService.pageInfo;

                var thisIsLastPageAndMsgCnt=0;
                if(pageInfo.currentPage == pageInfo.totalPages ){
                    //console.log('myGlobalDataService.pageInfo.totalMsgCnt=',myGlobalDataService.pageInfo.totalMsgCnt); //debug
                    //console.log('myGlobalDataService.pageInfo.listPerPage=',myGlobalDataService.pageInfo.listPerPage); //debug
                    //마지막 페이지의 메시지갯수가 1개였을때 이메시지를 삭제하는 경우, 이전 페이지로 전환이 필요함!!
                    thisIsLastPageAndMsgCnt = pageInfo.totalMsgCnt % pageInfo.listPerPage;
                    if(thisIsLastPageAndMsgCnt==0){
                        thisIsLastPageAndMsgCnt = pageInfo.listPerPage;
                    }
                    console.log('thisIsLastPageAndMsgCnt=',thisIsLastPageAndMsgCnt); //debug
                }

                myHttpService.delete(msgObjId)
                    .success(function() {
                        //마지막 페이지의 마지막 게시물 삭제시, last 페이지 변경(-1)
                        if(thisIsLastPageAndMsgCnt ==1){
                            pageInfo.currentPage -=1;
                            console.log('decrease page !!',pageInfo.currentPage); //debug
                        }

                        $http.get('apis/countAll')
                            .success(function(totalCount) {
                                var i = 0;

                                console.log( "deleteMsg--> get totalCount: " + totalCount ); //debug
                                pageInfo.totalMsgCnt = totalCount; //save to service
                                pageInfo.totalPages = Math.ceil(pageInfo.totalMsgCnt / pageInfo.listPerPage);
                                pageInfo.totalPageSets = Math.ceil(pageInfo.totalPages / pageInfo.maxVisiblePages);

                                myHttpService.getPagedList(pageInfo.currentPage, pageInfo.listPerPage);

                                //TODO : change pagination!!!!
                                //$location.path( "/list" );
                            });

                    })
                    .error (function () {
                        console.log('deleteMsg Error'); //debug
                        //$location.path( "/list" );
                    });
            };
        }]);
