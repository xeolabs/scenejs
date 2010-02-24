/**
 * Manages the current modelling transformation
 */
SceneJS._backends.installBackend(

        "model-transform",

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

            /**
             * Lazy-load matrix only when geometry about to render
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_RENDERING,
                    function() {
                        if (!loaded) {

                            /* Lazy-compute WebGL arrays
                             */
                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }

                            /* Lazy compute normal matrix
                             */
                            if (!transform.normalMatrixAsArray) {
                                transform.normalMatrixAsArray = new WebGLFloatArray(
                                        SceneJS._math.mat4To3(
                                                SceneJS._math.transposeMat4(
                                                        SceneJS._math.inverseMat4(transform.matrix))));
                            }
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                                    [
                                        SceneJS._webgl.shaderVarNames.MODEL_MATRIX,
                                        transform.matrixAsArray
                                    ]);
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                                    [
                                        SceneJS._webgl.shaderVarNames.NORMAL_MATRIX,
                                        transform.normalMatrixAsArray
                                    ]);
                            loaded = true;
                        }
                    });

            /** When a program is deactivated we may need to re-load into the previously active program
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        loaded = false;
                    });

            return {   // Node-facing API

                setTransform : function(t) {
                    transform = t;
                    loaded = false;
                    ctx.events.fireEvent(SceneJS._eventTypes.MODEL_TRANSFORM_UPDATED, transform);
                },

                getTransform : function() {
                    return transform;
                }
            };
        });
