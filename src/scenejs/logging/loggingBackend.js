/**
 * Backend module to provide logging to backend modules and scene nodes, allows
 * logging node to set logging functions for selected scene subtrees.
 */
SceneJS._backends.installBackend(

        "logging",

        function(ctx) {

            var logging = {

                error:function(msg) {
                } ,

                warn:function(msg) {
                },

                info:function() {
                },

                debug:function() {
                }
            };

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED, // Set default logging for scene root
                    function() {
                        ctx.logging = {

                            error:function(msg) {
                                logging.error(msg);
                            } ,

                            warn:function(msg) {
                                logging.warn(msg);
                            },

                            info:function(msg) {
                                logging.info(msg);
                            },

                            debug:function(msg) {
                                logging.debug(msg);
                            }
                        };
                    });

            return { // Node-facing API

                getLogger: function() {
                    return ctx.logging;
                },

                setLogger : function(l) {
                    logging = l;
                }
            };
        });