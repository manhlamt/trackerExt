/**
 * Created by lam on 9/5/14.
 */

var app = {

    urls: {
        popup: "components/popup/monitor.html"
    },

    db: {},

    monitorWindow: null,

    monitorView: null,

    currentTab: {},

    dbConfig: {
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
    },

    connections: {
        devtool: []
    },
    onMessage: {
        devtool: function (request, port, sendResponse) {
            if (typeof request.name == "string" && request.name == "init" && typeof request.tabId == "number") {
                app.initConnection(port, request.tabId)
            }
        }
    },

    initConnection: function (port, tabId) {
        return app.connections[port.name][tabId] = port;
    },

    init: function () {

        db.open(app.dbConfig).done(function (db) {
            app.db = db;

            //Find and show page actions
            app.db.tabs.query().all().execute().done(function (result) {
                for (var idx = 0; idx < result.length; idx ++) {
                    app.showPageAction(result[idx].id);
                }
            });
            //Init listener on requests
            chrome.webRequest.onSendHeaders.addListener(
                function(info) {
                    request = new T3Request(info);
                    request.timestamp = new Date().getTime();
                    app.storeRequest(request);
                },
                {
                    urls: [
                        "http://nation-tracking.knorex.asia/tracking*",
                        "http://star-tracking.knorex.asia/tracking*",
                        "http://demo.brand-display.com/tracking*",
                        "http://brand-display.com/tracking*",
                        "http://track.knorex.asia/tracking*"
                    ]
                },
                ["requestHeaders"]
            );
        });

        chrome.pageAction.onClicked.addListener(function(tab) {
            var monitor = chrome.extension.getURL(app.urls.popup);
            app.currentTab = tab;
            app.focusOrCreateWindow(monitor);
        });

        chrome.tabs.onRemoved.addListener(function (tabId) {
            app.clearTabData(tabId);
        });

        chrome.tabs.onUpdated.addListener(function (tabId) {
            app.db.tabs.query().filter('id',tabId).execute().done(function (result) {
                if (result.length > 0) {
                    app.showPageAction(result[0].id);
                }
            });
        });
        //This section is for testing message passing purpose

    },
    storeRequest: function (request) {
        console.log(request);
        //Check and create new tab entry
        app.db.tabs.query().filter('id',request.tabId).execute().done(function (result) {
            //create new tab entry
            if (result.length <= 0) {
                chrome.tabs.get(request.tabId, function (tab) {
                    app.db.tabs.add(tab);
                });
                app.showPageAction(request.tabId);
            }
        });
        //Check and create new BD entry
        app.db.bds.query('bdId').filter('bdId', request.bdId).execute().done(function(result){
            if (result.length <=0 ) {
                app.db.bds.add({bdId: request.bdId, url: request.queryForm.url});
            }
        });
        app.db.requests.add(request);
        app.dispatch(app.monitorView, 'catchRequest', [request]);
    },
    showPageAction: function (tabId) {
        chrome.tabs.get(tabId, function (tab) {
            if ( tab == undefined)
                app.clearTabData(tabId);
            else
                chrome.pageAction.show(tab.id);
        });
    },
    clearTabData: function (tabId) {
        console.log("Delete tab: " + tabId);
        //detele tab
        app.db.tabs.remove(tabId);
        //detelte tabs' requests
        app.db.requests.query('tabId').filter('tabId', tabId).execute().done(function (result){
            console.log(result);
            for ( var idx = 0; idx < result.length; idx ++) {
                app.db.requests.remove(result[idx].id).done(function (key) {
                    console.log('delete request: ' + key);
                });
            }
        });
    },
    focusOrCreateWindow: function (url) {
        var existWindow = false;
        chrome.windows.getAll({populate: true}, function (windows) {
            for (var windowIdx = 0 ; windowIdx < windows.length; windowIdx++) {
                if (windows[windowIdx].tabs.length == 1) {
                    if (windows[windowIdx].tabs[0].url == url) {
                        existWindow = windows[windowIdx];
                    }
                }
            }

            if (existWindow) {
                chrome.windows.update(existWindow.id, {focused: true});
            } else {
                app.openPopup(url);
            }
        });
    },
    openPopup: function (url) {
        chrome.windows.create(
            {
                'url': url,
                'type': 'popup',
                width:400
            },
            function(window) {
                app.monitorWindow = window;
                app.monitorView = chrome.extension.getViews({type:'tab', windowId: window.id})[0];
//                app.dispatch(app.monitorView, "tabChanged", [app.currentTab]);
                app.monitorView.currentTab = app.currentTab;
            }
        );
    },
    dispatch: function (object, fn, args) {
        if (object && typeof object[fn] == "function") {
            object[fn].apply(object, args);
        }
    }
};

app.init();


