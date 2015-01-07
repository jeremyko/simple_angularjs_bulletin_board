/**
 * Created by kojunghyun on 14. 12. 31..
 */
/**
 * Created by kojunghyun on 14. 11. 30..
 */
'use strict';

angular.module('myRoutingModule', ['ngRoute'])
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.

                when('/list', {
                //when('/list/:page', {
                    templateUrl: 'msgList/list.html',
                    controller: 'listCtrl'
                }).

                otherwise({
                    redirectTo: '/list/'
                });
        }]);