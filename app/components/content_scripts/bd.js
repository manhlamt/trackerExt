/**
 * Created by lam on 23/6/14.
 */


if (!window.injected) {


    var trackerParser = {
        events: ["onclick", "ondbclick", "onmousedown", "onmousemove", "onmouseover", "onmouseout", "onmouseup",
            "onkeydown", "onkeypress", "onkeyup", "onblur", "onchange", "onfocus", "onreset", "onselect", "onsubmit"
        ],

        parseNodes: function () {
            var nodes = knxTracker.trackList,
                result = [],
                trackFuncs = Object.keys(knxTracker).filter(function (value) {
                    return value.match('trackOn');
                });

            for (var idx = 0; idx < nodes.length; idx++) {
                var item = {listener: []}, node = nodes[idx];

                if (node.getAttribute('id')) {
                    item.id = node.getAttribute('id');
                }
                if (node.getAttribute('data-object')) {
                    item.dataObject = node.getAttribute('data-object');
                }

                item.tagName = node.tagName;

                item.class = node.className.replace(" ", ".");
                if (item.class[0] != ".") {
                    item.class = "." + item.class;
                }
                for (var eventIdx = 0; eventIdx < trackerParser.events.length; eventIdx ++) {
                    var eventName = trackerParser.events[eventIdx];
                    for (var funcIdx = 0; funcIdx < trackFuncs.length; funcIdx++ ) {
                        if (node[eventName] == knxTracker[trackFuncs[funcIdx]]){
                            item.listener.push(eventName);
                        }
                    }
                }

                result.push(item);
            }

            return result;
        }
    };


    if (KNOREX_ID) {
        messageHandlers = {
            fetchTrackerInfo: function (data) {
                var result = {};
                if (data.bdId == KNOREX_ID) {
                    result.nodes = trackerParser.parseNodes();
                    result.bdId = KNOREX_ID;
                }
                return {
                    request: "returnTrackerInfo",
                    data: result
                };
            },
            triggerEventOnNode: function (data) {
                var event = new Event(data.event.slice(2));
                knxTracker.trackList[data.index].dispatchEvent(event);
                console.log(data);
            },
            outlineNode: function (data) {
                var node = knxTracker.trackList[data.index];

                if ( node.style.outline == "" || node.style.outline == "none") {
                    node.style.outline = "1px solid blue";
                } else {
                    node.style.outline = "";
                }
            }
        };

        window.addEventListener('message', function (event) {
            var result = null;
            if (event.data.request in messageHandlers && event.data.data.bdId == KNOREX_ID) {
                result = messageHandlers[event.data.request].call(this, event.data.data);
                if (result)
                    window.postMessage(JSON.stringify(result), '*');
            }
        });

    } else {
        console.log('Can\'t not find KNOREX_ID');
    }


    window.injected = true;
}