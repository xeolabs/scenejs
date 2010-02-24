/**
 * Backend module to provide logging to backend modules and scene nodes, allows
 * logging node to set logging functions for selected scene subtrees.
 */
SceneJS._backends.installBackend(

        "logging",

        function(ctx) {

            var activeSceneId;

            var funcs = {
            };

            var queues = {
            };

            function log(channel, message) {
                if (activeSceneId) {
                    message = activeSceneId + ": " + message;
                }
                var func = funcs[channel];
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
                    var func = funcs[channel];
                    if (func) {
                        for (var i = 0; i < queue.length; i++) {
                            func(queue[i]);
                        }
                        queues[channel] = [];
                    }
                }
            }

            ctx.logging = {

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
                    SceneJS._eventTypes.RESET,
                    function() {
                        queues = {};
                        funcs = {};
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED, // Set default logging for scene root
                    function(params) {
                        activeSceneId = params.sceneId;
                        funcs = {};
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED, // Set default logging for scene root
                    function() {
                        funcs = {};
                    });

            return { // Node-facing API

                getLogger : function() {
                    return ctx.logging;
                },

                getFuncs: function() {
                    return funcs;
                },

                setFuncs : function(l) {
                    funcs = l;
                    for (var channel in queues) {
                        flush(channel);
                    }
                }
            };
        });