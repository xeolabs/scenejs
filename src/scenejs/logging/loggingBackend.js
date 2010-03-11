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
 */
SceneJS._backends.installBackend(

        "logging",

        function(ctx) {

            var activeSceneId;
            var funcs = null;
            var queues = {};
            var indent = 0;
            var indentStr = "";

            function log(channel, message) {
                message = activeSceneId
                        ? indentStr + activeSceneId + ": " + message
                        : indentStr + message;
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

            ctx.logging = {

                setIndent:function(_indent) {
                    indent = _indent;
                    var indentArray = [];
                    for (var i = 0; i < indent; i++) {
                        indentArray.push("----");
                    }
                    indentStr = indentArray.join("");
                },

                error:function(msg) {
                    log("error", msg);
                } ,

                warn:function(msg) {
                    log("warn", msg);
                },

                info:function(msg) {
                    log("info", msg);
                },

                debug:function(msg) {
                    log("debug", msg);
                }
            };

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED, // Set default logging for scene root
                    function(params) {
                        activeSceneId = params.sceneId;
                        funcs = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_DEACTIVATED, // Set default logging for scene root
                    function() {
                        activeSceneId = null;
                        //funcs = {};
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        queues = {};
                        funcs = null;
                    },
                    100000);  // Really low priority - must be reset last

            return { // Node-facing API

                getLogger : function() {
                    return ctx.logging;
                },

                getFuncs: function() {
                    return funcs;
                },

                setFuncs : function(l) {
                    if (l) {
                        funcs = l;
                        for (var channel in queues) {
                            flush(channel);
                        }
                    }
                }
            };
        });