/**
 * Created by lam on 12/5/14.
 */

chrome.devtools.inspectedWindow.eval("console.log('dev_tool')");

var devtool = {
    connection: null,
    onMessage: {
        detectBD: function(message, sender, sendResponse) {
            chrome.devtools.inspectedWindow.eval("console.log('message')");
            console.log(message);
            console.log(sender);
            console.log(sendResponse);
        }
    }
}


devtool.connection = chrome.runtime.connect({name: "devtool"});
devtool.connection.onMessage.addListener(devtool.onMessage.detectBD);
devtool.connection.postMessage({
    name: "init",
    tabId: chrome.devtools.inspectedWindow.tabId
});