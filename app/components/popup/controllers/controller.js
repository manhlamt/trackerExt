/**
 * Created by lam on 16/6/14.
 */

var monitorControllers = angular.module('monitorControllers', []);

monitorControllers.controller('MonitorCtrl', ['$scope',
    function ($scope, db) {
        //Const define
        $scope.repeatThreshold = 100;
        //Property define
        $scope.bdList = [];
        $scope.bd = {};
        $scope.bdId = '';
        $scope.detailShown = [];
        $scope.interactions = [];
        $scope.lastExamineRequest = {};
        $scope.failList = [];

        $scope.orderProp = 'id';

        $scope.$on('dbReady', function (event, db){
            $scope.server = db;
            $scope.loadTab(window.currentTab);
        });

        $scope.$on('tabChanged', function (event, tab){
            if ($scope.tabId != tab.id) {
                $scope.loadTab(tab);
            }
        });

        $scope.$on('tabRemoved', function (event,tabId) {
            if ($scope.tabId == tabId)
                $scope.loadTab(0);
        });

        $scope.$on('requestCreated', function (event, request) {
            $scope.newRequest(request);
        });

        $scope.$on('fetchTrackerInfo', function (event, data) {
            $scope.fetchTrackerInfo(data);
        });

        //Ctrl function
        $scope.loadTab = function (tab) {
            $scope.server.tabs.query().filter('id', tab.id).execute().done(function (result) {
                if (result.length > 0 ) {
                    $scope.failList = [];
                    $scope.tabId = tab.id;
                    $scope.tab = tab;
                    $scope.fetchRequests(result[0].id);
                } else {
//                        $scope.tabId = tab.id;
//                        $scope.tab = tab;
//                    $scope.$apply();
                }
            });
        };

        $scope.fetchRequests = function (tabId) {
            $scope.server.requests.query('tabId').filter('tabId', $scope.tab.id).execute().done(function (result) {
                $scope.requests = result;
                $scope.lastExamineRequest = {};
                $scope.fetchBds();
                $scope.$apply();
            });
        };

        $scope.fetchBds = function () {
            delete $scope.bdList;
            $scope.bdList = {};
            delete $scope.interactions;
            $scope.interactions = [];

            angular.forEach($scope.requests, function (value) {
                if(!(value.bdId in $scope.bdList)) {
                    $scope.bdList[value.bdId] = 1;
                } else {
                    $scope.bdList[value.bdId]++;
                }

                $scope.testRequest(value);

                $scope.addInteraction(
                    {
                        trigger: value.queryForm.trigger,
                        object: value.queryForm.object,
                        response: value.queryForm.response,
                        bdId: value.bdId,
                        valid: true
                    }
                );
            }, $scope);

            if (!($scope.bdId in $scope.bdList)){
                $scope.bdId = Object.keys($scope.bdList)[0];
                $scope.selectBD();
            }
        };

        $scope.addInteraction = function (interaction) {
            var exist = false;
            if ( interaction.trigger) {
                if ($scope.interactions.length > 0) {
                    angular.forEach($scope.interactions, function (item) {
                        var itemO = Object.create(item),
                            interactionO = Object.create(interaction);
                        interactionO.valid = itemO.valid;
                        if (angular.equals(itemO, interactionO)){
                            exist = true;
                        }
                    }, $scope.interactions);
                }
            } else {
                exist = true;
            }
            if (!exist)
                $scope.interactions.push(interaction);
            return !exist;
        };

        $scope.newRequest = function (request) {
            if ($scope.tab && request.tabId == $scope.tab.id) {
                $scope.requests.push(request);


                $scope.bdList[request.bdId] = $scope.bdList[request.bdId] ? $scope.bdList[request.bdId] + 1 : 1;

                $scope.addInteraction(
                    {
                        trigger: request.queryForm.trigger,
                        object: request.queryForm.object,
                        response: request.queryForm.response,
                        bdId: request.bdId,
                        valid: true
                    }
                );

                $scope.testRequest(request);

                $scope.$apply();
            }
        };

        $scope.selectBD = function () {
//            for (var i = 0; i < $scope.bdList.length ; i++) {
//                if ($scope.bdList[i].id == bdId) {
//                    $scope.bd = $scope.bdList[i];
//                    $scope.requestTrackerInfo($scope.bd.id);
//                }
//            }
            $scope.requestTrackerInfo($scope.bdId);
        };

        $scope.switchTab = function (event) {
            event.preventDefault();
            $(event.target).tab('show');
        };

        $scope.showDetail = function (requestId) {
            var idx = $scope.detailShown.indexOf(requestId);
            if (idx >= 0) {
                $scope.detailShown.splice(idx,1);
            } else {
                $scope.detailShown.push(requestId);
            }
        };

        $scope.isDetailShown = function (requestId) {
            return $scope.detailShown.indexOf(requestId) >= 0;
        };

        $scope.isPageView = function (request) {
            return request.queryForm.browser != undefined;
        };

        $scope.getBDList = function () {
            return Object.keys($scope.bdList);
        };

        $scope.lightSwitch = function () {
            chrome.tabs.executeScript($scope.tabId, {file: 'components/content_scripts/t3_inject.js'});
        };

        $scope.scrollTo = function () {
            $scope.server.bds.query('bdId').filter('bdId', $scope.bdId).execute().done(function (result) {
                if (result.length > 0) {
                    var url = result[0].url.replace(/#.*$/, '');
                    var script = "document.querySelectorAll(\"iframe[src^=\'" + url +"\']\")[0].scrollIntoView();";
                    chrome.tabs.executeScript($scope.tabId, {code: script});
                }
            });
        };
        $scope.requestTrackerInfo = function (bdId) {
            $scope.nodes = [];
            chrome.tabs.sendMessage($scope.tabId, {
                request: "fetchTrackerInfo",
                data: {
                    bdId: bdId
                }
            });
        };

        $scope.fetchTrackerInfo = function (data) {
            if (data.data.bdId == $scope.bdId) {
                $scope.nodes = data.data.nodes;
            }
        };

        $scope.triggerEventOnNode = function (event, index) {
            chrome.tabs.sendMessage($scope.tabId, {
                request: "triggerEventOnNode",
                data: {
                    event: event,
                    index: index,
                    bdId: $scope.bdId
                }
            });
        };

        $scope.outlineNode = function (index) {
            chrome.tabs.sendMessage($scope.tabId, {
                request: "outlineNode",
                data: {
                    index: index,
                    bdId: $scope.bdId
                }
            });
        };

        $scope.testRequest = function (request) {
            var lRequest = $scope.lastExamineRequest[request.bdId];
            $scope.lastExamineRequest[request.bdId] = request;

            if (lRequest) {
                var valid = (request.timestamp - lRequest.timestamp) > $scope.repeatThreshold;
                if (valid) {
                    request.valid = valid;
                } else {
                    request.valid = lRequest.valid = valid;
                    $scope.makeInteractionInvalid(request);
                    $scope.makeInteractionInvalid(lRequest);
                }
            } else
                request.valid = true;
        };

        $scope.makeInteractionInvalid  = function (request) {
            var interaction = {
                trigger: request.queryForm.trigger,
                object: request.queryForm.object,
                response: request.queryForm.response,
                bdId: request.bdId,
                valid: true
            };

            $scope.interactions.forEach(function (item) {
                if (JSON.stringify(item) == JSON.stringify(interaction)) {
                    item.valid = false;
                }
            });

            $scope.failList[request.bdId] = true;

        }
    }]
);