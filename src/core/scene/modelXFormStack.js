/**
 * Provides a model transform stack in front of the renderer.
 * Nodes peek push and pop to the stack, while the renderer peeks at
 * the transform on the top of the stack whenever it builds a renderer node.
 *
 */
var SceneJS_modelXFormStack = new (function () {

    var defaultMatrix = SceneJS_math_identityMat4();
    var defaultMat = new Float32Array(defaultMatrix);

    var defaultNormalMatrix = SceneJS_math_transposeMat4(
        SceneJS_math_inverseMat4(
            SceneJS_math_identityMat4(),
            SceneJS_math_mat4()));
    var defaultNormalMat = new Float32Array(defaultNormalMatrix);

    var defaultCore = {
        type:"xform",
        stateId:SceneJS._baseStateId++,

        matrix:defaultMatrix,
        mat:defaultMat,

        normalMatrix:defaultNormalMatrix,
        normalMat:defaultNormalMat,

        parent:null, // Parent transform core
        cores:[], // Child transform cores
        numCores:0, // Number of child transform cores
        dirty:false, // Does this subtree need matrices rebuilt
        matrixDirty:false
    };

    var transformStack = [];
    var stackLen = 0;

    this.top = defaultCore;

    var dirty;

    var self = this;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function () {
            stackLen = 0;
            self.top = defaultCore;
            dirty = true;
        });

    SceneJS_events.addListener(
        SceneJS_events.OBJECT_COMPILING,
        function (params) {

            if (dirty) {

                if (stackLen > 0) {

                    params.display.modelTransform = transformStack[stackLen - 1];

                } else {

                    params.display.modelTransform = defaultCore;
                }

                dirty = false;
            }
        });

    /**
     * Creates a fresh transformation core
     * @param core
     */
    this.buildCore = function (core) {

        /*
         * Transform tree node properties
         */
        core.parent = null;         // Parent transform core
        core.cores = [];            // Child transform cores
        core.numCores = 0;          // Number of child transform cores
        core.matrixDirty = false;

        core.matrix = SceneJS_math_identityMat4();

        core.mat = new Float32Array(core.matrix);
        core.normalMat = new Float32Array(
            SceneJS_math_transposeMat4(
                SceneJS_math_inverseMat4(core.matrix, SceneJS_math_mat4())));

        core.dirty = false;         // Does this subtree need matrices rebuilt

        core.setDirty = function () {

            core.matrixDirty = true;

            if (core.dirty) {
                // return;
            }

            setDirty(core);
        };

        /**
         * Recursively flag this subtree of transforms cores as dirty,
         * ie. needing their matrices rebuilt.
         */
        function setDirty(core) {

            core.dirty = true;
            core.matrixDirty = true;

            for (var i = 0, len = core.numCores; i < len; i++) {
                setDirty(core.cores[i]);
            }
        }

        /**
         * Pre-multiply matrices at cores on path up to root into matrix at this core
         */
        core.build = function () {

            if (core.matrixDirty) {
                if (core.buildMatrix) { // Matrix might be explicit property on some transform node types
                    core.buildMatrix();
                }
                core.matrixDirty = false;
            }

            var parent = core.parent;

            var matrix;

            if (parent) {

                matrix = core.matrix.slice(0);

                while (parent) {

                    if (parent.matrixDirty) {

                        if (parent.buildMatrix) { // Matrix might be explicit property on some transform node types
                            parent.buildMatrix();
                        }
                        parent.mat.set(parent.matrix);
                        parent.normalMat.set(
                            SceneJS_math_transposeMat4(
                                SceneJS_math_inverseMat4(parent.matrix, SceneJS_math_mat4())));

                        parent.matrixDirty = false;
                    }

                    SceneJS_math_mulMat4(parent.matrix, matrix, matrix);

                    if (!parent.dirty) {
                        //   break;
                    }

                    //  parent.dirty = false;

                    parent = parent.parent;
                }

            } else {

                matrix = core.matrix;
            }

            //            if (!core.mat) {
            //
            //                core.mat = new Float32Array(matrix);
            //
            //                core.normalMat = new Float32Array(
            //                        SceneJS_math_transposeMat4(
            //                                SceneJS_math_inverseMat4(matrix, SceneJS_math_mat4())));
            //            } else {

            core.mat.set(matrix);

            core.normalMat.set(
                SceneJS_math_transposeMat4(
                    SceneJS_math_inverseMat4(matrix, SceneJS_math_mat4())));
            //}

            core.dirty = false;
        };
    };

    this.push = function (core) {

        transformStack[stackLen++] = core;

        core.parent = this.top;
        core.dirty = true;

        if (this.top) {
            this.top.cores[this.top.numCores++] = core;
        }

        core.numCores = 0;

        this.top = core;

        dirty = true;
    };

    this.pop = function () {

        this.top = (--stackLen > 0) ? transformStack[stackLen - 1] : defaultCore;

        dirty = true;
    };

})();
