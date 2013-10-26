(function () {

    var defaultMatrix = SceneJS_math_lookAtMat4c(0, 0, 10, 0, 0, 0, 0, 1, 0);
    var defaultMat = new Float32Array(defaultMatrix);
    var normalMat = SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(defaultMat, SceneJS_math_mat4()));
    var defaultNormalMat = new Float32Array(normalMat);

    /**
     * The default state core singleton for {@link SceneJS.Lookat} nodes
     */
    var defaultCore = {
        type:"lookAt",
        stateId:SceneJS._baseStateId++,
        matrix:defaultMatrix,
        mat:defaultMat,
        normalMatrix:normalMat,
        normalMat:defaultNormalMat,
        lookAt:SceneJS_math_LOOKAT_ARRAYS
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.viewTransform = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines the viewing transform for the {@link SceneJS.Geometry}s within its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Lookat = SceneJS_NodeFactory.createNodeType("lookAt");

    SceneJS.Lookat.prototype._init = function (params) {

        this._mat = null;

        this._xf = {
            type:"lookat"
        };

        if (this._core.useCount == 1) { // This node is the resource definer

            this._core.eyeX = 0;
            this._core.eyeY = 0;
            this._core.eyeZ = 10.0;

            this._core.lookX = 0;
            this._core.lookY = 0;
            this._core.lookZ = 0;

            this._core.upX = 0;
            this._core.upY = 1;
            this._core.upZ = 0;

            if (!params.eye && !params.look && !params.up) {
                this.setEye({x:0, y:0, z:10.0 });
                this.setLook({x:0, y:0, z:0 });
                this.setUp({x:0, y:1.0, z:0 });
            } else {
                this.setEye(params.eye);
                this.setLook(params.look);
                this.setUp(params.up);
            }

            var core = this._core;

            var self = this;

            this._core.rebuild = function () {

                core.matrix = SceneJS_math_lookAtMat4c(
                    core.eyeX, core.eyeY, core.eyeZ,
                    core.lookX, core.lookY, core.lookZ,
                    core.upX, core.upY, core.upZ);

                core.lookAt = {
                    eye:[core.eyeX, core.eyeY, core.eyeZ ],
                    look:[core.lookX, core.lookY, core.lookZ ],
                    up:[core.upX, core.upY, core.upZ ]
                };

                if (!core.mat) { // Lazy-create arrays
                    core.mat = new Float32Array(core.matrix);
                    core.normalMat = new Float32Array(
                        SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(core.matrix, SceneJS_math_mat4())));

                } else { // Insert into arrays
                    core.mat.set(core.matrix);
                    core.normalMat.set(SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(core.matrix, SceneJS_math_mat4())));
                }

                self.publish("matrix", core.matrix);

                core.dirty = false;
            };

            this._core.dirty = true;

            // Rebuild on every scene tick
            // https://github.com/xeolabs/scenejs/issues/277
            this._tick = this.getScene().on("tick", function () {
                if (self._core.dirty) {
                    self._core.rebuild();
                }
            });
        }
    };

    /**
     * Returns the default view transformation matrix
     * @return {Float32Array}
     */
    SceneJS.Lookat.getDefaultMatrix = function () {
        return defaultMat;
    };

    SceneJS.Lookat.prototype.setEye = function (eye) {

        eye = eye || {};

        if (eye.x != undefined && eye.x != null) {
            this._core.eyeX = eye.x;
        }

        if (eye.y != undefined && eye.y != null) {
            this._core.eyeY = eye.y;
        }

        if (eye.z != undefined && eye.z != null) {
            this._core.eyeZ = eye.z;
        }

        this._core.dirty = true;
        this._engine.display.imageDirty = true;

        return this;
    };

    SceneJS.Lookat.prototype.incEye = function (eye) {
        eye = eye || {};
        this._core.eyeX += (eye.x != undefined && eye.x != null) ? eye.x : 0;
        this._core.eyeY += (eye.y != undefined && eye.y != null) ? eye.y : 0;
        this._core.eyeZ += (eye.z != undefined && eye.z != null) ? eye.z : 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setEyeX = function (x) {
        this._core.eyeX = x || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setEyeY = function (y) {
        this._core.eyeY = y || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setEyeZ = function (z) {
        this._core.eyeZ = z || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incEyeX = function (x) {
        this._core.eyeX += x;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incEyeY = function (y) {
        this._core.eyeY += y;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incEyeZ = function (z) {
        this._core.eyeZ += z;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.getEye = function () {
        return {
            x:this._core.eyeX,
            y:this._core.eyeY,
            z:this._core.eyeZ
        };
    };

    SceneJS.Lookat.prototype.setLook = function (look) {
        look = look || {};

        if (look.x != undefined && look.x != null) {
            this._core.lookX = look.x;
        }

        if (look.y != undefined && look.y != null) {
            this._core.lookY = look.y;
        }

        if (look.z != undefined && look.z != null) {
            this._core.lookZ = look.z;
        }

        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incLook = function (look) {
        look = look || {};
        this._core.lookX += (look.x != undefined && look.x != null) ? look.x : 0;
        this._core.lookY += (look.y != undefined && look.y != null) ? look.y : 0;
        this._core.lookZ += (look.z != undefined && look.z != null) ? look.z : 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setLookX = function (x) {
        this._core.lookX = x || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setLookY = function (y) {
        this._core.lookY = y || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setLookZ = function (z) {
        this._core.lookZ = z || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incLookX = function (x) {
        this._core.lookX += x;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incLookY = function (y) {
        this._core.lookY += y;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incLookZ = function (z) {
        this._core.lookZ += z;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.getLook = function () {
        return {
            x:this._core.lookX,
            y:this._core.lookY,
            z:this._core.lookZ
        };
    };

    SceneJS.Lookat.prototype.setUp = function (up) {
        up = up || {};

        if (up.x != undefined && up.x != null) {
            this._core.upX = up.x;
        }

        if (up.y != undefined && up.y != null) {
            this._core.upY = up.y;
        }

        if (up.z != undefined && up.z != null) {
            this._core.upZ = up.z;
        }

        this._core.dirty = true;
        this._engine.display.imageDirty = true;

        return this;
    };

    SceneJS.Lookat.prototype.incUp = function (up) {
        up = up || {};
        this._core.upX += (up.x != undefined && up.x != null) ? up.x : 0;
        this._core.upY += (up.y != undefined && up.y != null) ? up.y : 0;
        this._core.upZ += (up.z != undefined && up.z != null) ? up.z : 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setUpX = function (x) {
        this._core.upX = x || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setUpY = function (y) {
        this._core.upY = y || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.setUpZ = function (z) {
        this._core.upZ = z || 0;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incUpX = function (x) {
        this._core.upX += x;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incUpY = function (y) {
        this._core.upY += y;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.incUpZ = function (z) {
        this._core.upZ += z;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Lookat.prototype.getUp = function () {
        return {
            x:this._core.upX,
            y:this._core.upY,
            z:this._core.upZ
        };
    };

    /**
     * Returns a copy of the matrix as a 1D array of 16 elements
     * @returns {Number[16]}
     */
    SceneJS.Lookat.prototype.getMatrix = function () {

        if (this._core.dirty) {
            this._core.rebuild();
        }

        return  this._mat.slice(0);
    };

    SceneJS.Lookat.prototype.getAttributes = function () {
        return {
            look:{
                x:this._core.lookX,
                y:this._core.lookY,
                z:this._core.lookZ
            },
            eye:{
                x:this._core.eyeX,
                y:this._core.eyeY,
                z:this._core.eyeZ
            },
            up:{
                x:this._core.upX,
                y:this._core.upY,
                z:this._core.upZ
            }
        };
    };

    SceneJS.Lookat.prototype._compile = function (ctx) {
        this._engine.display.viewTransform = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.viewTransform = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.Lookat.prototype._destroy = function () {
        // Stop publishing matrix on each tick
        this.getScene().off(this._tick);
    };

})();