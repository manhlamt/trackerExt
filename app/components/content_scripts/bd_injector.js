/**
 * Created by lam on 23/6/14.
 */
console.log("Injortor !!!!");
if (!window.injected){
    tracker_script = document.querySelector("script[src*='tracker.min']");
    if (tracker_script) {
        //create the script element
        var script = document.createElement('script');
        script.src = chrome.extension.getURL('components/content_scripts/bd.js');
        script.onload = injectReady;

        document.documentElement.appendChild(script);
    }
    //This script also act as a middle man to communicate between the original pages and the plugin
    function injectReady() {
        var returnHandlers = {
            returnTrackerInfo: function (data) {
                chrome.runtime.sendMessage(window.extension, JSON.stringify(data));
            }
        };

        var receiverHandlers =  {
            fetchTrackerInfo: function (data) {
                window.postMessage({
                    request: "fetchTrackerInfo",
                    data: {
                        bdId: data.data.bdId
                    }
                },"*");
            },

            triggerEventOnNode: function (data) {
                window.postMessage(data,"*");
            },

            outlineNode: function (data) {
                window.postMessage(data,"*");
            }
        };

        chrome.runtime.onMessage.addListener(function (message, sender) {
            window.extension = sender.id;
            if (message.request in receiverHandlers) {
                receiverHandlers[message.request].call(window,message);
            }
        });

        window.addEventListener("message", function (event) {
            var data =null;
            try {
                data = JSON.parse(event.data);
            }catch (error) {
                data = event.data;
            }
            if (data.request in returnHandlers) {
                returnHandlers[data.request].call(window, data);
            }
        });
    }



    window.injected = true;
}