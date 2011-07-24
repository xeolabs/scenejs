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
    this.transform = DEFAULT_TRANSFORM;

    var dirty;

    var self = this;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                nodeId = null;
                self.transform = {
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
                var t = self.transform;
                if (!t.matrixAsArray) {
                    t.matrixAsArray = new Float32Array(t.matrix);
                    t.normalMatrixAsArray = new Float32Array(
                            SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(t.matrix, SceneJS_math_mat4())));
                } else {
                    t.matrixAsArray.set(t.matrix);
                    t.normalMatrixAsArray.set(SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(t.matrix, SceneJS_math_mat4())));
                }
                SceneJS_DrawList.setViewTransform(nodeId, t.matrixAsArray, t.normalMatrixAsArray, t.lookAt);
            } else {
                SceneJS_DrawList.setViewTransform();
            }
            dirty = false;
        }
    }

    this.pushTransform = function(id, t) {
        idStack[stackLen] = id;
        transformStack[stackLen] = t;
        stackLen++;
        nodeId = id;
        this.transform = t;
        dirty = true;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.VIEW_TRANSFORM_UPDATED, this.transform);
        loadTransform();
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
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.VIEW_TRANSFORM_UPDATED, this.transform);
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