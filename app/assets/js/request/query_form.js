/**
 * Created by lam on 13/5/14.
 */

function QueryForm(queryString) {
    return this.init(queryString);
}

QueryForm.prototype = {

    splitRegex: new RegExp('([^&=?]+)=?([^&]*)', 'g'),

    init: function (queryString) {

        while (match = this.splitRegex.exec(queryString)) {
            this[this.decode(match[1])] = this.decode(match[2]);
        }

        return this;
    },

    decode: function (string) {
        return decodeURIComponent(string.replace("+"," "));
    }
}