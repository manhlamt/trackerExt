/**
 * Created by lam on 21/4/14.
 */

function T3Request (rawRequest) {
    if(typeof rawRequest === "object"){
        return this.init(rawRequest);
    } else {
        return this;
    }
}

T3Request.prototype = {

    splitRegex: new RegExp('(https?)://([^/]*)?/([^?]*)?(.*)'),

    init: function (rawHeaders) {
        this.raw = rawHeaders;

        var splits = this.splitRegex.exec(rawHeaders.url);
        this.queryForm = new QueryForm(splits[4]);

        this.schema = splits[1];
        this.host = splits[2];
        this.path = splits[3]
        this.requestId = this.raw.requestId;
        this.bdId = this.queryForm.id;
        this.tabId = this.raw.tabId;

        return this;
    }
}
