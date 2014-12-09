/**
 * Created by kojunghyun on 14. 11. 30..
 */
'use strict';

angular.module('myRoutingModule', ['ngRoute'])
    .config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/list/:page', {
                templateUrl: 'partials/list.html',
                controller: 'FetchCtrl'
            }).
            when('/view/:msgObjId', {
                templateUrl: 'partials/view.html',
                controller: 'ViewCtrl'
            }).
            when('/write', {
                templateUrl: 'partials/write.html',
                controller: 'WriteCtrl'
            }).
            when('/edit/:msgObjId', {
                templateUrl: 'partials/edit.html',
                controller: 'EditCtrl'
            }).
            otherwise({
                redirectTo: '/list/1'
            });
    }]);