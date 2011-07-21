/**
 * Backend that manages the current modelling transform matrices (modelling and normal).
 *
 * Services the scene modelling transform nodes, such as SceneJS.rotate, providing them with methods to set and
 * get the current modelling transform matrices.
 *
 * Interacts with the shading backend through events; on a SCENE_RENDERING event it will respond with a
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
var SceneJS_modelTransformModule = new (function() {

    var DEFAULT_TRANSFORM = {
        matrix : SceneJS_math_identityMat4(),
        fixed: true,
        identity : true
    };

    var idStack = [];
    var transformStack = [];
    var stackLen = 0;

    var nodeId;
    this.transform = DEFAULT_TRANSFORM;

    var dirty;

    var self = this;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                nodeId = null;
                self.transform = DEFAULT_TRANSFORM;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function (params) {
                if (dirty) {
                    if (stackLen > 0) {
                        var t = self.transform;
                        if (!t.matrixAsArray) {
                            t.matrixAsArray = new Float32Array(t.matrix);
                            t.normalMatrixAsArray = new Float32Array(
                                    SceneJS_math_transposeMat4(
                                            SceneJS_math_inverseMat4(t.matrix, SceneJS_math_mat4())));
                        } else {
                            t.matrixAsArray.set(t.matrix);
                            t.normalMatrixAsArray.set(
                                    SceneJS_math_transposeMat4(
                                            SceneJS_math_inverseMat4(t.matrix, SceneJS_math_mat4())));
                        }
                        SceneJS_renderModule.setModelTransform(nodeId, t.matrixAsArray, t.normalMatrixAsArray);
                    } else {
                        SceneJS_renderModule.setModelTransform();
                    }
                    dirty = false;
                }
            });

    this.pushTransform = function(id, t) {
        idStack[stackLen] = id;
        transformStack[stackLen] = t;
        stackLen++;
        nodeId = id;
        this.transform = t;
        dirty = true;
    };

    this.popTransform = function() {
        stackLen--;
        if (stackLen > 0) {
            nodeId = idStack[stackLen - 1];
            this.transform = transformStack[stackLen - 1];            
        } else {
            nodeId = null;
            this.transform = DEFAULT_TRANSFORM;
        }
        dirty = true;
    };

})();
