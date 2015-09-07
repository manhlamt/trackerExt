/**
 * Created by lam on 21/4/14.
 */


function TrackTheTracker () {

}

TrackTheTracker.prototype = {
    tracker_id: "_tknx",
    requests: {},
    requestCount: 0,
    parseChanges: function (record) {
        this.parseAddedNodes(record.addedNodes);
        this.parseRemovedNodes(record.removedNodes);
    },
    parseAddedNodes: function (nodes) {
        for (var idx = 0; idx < nodes.length; idx++) {
            var node = nodes[idx];
            if (node.getAttribute("id") === this.tracker_id){
                var startTime = new Date().getTime();
                node.setAttribute("data-start", String(startTime));
                this.requests[startTime] = new T3Request(startTime);
                this.requestCount++ ;
            }
        }
    },
    parseRemovedNodes: function (nodes) {
        for (var idx = 0; idx < nodes.length; idx++) {
            var node = nodes[idx];
            if (node.getAttribute("id") === this.tracker_id){
                var request_id = node.getAttribute("data-start");
                this.requests[request_id].registerStopTime();
            }

        }
    }
}

function wrap(toWrap, wrapper) {
    if (toWrap.nextSibling) {
        toWrap.parentNode.insertBefore(wrapper, toWrap.nextSibling);
    } else {
        toWrap.parentNode.appendChild(wrapper);
    }
    return wrapper.appendChild(toWrap);
}

//initialize the tracker after jquery is loaded
var jqueryCheck = setInterval(function () {
    if (jQuery){
        window.t3 = new TrackTheTracker();
    }else {
        clearInterval(jqueryCheck);
    }
}, 1000);

//register dom mutation event handler
window.domMutated = function (record, observer) {
    if ( window.t3 )
        window.t3.parseChanges(record[0]);
}