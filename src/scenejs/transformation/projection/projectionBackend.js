/**
 * Backend for projection nodes
 */
SceneJS._backends.installBackend(

        "projection",

        function(ctx) {

            var transform;
            var loaded;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        transform = {
                            matrix : SceneJS._math.identityMat4(),
                            fixed: true
                        };
                        loaded = false;
                    });

            /** When a new program is activated we will need to lazy-load our current matrix
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        loaded = false;
                    });

            /** When a program is deactivated we may need to re-load into the previously active program
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        loaded = false;
                    });

            /**
             * Lazy-load transform matrix only when geometry about to render
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_RENDERING,
                    function() {
                        if (!loaded) {

                            /* Lazy-compute WebGL array
                             */
                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                                    [
                                        SceneJS._webgl.shaderVarNames.PROJECTION_MATRIX,    // Name
                                        transform.matrixAsArray                             // Value
                                    ]);
                            loaded = true;
                        }
                    });

            return { // Node- facing API

                setTransform: function(t) {
                    transform = t;
                    loaded = false;
                    ctx.events.fireEvent(SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED, transform);
                },

                getTransform: function() {
                    return transform;
                }
            };
        });