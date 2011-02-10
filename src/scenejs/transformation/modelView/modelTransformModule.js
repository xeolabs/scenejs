/**
 * Backend that manages the current modelling transform matrices (modelling and normal).
 *
 * Services the scene modelling transform nodes, such as SceneJS.rotate, providing them with methods to set and
 * get the current modelling transform matrices.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MODEL_TRANSFORM_EXPORTED to pass the modelling matrix and inverse normal matrix as Float32Arrays to the
 * shading backend.
 *
 * Normal matrix and Float32Arrays are lazy-computed and cached on export to avoid repeatedly regenerating them.
 *
 * Avoids redundant export of the matrices with a dirty flag; they are only exported when that is set, which occurs
 * when transform is set by scene node, or on SCENE_COMPILING, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a MODEL_TRANSFORM_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
SceneJS._modelTransformModule = new (function() {

    var DEFAULT_TRANSFORM = {
        matrix : SceneJS._math_identityMat4(),
        fixed: true,
        identity : true
    };

    var idStack = new Array(255);
    var transformStack = new Array(255);
    var stackLen = 0;

    var nodeId;
    var transform;

    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                nodeId = null;
                transform = {
                    matrix : SceneJS._math_identityMat4(),
                    fixed: true,
                    identity : true
                };
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(SceneJS._eventModule.SHADER_RENDERING, exportTransform);

    function exportTransform() {
        if (dirty) {

            /* Lazy-create WebGL arrays
             */
            if (!transform.matrixAsArray) {
                transform.matrixAsArray = new Float32Array(transform.matrix);
            }
            if (!transform.normalMatrixAsArray) {
                transform.normalMatrixAsArray = new Float32Array(
                        SceneJS._math_transposeMat4(
                                SceneJS._math_inverseMat4(transform.matrix, SceneJS._math_mat4())));
            }
            SceneJS._renderModule.setModelTransform(nodeId, transform.matrixAsArray, transform.normalMatrixAsArray);
            dirty = false;
        }
    }

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
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
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.MODEL_TRANSFORM_UPDATED, transform);
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
        dirty = true;
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.MODEL_TRANSFORM_UPDATED, transform);        
    };

})();
