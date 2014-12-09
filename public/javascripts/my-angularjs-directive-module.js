/**
 * Created by kojunghyun on 14. 12. 6..
 */
var myDirectiveModule = angular.module('myDirectiveModule', ['myServiceModule']);

//-----------------------------------------------------------------------------
//directive : for pagination
myDirectiveModule.directive('myPaginationDirective',  function() {
    return {
        restrict: 'E',
        templateUrl: '../partials/pagination_template.html',
    };
});
