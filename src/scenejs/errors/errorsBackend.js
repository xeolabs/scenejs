/**
 * Backend module that provides single point through which exceptions may be raised
 */
SceneJS._backends.installBackend(

        "error",

        function(ctx) {

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        time = (new Date()).getTime();
                        ctx.events.fireEvent(SceneJS._eventTypes.TIME_UPDATED, time);
                    });

            function fatalError(e) {
                ctx.events.fireEvent(SceneJS._eventTypes.ERROR,
                {
                    exception: e,
                    fatal: true
                });
                throw e;
            }

            function error(e) {
                ctx.events.fireEvent(SceneJS._eventTypes.ERROR,
                {
                    exception: e,
                    fatal: false
                });
            }

            ctx.error = { // Backend-facing API
                fatalError : fatalError,
                error : error
            };

            return {
                fatalError : fatalError,
                error : error
            };
        });
