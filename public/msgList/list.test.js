/**
 * Created by kojunghyun on 15. 1. 8..
 */
describe('list', function() {

    ////////////////////////////////////////////
//    it('2+4 should be 6', function() {
//        expect(2+4).toEqual(6);
//    });

    ////////////////////////////////////////////
    beforeEach(module('listModule'));

    var ctrl, scope;
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('listCtrl', {
            $scope: scope
        });
    }));

    it('should scope.cancelSearch() set scope.onSearching false',
        function() {
            scope.onSearching = true;
            scope.cancelSearch();
            expect(scope.onSearching).toEqual(false);
        });
});