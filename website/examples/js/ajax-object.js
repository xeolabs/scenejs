// ajaxObject is an object constructor, pass it the server url you want it to call
// and the function name you want it to call when it gets the data back from the server.
// Use the .update() method to actually start the communication with the server.
// The first optional argument for update is the data you want to send to the server.
// ajaxvar.update('id=1234&greed=good&finish=true');
// The second optional argument for update is 'POST' if you want to send the data
// as a POST instead of the default GET (post can handle larger amounts of data and
// the data doesn't show up in your server logs).
// ajaxvar.update('id=1234&greed=good&finish=true','POST');

function ajaxObject(url, callbackFunction) {
    var that = this;
    this.updating = false;

    this.update = function(passData, postMethod) {
        if (that.updating == true) {
            return false;
        }
        that.updating = true;
        var AJAX = null;
        if (window.XMLHttpRequest) {
            AJAX = new XMLHttpRequest();
        } else {
            AJAX = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (AJAX == null) {
            return false;
        } else {
            AJAX.onreadystatechange = function() {
                if (AJAX.readyState == 4) {
                    that.updating = false;
                    that.callback(AJAX.responseText, AJAX.status, AJAX.responseXML);
                    delete AJAX;
                }
            }
            var timestamp = new Date();
            if (postMethod == 'POST') {
                var uri = urlCall + '?' + timestamp.getTime();
                AJAX.open("POST", uri, true);
                AJAX.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                AJAX.send(passData);
            } else {
                var uri = urlCall + '?' + passData + '&timestamp=' + (timestamp * 1);
                AJAX.open("GET", uri, true);
                AJAX.send(null);
            }
            return true;
        }
    }
    var urlCall = url;
    this.callback = callbackFunction || function () {
    };
}
