/**
 * @class Manages logging
 *  @private
 */
SceneJS.log = new (function() {

    var activeSceneId;
    var funcs = null;
    var queues = {};
    var indent = 0;
    var indentStr = "";

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING, // Set default logging for scene root
            function(params) {
                activeSceneId = params.engine.id;
            });

    SceneJS_events.addListener(
            SceneJS_events.RESET,
            function() {
                queues = {};
                funcs = null;
                activeSceneId = null;
            },
            100000);  // Really low priority - must be reset last

    this._setIndent = function(_indent) {
        indent = _indent;
        var indentArray = [];
        for (var i = 0; i < indent; i++) {
            indentArray.push("----");
        }
        indentStr = indentArray.join("");
    };

    this.error = function(msg) {
        this._log("error", msg);
    };

    this.warn = function(msg) {
        this._log("warn", msg);
    };

    this.info = function(msg) {
        this._log("info", msg);
    };

    this.debug = function(msg) {
        this._log("debug", msg);
    };

    this.setFuncs = function(l) {
        if (l) {
            funcs = l;
            for (var channel in queues) {
                this._flush(channel);
            }
        }
    };

    this._flush = function(channel) {
        var queue = queues[channel];
        if (queue) {
            var func = funcs ? funcs[channel] : null;
            if (func) {
                for (var i = 0; i < queue.length; i++) {
                    func(queue[i]);
                }
                queues[channel] = [];
            }
        }
    };

    this._log = function(channel, message) {
        if (SceneJS._isArray(message)) {
            for (var i = 0; i < message.length; i++) {
                this.__log(channel, message[i]);
            }
        } else {
            this.__log(channel, message);
        }
    };

    this.__log = function(channel, message) {
        message = activeSceneId
                ? indentStr + activeSceneId + ": " + message
                : indentStr + message;

        if (funcs && funcs[channel]) {
            funcs[channel](message);

        } else if (console && console[channel]) {
            console[channel](message);
        }
    };

    this.getFuncs = function() {
        return funcs;
    };

})();