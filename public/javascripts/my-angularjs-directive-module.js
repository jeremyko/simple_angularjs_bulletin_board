/**
 * Created by kojunghyun on 14. 12. 6..
 */
var myDirectiveModule = angular.module('myDirectiveModule', ['myServiceModule']);

//-----------------------------------------------------------------------------
//directive : for pagination
myDirectiveModule.directive('myPaginationDirective', function() {

    return {
        restrict: 'E',
        templateUrl: '../partials/pagination_template.html',

        scope: {
            maxVisiblePages: '@',
            countAllApiUrl:'@',
            pagedListApiUrlPrefix:'@'
        },

        controller: function($scope,$http,$location,myHttpService,myGlobalDataService){
            console.log("myPaginationDirective controller maxVisiblePages="+$scope.maxVisiblePages+
                " $scope.countAllApiUrl="+$scope.countAllApiUrl+
                " $scope.pagedListApiUrlPrefix="+$scope.pagedListApiUrlPrefix); //debug

            myGlobalDataService.pageInfo.maxVisiblePages = parseInt( $scope.maxVisiblePages);

            function setDisabledFirstPreviousNextLastPageButton(disabledFirst,disabledPrevious,disabledNext,disabledLast){
                $scope.disabledFirst = disabledFirst;
                $scope.disabledPrevious = disabledPrevious;
                $scope.disabledNext = disabledNext;
                $scope.disabledLast = disabledLast;
            }

            $http.get($scope.countAllApiUrl )
                .success(function(data) {

                    console.log( "-myPaginationDirective totalCount: " + data );
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
                    console.log( "-myGlobalDataService.pageInfo.totalMsgCnt =" + myGlobalDataService.pageInfo.totalMsgCnt  );//debug
                    console.log( "-myGlobalDataService.pageInfo.currentPage =" + myGlobalDataService.pageInfo.currentPage  );//debug
                    console.log( "-myGlobalDataService.pageInfo.maxVisiblePages =" + myGlobalDataService.pageInfo.maxVisiblePages  );//debug
                    console.log( "-myGlobalDataService.pageInfo.listPerPage =" +myGlobalDataService.pageInfo.listPerPage);//debug
                    console.log( "-myGlobalDataService.pageInfo.totalPages =" +myGlobalDataService.pageInfo.totalPages);//debug
                    console.log( "-myGlobalDataService.pageInfo.totalPageSets: " + myGlobalDataService.pageInfo.totalPageSets );
                    console.log( "-myGlobalDataService.pageInfo.currentPageSet: " + myGlobalDataService.pageInfo.currentPageSet );

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
                console.log( "count all Error!: "  );
            });


            //--------------------------------------------------------------
            $scope.showFirstPageSet = function(){
                myGlobalDataService.pageInfo.currentPageSet = 1;
                //console.log( "showFirstPageSet!!");//debug
                setDisabledFirstPreviousNextLastPageButton(1,1,0,0);

                //console.log( "showFirstPageSet --> move to 1 page");//debug
                myGlobalDataService.pageInfo.currentPage=1;
                $location.path( $scope.pagedListApiUrlPrefix + myGlobalDataService.pageInfo.currentPage);
            };

            //--------------------------------------------------------------
            $scope.showPreviousPageSet = function(){

                if(myGlobalDataService.pageInfo.currentPageSet == 1 ) {
                    console.log( "showPreviousPageSet --> SKIP!!");//debug
                    return; //skip
                }

                myGlobalDataService.pageInfo.currentPageSet -= 1;

                //console.log( "showPreviousPageSet : myGlobalDataService.pageInfo.currentPageSet="+myGlobalDataService.pageInfo.currentPageSet);//debug
                if(myGlobalDataService.pageInfo.currentPageSet == 1 ) {
                    //console.log( "showPreviousPageSet --> First!!");//debug
                    setDisabledFirstPreviousNextLastPageButton(1,1,0,0);
                }

                //이전 페이지 set으로 표시되었을때 선택 상태로 표시될 페이지를 지정
                activatePageIndex = (myGlobalDataService.pageInfo.maxVisiblePages*(myGlobalDataService.pageInfo.currentPageSet-1)) + myGlobalDataService.pageInfo.maxVisiblePages;
                //console.log( "showPreviousPageSet --> activatePageIndex:"+activatePageIndex+" pageInfo.maxVisiblePages:"+myGlobalDataService.pageInfo.maxVisiblePages);//debug
                myGlobalDataService.pageInfo.currentPage=activatePageIndex;
                $location.path( $scope.pagedListApiUrlPrefix + myGlobalDataService.pageInfo.currentPage);
            };

            //--------------------------------------------------------------
            $scope.showNextPageSet = function(){

                if(myGlobalDataService.pageInfo.currentPageSet == myGlobalDataService.pageInfo.totalPageSets ) {
                    console.log( "showNextPageSet --> SKIP!!:"+myGlobalDataService.pageInfo.currentPageSet);//debug
                    return; //skip
                }

                myGlobalDataService.pageInfo.currentPageSet += 1;
                //console.log( "showNextPageSet : myGlobalDataService.pageInfo.currentPageSet="+myGlobalDataService.pageInfo.currentPageSet);//debug

                if(myGlobalDataService.pageInfo.currentPageSet == myGlobalDataService.pageInfo.totalPageSets ) {
                    //console.log( "showNextPageSet --> last!!");//debug
                    setDisabledFirstPreviousNextLastPageButton(0,0,1,1);
                }

                //다음 페이지셋의 첫번쩨 페이지로 이동 (ex: 1,2,3,4 페이지셋 표시중 다음을 누른 경우 5번째 패이지 표시)
                nextFirstPageIndex=(myGlobalDataService.pageInfo.maxVisiblePages*(myGlobalDataService.pageInfo.currentPageSet-1)) + 1;
                //console.log( "showNextPageSet --> move to page:"+nextFirstPageIndex);//debug
                myGlobalDataService.pageInfo.currentPage=nextFirstPageIndex;
                $location.path( $scope.pagedListApiUrlPrefix +myGlobalDataService.pageInfo.currentPage );
            };

            //--------------------------------------------------------------
            $scope.showLastPageSet = function(){
                //console.log( "showLastPageSet!!");//debug
                myGlobalDataService.pageInfo.currentPageSet = myGlobalDataService.pageInfo.totalPageSets;
                setDisabledFirstPreviousNextLastPageButton(0,0,1,1);

                myGlobalDataService.pageInfo.currentPage=myGlobalDataService.pageInfo.totalPages;
                $location.path( $scope.pagedListApiUrlPrefix +myGlobalDataService.pageInfo.currentPage );
            };
        }
        //---------------------------------------------------------------------
    };
});
