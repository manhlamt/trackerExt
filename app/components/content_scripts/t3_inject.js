/**
 * Created by lam on 9/5/14.
 */

if (!window.injected) {

    window.hosts = [
        "http://star-micro.knorex.asia",
        "http://star-big.knorex.asia",
        "http://nation-static.s3.amazonaws.com/",
        "http://brand-display.s3.amazonaws.com",
        "http://bd-demo.s3.amazonaws.com",
        "http://brand-display-test.s3.amazonaws.com/"
    ]

    function lightOff() {
        var overlay = document.createElement('div');
        overlay.setAttribute('id', 't3_overlay');
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.zIndex = '900';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';

        for (var idx = 0; idx < window.hosts.length; idx ++) {
            var nl = document.querySelectorAll("iframe[src^='" + window.hosts[idx]+"']");
            for (var nlIndx = 0; nlIndx < nl.length; nlIndx++) {
                nl[nlIndx].style.zIndex = '500001';
                nl[nlIndx].style.position = 'relative';
            }
        }

        document.getElementsByTagName('body')[0].appendChild(overlay);

        window.lightSwitch = false;
    }

    function lightOn() {
        var overlay = document.getElementById('t3_overlay');
        if (overlay)
            overlay.parentNode.removeChild(overlay);

        for (var idx = 0; idx < window.hosts.length; idx ++) {
            var nl = document.querySelectorAll("iframe[src^='" + window.hosts[idx]+"']");
            for (var nlIndx = 0; nlIndx < nl.length; nlIndx++) {
                nl[nlIndx].style.zIndex = null;
            }
        }

        window.lightSwitch = true;
    }

    injected = true;
    window.lightSwitch = true;
}

if (window.lightSwitch) {
    lightOff();
} else {
    lightOn();
}
