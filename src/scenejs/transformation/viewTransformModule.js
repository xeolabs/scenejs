var SceneJS_viewTransformModule = new (function() {
    var DEFAULT_TRANSFORM = {
        matrix : SceneJS_math_identityMat4(),
        fixed: true,
        identity : true,
        lookAt:SceneJS_math_LOOKAT_ARRAYS
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
                transform = {
                    matrix : SceneJS_math_identityMat4(),
                    fixed: true,
                    identity : true
                };
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                loadTransform();
            });


    function loadTransform() {
        if (dirty) {
            if (stackLen > 0) {
                if (!transform.matrixAsArray) {
                    transform.matrixAsArray = new Float32Array(transform.matrix);
                }
                if (!transform.normalMatrixAsArray) {
                    transform.normalMatrixAsArray = new Float32Array(
                            SceneJS_math_transposeMat4(
                                    SceneJS_math_inverseMat4(transform.matrix, SceneJS_math_mat4())));
                }
                SceneJS_renderModule.setViewTransform(nodeId, transform.matrixAsArray, transform.normalMatrixAsArray, transform.lookAt);
            } else {
                SceneJS_renderModule.setViewTransform();
            }
            dirty = false;
        }
    }

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
        dirty = true;

        /*--------------------------------------------------------------
         * TODO: Vital to reload transform here for some reason.
         *
         * When removed, then there are mysterious cases when only
         * the lights are transformed by the lookAt.
         *------------------------------------------------------------*/
        loadTransform();
    };

})();