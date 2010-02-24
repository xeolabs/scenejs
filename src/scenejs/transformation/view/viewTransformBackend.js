/**
 * Manages the current view transformation
 */
SceneJS._backends.installBackend(

        "view-transform",

        function(ctx) {

            var transform;
            var loaded = false;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        transform = {
                            matrix : SceneJS._math.identityMat4(),
                            fixed: true
                        };
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_RENDERING,
                    function() {
                        if (!loaded) {

                            /* Lazy-compute WebGL array - cool thing about this is that we only
                             * compute and memoize it for those matrices that actually get loaded
                             */
                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                                    [
                                        SceneJS._webgl.shaderVarNames.VIEW_MATRIX,
                                        transform.matrixAsArray
                                    ]);
                            loaded = true;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED, // May need to reload into last program
                    function() {
                        loaded = false;
                    });

            return { // Node-facing API

                setTransform : function(t) {
                    transform = t;
                    loaded = false;
                    ctx.events.fireEvent(SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED, transform);
                },

                getTransform : function() {
                    return transform;
                }
            };
        });