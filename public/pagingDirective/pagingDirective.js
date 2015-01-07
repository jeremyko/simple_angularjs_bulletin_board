/**
 * Created by kojunghyun on 14. 12. 31..
 */

'use strict';

var myDirectiveModule = angular.module('myDirectiveModule', ['myServiceModule']);

//-----------------------------------------------------------------------------
myDirectiveModule.controller('myPaginationController', ['$scope', '$location','$attrs', '$parse','$http', 'myHttpService', 'myGlobalDataService',
    function ($scope, $location, $attrs, $parse,  $http, myHttpService, myGlobalDataService) {

        $scope.pageInfo = myGlobalDataService.pageInfo;

        //1 번만 로딩된다. list.js를 통해 이미 1 page 데이터는 가져온 상태이다(최초 기동시 1page).
        //console.log("myPaginationDirective controller maxVisiblePages="+$scope.maxVisiblePages+
        //    " $scope.countAllApiUrl="+$scope.countAllApiUrl ); //debug

        $scope.pageInfo.maxVisiblePages = parseInt( $scope.maxVisiblePages);

        //페이지별로 서버에 요청할 때 마다 호출 된다. 전체 건수는 별도로 요청해서 알아내야함.
        //최신 데이터 갯수를 바탕으로 페이징을 계산하기 위함.

        $scope.disabledNext = 0;
        $scope.disabledLast = 0;
        //var onSearchingNow = false;
        $scope.onSearchingNow = false;

        //--------------------------------------------------------------
        var i = 0;
        var resetPages=function(){
            //console.log("resetPages : ",$scope.pageInfo.totalPages); //debug
            if($scope.pageInfo.currentPage == 1 ) {
                $scope.disabledFirst = 1;
                $scope.disabledPrevious = 1;
            }

            if($scope.pageInfo.currentPage > 1 ) {
                $scope.disabledFirst = 0;
                $scope.disabledPrevious = 0;
            }

            if($scope.pageInfo.currentPage == $scope.pageInfo.totalPages ) {
                $scope.disabledNext = 1;
                $scope.disabledLast = 1;
            }else{
                $scope.disabledNext = 0;
                $scope.disabledLast = 0;
            }

            $scope.pageSetArray=[]; //page 목록
            $scope.activeIndexAry=[];

            //console.log("$scope.pageInfo.currentPageSet : ",$scope.pageInfo.currentPageSet); //debug
            for (i = 0; i < $scope.pageInfo.maxVisiblePages; i++) {
                var pageIndex = ($scope.pageInfo.maxVisiblePages*($scope.pageInfo.currentPageSet-1)) + (i + 1);
                //console.log("pageIndex : ",pageIndex); //debug
                if(pageIndex <= $scope.pageInfo.totalPages ) {
                    $scope.pageSetArray.push(pageIndex);

                    //console.log("pageSetArray.push : ",pageIndex); //debug
                    if($scope.pageInfo.currentPage ==pageIndex){
                        $scope.activeIndexAry.push(1); //set active page
                    }else{
                        $scope.activeIndexAry.push(0);
                    }
                }
            }
        };

        //--------------------------------------------------------------
        $scope.moveToFirstPage = function(){
            $scope.pageInfo.currentPageSet = 1;
            $scope.pageInfo.currentPage=1;
            $scope.pageChanged($scope.pageInfo.currentPage);
        };

        /*
        //--------------------------------------------------------------
        $scope.moveToPreviousPageSet = function() {

            if($scope.pageInfo.currentPageSet == 1 ) {
                //console.log( "showPreviousPageSet --> SKIP!!");//debug
                return; //skip
            }
            $scope.pageInfo.currentPageSet -= 1;

            var activatePageIndex = ($scope.pageInfo.maxVisiblePages*($scope.pageInfo.currentPageSet-1)) + $scope.pageInfo.maxVisiblePages;
            //console.log( "showPreviousPageSet --> activatePageIndex:"+activatePageIndex+" pageInfo.maxVisiblePages:"+pageInfo.maxVisiblePages);//debug
            $scope.pageInfo.currentPage=activatePageIndex;
        };
        //--------------------------------------------------------------
        $scope.moveToNextPageSet = function(){

            if($scope.pageInfo.currentPageSet == $scope.pageInfo.totalPageSets ) {
                //console.log( "showNextPageSet --> SKIP!!:"+pageInfo.currentPageSet);//debug
                return; //skip
            }
            $scope.pageInfo.currentPageSet += 1;

            //다음 페이지셋의 첫번쩨 페이지로 이동 (ex: 1,2,3,4 페이지셋 표시중 다음을 누른 경우 5번째 패이지 표시)
            var nextFirstPageIndex=($scope.pageInfo.maxVisiblePages*($scope.pageInfo.currentPageSet-1)) + 1;
            $scope.pageInfo.currentPage=nextFirstPageIndex;
            $scope.pageChanged($scope.pageInfo.currentPage);
        };
        */

        //--------------------------------------------------------------
        $scope.moveToPreviousPage = function(){

            if($scope.pageInfo.currentPage == 1 ) {
                return; //skip
            }
            $scope.pageInfo.currentPage -= 1;
            //console.log("moveToPreviousPage:$scope.pageInfo.currentPage:",$scope.pageInfo.currentPage );
            //console.log("moveToPreviousPage:$scope.pageInfo.maxVisiblePages:",$scope.pageInfo.maxVisiblePages );
            //pageInfo.currentPageSet 에서 -1 변경된 페이지의 인덱스가 0보다 작으면 pageSet을 감소 시킨다.

            var checkPage = $scope.pageInfo.currentPage % $scope.pageInfo.maxVisiblePages ;
            //console.log("checkPage:",checkPage );
            if(checkPage==0){
                if($scope.pageInfo.currentPageSet == 1 ) {
                    console.log("skip");
                    return; //skip
                }
                $scope.pageInfo.currentPageSet -= 1;
                //console.log("decrease pageSet:",$scope.pageInfo.currentPageSet );
            }
            $scope.pageChanged($scope.pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.moveToNextPage = function(){

            if($scope.pageInfo.currentPage == $scope.pageInfo.totalPages ) {
                //console.log( "showNextPageSet --> SKIP!!:"+pageInfo.currentPageSet);//debug
                return; //skip
            }
            $scope.pageInfo.currentPage += 1;

            //check pageSet
            //pageInfo.currentPageSet 에서 +1 변경된 페이지의 인덱스가 현재 페이지set을 넘어가면 pageSet을 +1 시킨다.

            var checkPageSet = $scope.pageInfo.currentPageSet * $scope.pageInfo.maxVisiblePages ;
            if( $scope.pageInfo.currentPage > checkPageSet ){
                if($scope.pageInfo.currentPageSet == $scope.pageInfo.totalPageSets ) {
                    return; //skip
                }
                $scope.pageInfo.currentPageSet += 1;
            }

            $scope.pageChanged($scope.pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.moveToLastPage = function(){
            $scope.pageInfo.currentPageSet = $scope.pageInfo.totalPageSets;
            $scope.pageInfo.currentPage=$scope.pageInfo.totalPages;
            $scope.pageChanged($scope.pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.pageChanged = function(page) {
            //console.log("directive: page changed!!!! ->", page); //debug
            $scope.pageInfo.currentPage = page;

            if($scope.onSearchingNow){
                myHttpService.getSearchPagedList( page, $scope.pageInfo.listPerPage)
                    .then( function() {
                        myHttpService.getSearchResultCount();
                        //reset pageInfo.totalMsgCnt ,pageInfo.totalPages ,pageInfo.totalPageSets
                    });
            }else{
                myHttpService.getPagedList(page, $scope.pageInfo.listPerPage)
                    .then( function() {
                        myHttpService.getCountAll();
                        //reset pageInfo.totalMsgCnt ,pageInfo.totalPages ,pageInfo.totalPageSets
                    });
            }
        };

        /*
        //--------------------------------------------------------------
        $scope.$on('onSearchingChanged', function (event, data) {
            //console.log('on : onSearchingChanged:', data); //debug
            onSearchingNow = data; //true, false
        });
        */

        //--------------------------------------------------------------
        $scope.$on('newCountArrived', function (event, data) {
            //console.log('on : newCountArrived');
            resetPages();
        });
}]);


//-----------------------------------------------------------------------------
//directive : for pagination : 페이지별로 서버에 요청
myDirectiveModule.directive('myPaginationDirective', function() {

    return {
        restrict: 'E',
        templateUrl: 'pagingDirective/pagination_template.html',

        scope: {
            maxVisiblePages: '@'
            //countAllApiUrl:'@'
        },

        controller: 'myPaginationController',
        link: function(scope, element, attrs, controllers) {
            //console.log("link inviked");
            //console.log("scope.$parent.onSearching=",scope.$parent.onSearching); //debug
            scope.$watch("$parent.onSearching", function(val){
                //console.log("onSearching changed!=", val); //debug
                scope.onSearchingNow = val; //true, false
            });

        }
    };
});
