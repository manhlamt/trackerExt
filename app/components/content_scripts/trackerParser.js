
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
            } else {
                item.dataObject = node.getAttribute('data-object');
            }

            item.tagName = node.tagName;

            item.className = node.className;

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