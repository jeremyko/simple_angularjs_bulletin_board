/**
 * Created by kojunghyun on 14. 12. 4..
 */

'use strict';

//http://jsfiddle.net/laan_sachin/jnj6y/
//$scope.$broadcast 를 이용해서 교환하는 방법도 있다.

//서비스를 이용해서 컨트롤러간 데이터 공유를 한다.
var myServiceModule = angular.module('myServiceModule', []);

//-----------------------------------------------------------------------------
//공유 데이터 서비스
myServiceModule.factory('myGlobalDataService', function(){

    return  {
        already_fetched_data: {
            user: '',
            title:'',
            contents:'',
            reg_date: '',
            hits: 0
        },
        pageInfo: {
            listPerPage: 4, //한 페이지당 표시할 메시지 수
            totalPages: -1,
            totalMsgCnt: -1,
            maxVisiblePages: 3, //선택가능한 최대 페이지 표시수, 초과시에는 다음 이전을 통해 접근.
            currentPage: -1, //사용자가 선택한 페이지를 계속 저장
            totalPageSets:-1,
            currentPageSet: -1 // ex: 전체 100 페이지 존재하는데(totalPages), 표시 페이지 단위가 5이면(maxVisiblePages),
                              // 총 20 page sets (totalPageSets) 이 생성된다.
                              // 이 page sets 들에서 현재 표시되고 있는 화면의 page set 을 의미함.
        }
        //others...
    };
});


//-----------------------------------------------------------------------------
//http 사용 서비스 --> TODO : $resource
myServiceModule.factory('myHttpService', function($http){

    return {
        count: function() {
            return $http.get('apis/countAll');
        },

        getPagedList : function(page, listPerPage) {
            return $http.get('/apis/list/'+page+'/'+listPerPage);
        },
        view : function(id) {
            return $http.get('/apis/view/'+id);
        },
        create : function(msgData) {
            return $http.post('/apis/write', msgData);
        },
        update : function(msgData) {
            return $http.put('/apis', msgData);
        },
        delete : function(id) {
            return $http.delete('/apis/' + id);
        }
    }
});
