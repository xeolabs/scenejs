/**
 * Backend that manages the current modelling transform matrices (modelling and normal).
 *
 * Services the scene modelling transform nodes, such as SceneJS.rotate, providing them with methods to set and
 * get the current modelling transform matrices.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MODEL_TRANSFORM_EXPORTED to pass the modelling matrix and inverse normal matrix as WebGLFloatArrays to the
 * shading backend.
 *
 * Normal matrix and WebGLFloatArrays are lazy-computed and cached on export to avoid repeatedly regenerating them.
 *
 * Avoids redundant export of the matrices with a dirty flag; they are only exported when that is set, which occurs
 * when transform is set by scene node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a PROJECTION_TRANSFORM_UPDATED to allow other
 * dependent backends to synchronise their resources.
 */
SceneJS._backends.installBackend(

        "model-transform",

        function(ctx) {

            var transform;
            var dirty;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        transform = {
                            matrix : SceneJS_math_identityMat4(),
                            fixed: true,
                            identity : true
                        };
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {

                        if (dirty) {

                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }

                            if (!transform.normalMatrixAsArray) {
                                transform.normalMatrixAsArray = new WebGLFloatArray(
                                        SceneJS_math_transposeMat4(
                                                SceneJS_math_inverseMat4(transform.matrix)));
                            }

                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.MODEL_TRANSFORM_EXPORTED,
                                    transform);

                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });

            /* Node-facing API
             */
            return {

                setTransform : function(t) {
                    transform = t;
                    dirty = true;
                    ctx.events.fireEvent(SceneJS._eventTypes.MODEL_TRANSFORM_UPDATED, transform);
                },

                getTransform : function() {
                    return transform;
                }
            };
        });
