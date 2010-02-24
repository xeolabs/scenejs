/**
 * Backend module that provides the current system time, updating it every time a scene is rendered
 */
SceneJS._backends.installBackend(

        "time",

        function(ctx) {

            var time = (new Date()).getTime();

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        time = (new Date()).getTime();
                        ctx.events.fireEvent(SceneJS._eventTypes.TIME_UPDATED, time);
                    });

            return { // Node-facing API

                getTime: function() {
                    return time;
                }
            };
        });
