/**
 * Backend that manages the current projection transform matrix.
 *
 * Services the scene projection transform nodes, such as SceneJS.frustum, providing them with methods to set and
 * get the current projection matrix.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * PROJECTION_TRANSFORM_EXPORTED to pass the projection matrix as a WebGLFloatArray to the shading backend.
 *
 * The WebGLFloatArray is lazy-computed and cached on export to avoid repeatedly regenerating it.
 *
 * Avoids redundant export of the matrix with a dirty flag; the matrix is only exported when the flag is set, which
 * occurs when the matrix is set by scene node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a PROJECTION_TRANSFORM_UPDATED to allow other
 * dependent backends (such as "view-frustum") to synchronise their resources.
 */
var SceneJS_projectionModule = new (function() {

    var transform;
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                transform = {
                    matrix : SceneJS_math_identityMat4(),
                    fixed: true
                };
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    if (!transform.matrixAsArray) {
                        transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                    }
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.PROJECTION_TRANSFORM_EXPORTED,
                            transform);
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.setTransform = function(t) {
        transform = t;
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED,
                transform);
    };

    this.getTransform = function() {
        return transform;
    };
})();