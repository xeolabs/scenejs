/**
 * Backend that manages the current projection transform matrix.
 *
 * Services the scene projection transform nodes, such as SceneJS.frustum, providing them with methods to set and
 * get the current projection matrix.
 *
 * Interacts with the shading backend through events; on a SCENE_RENDERING event it will respond with a
 * PROJECTION_TRANSFORM_EXPORTED to pass the projection matrix as a Float32Array to the shading backend.
 *
 * The Float32Array is lazy-computed and cached on export to avoid repeatedly regenerating it.
 *
 * Avoids redundant export of the matrix with a dirty flag; the matrix is only exported when the flag is set, which
 * occurs when the matrix is set by scene node, or on SCENE_COMPILING, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a PROJECTION_TRANSFORM_UPDATED to allow other
 * dependent backends (such as "view-frustum") to synchronise their resources.
 *
 *  @private
 */
var SceneJS_projectionModule = new (function() {

    var DEFAULT_TRANSFORM = {
        matrix : SceneJS_math_identityMat4(),
        fixed: true,
        isDefault : true
    };

    var idStack = [];
    var transformStack = [];
    var stackLen = 0;

    var nodeId;
    var transform;

    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                nodeId = null;
                transform = DEFAULT_TRANSFORM;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        if (!transform.matrixAsArray) {
                            transform.matrixAsArray = new Float32Array(transform.matrix);
                        }
                        SceneJS_renderModule.setProjectionTransform(nodeId, transform.matrixAsArray);
                    } else  {
                        SceneJS_renderModule.setProjectionTransform();
                    }
                    dirty = false;
                }
            });

    this.pushTransform = function(id, t) {
        idStack[stackLen] = id;
        transformStack[stackLen] = t;
        stackLen++;
        nodeId = id;
        transform = t;
        dirty = true;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED, transform);
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
            transform = {
                matrix : SceneJS_math_identityMat4(),
                fixed: true,
                isDefault : true
            };
        }
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED, transform);
        dirty = true;
    };
})();