/**
 * Backend module to provide logging that is aware of the current location of scene traversal.
 *
 * There are three "channels" of log message: error, warning, info and debug.
 *
 * Provides an interface on the backend context through which other backends may log messages.
 *
 * Provides an interface to scene nodes to allow them to log messages, as well as set and get the function
 * that actually processes messages on each channel. Those getters and setters are used by the SceneJS.logging node,
 * which may be distributed throughout a scene graph to cause messages to be processed in particular ways for different
 * parts of the graph.
 *
 * Messages are queued. Initially, each channel has no function set for it and will queue messages until a function is
 * set, at which point the queue flushes.  If the function is unset, subsequent messages will queue, then flush when a
 * function is set again. This allows messages to be logged before any SceneJS.logging node is visited.
 *
 * This backend is always the last to handle a RESET
 *
 *  @private
 *
 */
var SceneJS_loggingModule = new (function() {

    var activeSceneId;
    var funcs = null;
    var queues = {};
    var indent = 0;
    var indentStr = "";

    var logToConsole = (typeof console == "object") ? function(msg) {
        console.log(msg);
    } : function() {
    };

    /**
     * @private
     */
    function log(channel, message) {
        message = activeSceneId
                ? indentStr + activeSceneId + ": " + message
                : indentStr + message;
        logToConsole(message);
        var func = funcs ? funcs[channel] : null;
        if (func) {
            func(message);
        } else {
            var queue = queues[channel];
            if (!queue) {
                queue = queues[channel] = [];
            }
            queue.push(message);
        }
    }

    /**
     * @private
     */
    function flush(channel) {
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
    }

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.LOGGING_ELEMENT_ACTIVATED,
            function(params) {
                var element = params.loggingElement;
                if (element) {
                    funcs = {
                        warn : function log(msg) {
                            element.innerHTML += "<p style=\"color:orange;\">" + msg + "</p>";
                        },
                        error : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkred;\">" + msg + "</p>";
                        },
                        debug : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkblue;\">" + msg + "</p>";
                        },
                        info : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkgreen;\">" + msg + "</p>";
                        }
                    };
                } else {
                    funcs = null;
                }
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING, // Set default logging for scene root
            function(params) {
                activeSceneId = params.sceneId;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERED, // Set default logging for scene root
            function() {
                activeSceneId = null;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
                queues = {};
                funcs = null;
            },
            100000);  // Really low priority - must be reset last

    // @private
    this.setIndent = function(_indent) {
        indent = _indent;
        var indentArray = [];
        for (var i = 0; i < indent; i++) {
            indentArray.push("----");
        }
        indentStr = indentArray.join("");
    };

    // @private
    this.error = function(msg) {
        log("error", msg);
    };

    // @private
    this.warn = function(msg) {
        log("warn", msg);
    };

    // @private
    this.info = function(msg) {
        log("info", msg);
    };

    // @private
    this.debug = function(msg) {
        log("debug", msg);
    };

    // @private
    this.getFuncs = function() {
        return funcs;
    };

    // @private
    this.setFuncs = function(l) {
        if (l) {
            funcs = l;
            for (var channel in queues) {
                flush(channel);
            }
        }
    };
})();