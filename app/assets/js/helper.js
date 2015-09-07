/**
 * Created by lam on 21/4/14.
 */
function T3Helper() {
    this.iframe_id = "t3_wrapper";
    this.embed();
    return this;
}

T3Helper.prototype = {
    host: "http://localhost:63344/track-the-tracker",
    resources : {
        'script': [
            '/assets/js/main.js',
            '/assets/js/request.js'
        ],
        'css': []
    },

    t3_skeleton: '<!DOCTYPE html><html><head lang="en"><title>Tracker The Tracker</title><meta http-equiv="Content-Type" content="text/html;charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css"><link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css"></head><body><div id="t3-wrapper"><div> Track the tracker </div></div><script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script><script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script></body></html>',

    embed: function () {
        this.iframe = document.getElementById(this.iframe_id);
        this.iframe.contentDocument.write(this.t3_skeleton);
        this.inject_resources();
        //init Observer
        var self = this;
        this.observer = new MutationObserver(function (record, observer) {
            if (typeof self.iframe.contentWindow.domMutated == "function")
                self.iframe.contentWindow.domMutated(record, observer);
        });
        this.observer.observe(document.getElementsByTagName('body')[0],{childList:true});
    },
    inject_resources: function () {
        for (var resources in this.resources) {
            for (var url_idx in this.resources[resources]) {
                this['inject_' + resources](this.resources[resources][url_idx]);
            }
        }
    },
    inject_script: function ( resource ) {
        console.log(resource);
        var document = this.iframe.contentDocument;
        var script = document.createElement('script');
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", this.host + resource);
        document.getElementsByTagName('body')[0].appendChild(script);
        return script;
    }
}

MutationObserver = MutationObserver || WebKitMutationObserver;

var t3_helper = new T3Helper();

