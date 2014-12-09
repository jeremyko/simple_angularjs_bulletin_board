/**
 * Created by kojunghyun on 14. 11. 30..
 */

'use strict';

var myControllerModule = angular.module('myControllerModule', ['ngRoute','myServiceModule']);

//-----------------------------------------------------------------------------
//controller : get paged data
myControllerModule.controller('FetchCtrl',
    ['$rootScope','$scope', '$http','$location','$routeParams','myHttpService','myGlobalDataService',
    function($rootScope,$scope, $http, $location, $routeParams, myHttpService,myGlobalDataService) {
        //--------------------------------------------------------------------
        //$scope.GoToUrl중복을 막기 위해 $rootScope 에 저장. 목록조회가 초기화면이므로...
        $rootScope.GoToUrl = function ( url ) {
            $location.path( url );
        };

        $rootScope.GoToPage = function ( page ) {
            $location.path( '/list/'+ page );
        };
        //--------------------------------------------------------------------

        myGlobalDataService.pageInfo.listPerPage = 3; //TODO : from option
        myGlobalDataService.pageInfo.currentPage = $routeParams.page;

        myHttpService.getPagedList($routeParams.page, myGlobalDataService.pageInfo.listPerPage).success(function(data) {
            $scope.guestMsgs = data;
        });

        //$scope.testInFetchCtrl = "100"; //--> pagination directive에서도 접근 가능하다.(부모 scope접근)
    }]);

//-----------------------------------------------------------------------------
//controller : view data
myControllerModule.controller('ViewCtrl', ['$scope', '$routeParams','$location','myGlobalDataService','myHttpService',
    function($scope, $routeParams,$location, myGlobalDataService, myHttpService) {

        $scope.currentPage = myGlobalDataService.pageInfo.currentPage;

        //msgObjId --> angularjs routing에 설정된 문자열과 동일해야함.
        myHttpService.view($routeParams.msgObjId)
            .success(function(data) {
            console.log("#ViewDataCtrl data:"+data); //debug
            $scope.msgObjId = $routeParams.msgObjId;
            $scope.userMsg = data;

            myGlobalDataService.already_fetched_data=data; //데이터 공유 위해 설정
        });

        //delete
        $scope.deleteMsg = function (){
            myHttpService.delete($routeParams.msgObjId)
                .success(function() {
                    console.log("*** delete OK"); //debug
                    $location.path( "/list/"+$scope.currentPage );
                })
                .error (function () {
                    console.log('deleteMsg Error'); //debug
                    $location.path( "/list/1" );
                })
            ;
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
            if ($scope.formData.contents != undefined) {

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

        console.log('#EditDataCtrl already_fetched_data._id:' + myGlobalDataService.already_fetched_data._id); //debug

        $scope.UpdateGuestMsg = function() {
            if ($scope.formData.contents != undefined) {
                //$http.post('/apis/edit', $scope.formData)
                myHttpService.update($scope.formData)
                    .success(function() {
                        $scope.formData = {}; //reset
                        $location.path( "/list/"+$scope.currentPage );
                    })
                    .error (function () {
                        console.log('update Error'); //debug
                    });
            }
        };
    }]);


//-----------------------------------------------------------------------------
//controller : for pagination directive
myControllerModule.controller('PaginationCtrl', ['$scope','$http','$location','myHttpService','myGlobalDataService',
    function($scope, $http,$location,myHttpService,myGlobalDataService) {
        // 페이지 버튼 누를때마다 호출됨!! list/1 처럼 url이동하면서 갱신시에 호출..XXX
        console.log( "+++++++ PaginationCtrl start"  );
        var i;
        var activatePageIndex;
        var nIndexStart;
        var pageIndex;
        var nextFirstPageIndex;

        //--------------------------------------------------------------
        function setDisabledFirstPreviousNextLastPageButton(disabledFirst,disabledPrevious,disabledNext,disabledLast){
            $scope.disabledFirst = disabledFirst;
            $scope.disabledPrevious = disabledPrevious;
            $scope.disabledNext = disabledNext;
            $scope.disabledLast = disabledLast;
        }

        //--------------------------------------------------------------
        myHttpService.count()
            .success(function(data) {

                console.log( "PaginationCtrl totalCount: " + data );
                myGlobalDataService.pageInfo.totalMsgCnt = data; //save to service
                myGlobalDataService.pageInfo.totalPages = Math.ceil(myGlobalDataService.pageInfo.totalMsgCnt / myGlobalDataService.pageInfo.listPerPage);
                myGlobalDataService.pageInfo.totalPageSets = Math.ceil(myGlobalDataService.pageInfo.totalPages / myGlobalDataService.pageInfo.maxVisiblePages);

                $scope.totalPages = myGlobalDataService.pageInfo.totalPages ;
                $scope.currentPage = myGlobalDataService.pageInfo.currentPage;
                $scope.totalPages = myGlobalDataService.pageInfo.totalPages ;

                if(myGlobalDataService.pageInfo.currentPageSet<0){
                    //최초 상태 : myGlobalDataService.pageInfo.currentPage 를 이용해서 currentPageSet 를 계산.
                    //사용자가 페이지 버튼을 조작하면 음수 아닌 값이 설정될것이다.
                    console.log( "----- currentPageSet is not set! " ); //debug

                    for (i = 1; i <= myGlobalDataService.pageInfo.totalPageSets; i++) {
                        var endPageInVisiblePages = myGlobalDataService.pageInfo.maxVisiblePages * i;
                        //console.log( "----- endPageInVisiblePages :"+endPageInVisiblePages ); //debug
                        if( myGlobalDataService.pageInfo.currentPage <= endPageInVisiblePages) {
                            myGlobalDataService.pageInfo.currentPageSet = i;
                            console.log( "----- set currentPageSet :"+i ); //debug
                            break;
                        }
                    }
                }
                console.log( "myGlobalDataService.pageInfo.totalMsgCnt =" + myGlobalDataService.pageInfo.totalMsgCnt  );//debug
                console.log( "myGlobalDataService.pageInfo.currentPage =" + myGlobalDataService.pageInfo.currentPage  );//debug
                console.log( "myGlobalDataService.pageInfo.maxVisiblePages =" + myGlobalDataService.pageInfo.maxVisiblePages  );//debug
                console.log( "myGlobalDataService.pageInfo.listPerPage =" +myGlobalDataService.pageInfo.listPerPage);//debug
                console.log( "myGlobalDataService.pageInfo.totalPages =" +myGlobalDataService.pageInfo.totalPages);//debug
                console.log( "myGlobalDataService.pageInfo.totalPageSets: " + myGlobalDataService.pageInfo.totalPageSets );
                console.log( "PaginationCtrl total pages: " + myGlobalDataService.pageInfo.totalPages  );
                console.log( "myGlobalDataService.pageInfo.currentPageSet: " + myGlobalDataService.pageInfo.currentPageSet );

                if(myGlobalDataService.pageInfo.currentPageSet == 1 ) {
                    $scope.disabledFirst = 1;
                    $scope.disabledPrevious = 1;
                }

                if(myGlobalDataService.pageInfo.currentPageSet > 1 ) {
                    $scope.disabledFirst = 0;
                    $scope.disabledPrevious = 0;
                }

                if(myGlobalDataService.pageInfo.currentPageSet == myGlobalDataService.pageInfo.totalPageSets ) {
                    $scope.disabledNext = 1;
                    $scope.disabledLast = 1;
                }

                //각 페이지에 표시될 게시물 순번을 생성한다.
                nIndexStart = ((myGlobalDataService.pageInfo.currentPage-1) * myGlobalDataService.pageInfo.listPerPage)+1 ;
                //console.log( "nIndexStart ="+nIndexStart ); //debug
                $scope.listIndexAry=[];

                for (i = 0; i < myGlobalDataService.pageInfo.listPerPage; i++) {
                    $scope.listIndexAry.push ( nIndexStart+i );
                }

                $scope.pageSetArray=[];
                $scope.activeIndexAry=[];
                for (i = 0; i < myGlobalDataService.pageInfo.maxVisiblePages; i++) {
                    pageIndex = (myGlobalDataService.pageInfo.maxVisiblePages*(myGlobalDataService.pageInfo.currentPageSet-1)) + (i + 1);

                    if(pageIndex <= myGlobalDataService.pageInfo.totalPages ) {
                        $scope.pageSetArray.push(pageIndex);
                        if(myGlobalDataService.pageInfo.currentPage ==pageIndex){
                            $scope.activeIndexAry.push(1); //set active page
                        }else{
                            $scope.activeIndexAry.push(0);
                        }
                    }
                }
            })
            .error (function () {
                console.log( "PaginationCtrl Error!: "  );
            });

        //--------------------------------------------------------------
        $scope.showFirstPageSet = function(){
            myGlobalDataService.pageInfo.currentPageSet = 1;
            console.log( "showFirstPageSet!!");//debug
            setDisabledFirstPreviousNextLastPageButton(1,1,0,0);

            console.log( "showFirstPageSet --> move to 1 page");//debug
            myGlobalDataService.pageInfo.currentPage=1;
            $location.path( "/list/"+ myGlobalDataService.pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.showPreviousPageSet = function(){

            if(myGlobalDataService.pageInfo.currentPageSet == 1 ) {
                console.log( "showPreviousPageSet --> SKIP!!");//debug
                return; //skip
            }

            myGlobalDataService.pageInfo.currentPageSet -= 1;

            console.log( "showPreviousPageSet : myGlobalDataService.pageInfo.currentPageSet="+myGlobalDataService.pageInfo.currentPageSet);//debug
            if(myGlobalDataService.pageInfo.currentPageSet == 1 ) {
                console.log( "showPreviousPageSet --> First!!");//debug
                setDisabledFirstPreviousNextLastPageButton(1,1,0,0);
            }

            //이전 페이지 set으로 표시되었을때 선택 상태로 표시될 페이지를 지정
            activatePageIndex = (myGlobalDataService.pageInfo.maxVisiblePages*(myGlobalDataService.pageInfo.currentPageSet-1)) + myGlobalDataService.pageInfo.maxVisiblePages;
            console.log( "showPreviousPageSet --> activatePageIndex:"+activatePageIndex);//debug
            myGlobalDataService.pageInfo.currentPage=activatePageIndex;
            $location.path( "/list/"+ myGlobalDataService.pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.showNextPageSet = function(){

            if(myGlobalDataService.pageInfo.currentPageSet == myGlobalDataService.pageInfo.totalPageSets ) {
                console.log( "showNextPageSet --> SKIP!!:"+myGlobalDataService.pageInfo.currentPageSet);//debug
                return; //skip
            }

            myGlobalDataService.pageInfo.currentPageSet += 1;
            console.log( "showNextPageSet : myGlobalDataService.pageInfo.currentPageSet="+myGlobalDataService.pageInfo.currentPageSet);//debug

            if(myGlobalDataService.pageInfo.currentPageSet == myGlobalDataService.pageInfo.totalPageSets ) {
                console.log( "showNextPageSet --> last!!");//debug
                setDisabledFirstPreviousNextLastPageButton(0,0,1,1);
            }

            //다음 페이지셋의 첫번쩨 페이지로 이동 (ex: 1,2,3,4 페이지셋 표시중 다음을 누른 경우 5번째 패이지 표시)
            nextFirstPageIndex=(myGlobalDataService.pageInfo.maxVisiblePages*(myGlobalDataService.pageInfo.currentPageSet-1)) + 1;
            console.log( "showNextPageSet --> move to page:"+nextFirstPageIndex);//debug
            myGlobalDataService.pageInfo.currentPage=nextFirstPageIndex;
            $location.path( "/list/"+myGlobalDataService.pageInfo.currentPage );
        };

        //--------------------------------------------------------------
        $scope.showLastPageSet = function(){
            console.log( "showLastPageSet!!");//debug
            myGlobalDataService.pageInfo.currentPageSet = myGlobalDataService.pageInfo.totalPageSets;
            setDisabledFirstPreviousNextLastPageButton(0,0,1,1);

            myGlobalDataService.pageInfo.currentPage=myGlobalDataService.pageInfo.totalPages;
            $location.path( "/list/"+myGlobalDataService.pageInfo.currentPage );
        };
    }]);

