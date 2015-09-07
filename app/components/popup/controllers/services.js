/**
 * Created by lam on 16/6/14.
 */

var monitorServices = angular.module('monitorServices', []);

monitorServices.factory('db', function () {

});

monitorServices.factory('tab', ['$rootScope',
    function ($rootScope) {
        console.log($rootScope);
    }]
);
