/**
 * Created by lam on 13/6/14.
 */

//console.log('monitoring');
//
//window.tabChanged = function (id) {
//    console.log(id);
//}

var monitor = angular.module('monitor', ['monitorControllers','ngAnimate'])
    .run(function ($rootScope) {
        window.$rootScope = $rootScope;
        chrome.tabs.onActivated.addListener(function (tab) {
            chrome.tabs.get(tab.tabId,function (tab) {
                $rootScope.$broadcast('tabChanged',tab);
            });
        });
        chrome.tabs.onCreated.addListener(function () {
            $rootScope.$broadcast('tabCreated');
        });
        chrome.tabs.onRemoved.addListener(function (tabId) {
            $rootScope.$broadcast('tabRemoved', tabId);
        });
        chrome.windows.onFocusChanged.addListener(function (windowId) {
            chrome.tabs.getSelected(windowId, function (tab) {
                $rootScope.$broadcast('tabChanged', tab);
            });
        });

        chrome.runtime.onMessage.addListener(function (message, sender) {
            var data = JSON.parse(message);
            $rootScope.$broadcast('fetchTrackerInfo', data);
        });

        var dbConfig = {
            server: 'bd-tracker',
            version: 5,
            schema: {
                tabs: {
                    key: {keyPath: 'id', autoIncrement: true} //id is tab id
                },
                bds: {
                    key: {keyPath: 'id', autoIncrement: true}, //id is a combine of tab id and bd id,
                    indexes: {
                        bdId: {unique: true}
                    }
                },
                requests: {
                    key: {keyPath: 'id', autoIncrement: true},
                    indexes: {
                        requestId: {unique: true},
                        bdId: {},
                        tabId:{}
                    }
                },
                interactions: {
                    key: {keyPath: 'id', autoIncrement: true}
                }
            }
        };

        return db.open(dbConfig).done(function (db) {
            $rootScope.$broadcast('dbReady', db);
        });
    });

function catchRequest(request) {
    window.$rootScope.$broadcast('requestCreated', request);
}