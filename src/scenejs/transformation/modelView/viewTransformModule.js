/**
 * Backend that manages the current view transform matrices (view and normal).
 *
 * Services the scene view transform nodes, such as SceneJS.lookAt, providing them with methods to set and
 * get the current view transform matrices.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * VIEW_TRANSFORM_EXPORTED to pass the view matrix and normal matrix as Float32Arrays to the
 * shading backend.
 *
 * Normal matrix and Float32Arrays are lazy-computed and cached on export to avoid repeatedly regenerating them.
 *
 * Avoids redundant export of the matrices with a dirty flag; they are only exported when that is set, which occurs
 * when transform is set by scene node, or on SCENE_COMPILING, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a VIEW_TRANSFORM_UPDATED to allow other
 * dependent backends (such as "view-frustum") to synchronise their resources.
 *
 *  @private
 */
var SceneJS_viewTransformModule = new (function() {
    var DEFAULT_TRANSFORM = {
        matrix : SceneJS_math_identityMat4(),
        fixed: true,
        identity : true,
        lookAt:SceneJS_math_LOOKAT
    };

    var idStack = new Array(255);
    var transformStack = new Array(255);
    var stackLen = 0;

    var nodeId;
    var transform;

    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                nodeId = null;
                transform = {
                    matrix : SceneJS_math_identityMat4(),
                    fixed: true,
                    identity : true
                };
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                loadTransform();
            });

    function loadTransform() {
        if (dirty) {

            /* Lazy-compute WebGL matrices
             */
            if (!transform.matrixAsArray) {
                transform.matrixAsArray = new Float32Array(transform.matrix);
            }
            if (!transform.normalMatrixAsArray) {
                transform.normalMatrixAsArray = new Float32Array(
                        SceneJS_math_transposeMat4(
                                SceneJS_math_inverseMat4(transform.matrix, SceneJS_math_mat4())));
            }
            SceneJS_renderModule.setViewTransform(nodeId, transform.matrixAsArray, transform.normalMatrixAsArray, transform.lookAt);
            dirty = false;
        }
    }

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushTransform = function(id, t) {
        idStack[stackLen] = id;
        transformStack[stackLen] = t;
        stackLen++;
        nodeId = id;
        transform = t;
        dirty = true;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.VIEW_TRANSFORM_UPDATED, transform);
       loadTransform();
    };

    this.getTransform = function() {
        return transform;
    };

    this.popTransform = function() {
        stackLen--;
        if (stackLen > 0) {
            nodeId = idStack[stackLen - 1];
            transform = transformStack[stackLen - 1];
        } else {
            nodeId = null;
            transform = DEFAULT_TRANSFORM;
        }
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.VIEW_TRANSFORM_UPDATED, transform);
        loadTransform();
        dirty = true;
    };

})();