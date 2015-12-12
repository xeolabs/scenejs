new (function () {

    /**
     * The default state core singleton for {@link SceneJS.MorphGeometry} nodes
     */
    var defaultCore = {
        type: "morphGeometry",
        stateId: SceneJS._baseStateId++,
        hash: "",
        //         empty: true,
        morph: null
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.morphGeometry = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines morphing behaviour for the {@link SceneJS.Geometry}s within its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.MorphGeometry = SceneJS_NodeFactory.createNodeType("morphGeometry");

    SceneJS.MorphGeometry.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node defines the resource

            this._pickPositionsDirty = true;

            this._buildNodeCore(params);

            this._core.webglRestored = function () {
                //self._buildNodeCore(self._engine.canvas.gl, self._core);
            };

            var self = this;

            // For the morph target at the given index,
            // returns a positions VBO for triangle-picking,
            // lazy-generated from the given indices if not yet existing.

            this._core.getPickPositions = function (index, indices) {
                if (self._pickPositionsDirty) {
                    self._buildPickPositions(indices);
                }
                return self._core.targets[index].pickPositionsBuf;
            };

            this.setFactor(params.factor);
        }

        this._core.factor = params.factor || 0;
        this._core.clamp = !!params.clamp;
    };

    SceneJS.MorphGeometry.prototype._buildNodeCore = function (data) {

        var targetsData = data.targets || [];
        if (targetsData.length < 2) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "morphGeometry node should have at least two targets");
        }

        var keysData = data.keys || [];
        if (keysData.length != targetsData.length) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "morphGeometry node mismatch in number of keys and targets");
        }

        var core = this._core;
        var gl = this._engine.canvas.gl;
        var usage = gl.STATIC_DRAW; //var usage = (!arrays.fixed) ? gl.STREAM_DRAW : gl.STATIC_DRAW;

        core.keys = keysData;
        core.targets = [];
        core.key1 = 0;
        core.key2 = 1;

        /* First target's arrays are defaults for where not given on previous and subsequent targets.
         * When target does have array, subsequent targets without array inherit it.
         */

        var positions;
        var normals;
        var uv;
        var uv2;

        var targetData;

        for (var i = 0, len = targetsData.length; i < len; i++) {
            targetData = targetsData[i];
            if (!positions && targetData.positions) {
                positions = targetData.positions;
            }
            if (!normals && targetData.normals) {
                normals = targetData.normals;
            }
            if (!uv && targetData.uv) {
                uv = targetData.uv;
            }
            if (!uv2 && targetData.uv2) {
                uv2 = targetData.uv2;
            }
        }

        try {
            var target;
            var arry;

            for (var i = 0, len = targetsData.length; i < len; i++) {
                targetData = targetsData[i];
                target = {};

                arry = targetData.positions || positions;
                if (arry) {
                    target.positions = (arry.constructor == Float32Array) ? arry : new Float32Array(arry);
                    target.vertexBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, target.positions, arry.length, 3, usage);
                    positions = arry;
                }

                arry = targetData.normals || normals;
                if (arry) {
                    target.normals = (arry.constructor == Float32Array) ? arry : new Float32Array(arry);
                    target.normalBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, target.normals, arry.length, 3, usage);
                    normals = arry;
                }

                arry = targetData.uv || uv;
                if (arry) {
                    target.uv = (arry.constructor == Float32Array) ? arry : new Float32Array(arry);
                    target.uvBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, target.uv, arry.length, 2, usage);
                    uv = arry;
                }

                arry = targetData.uv2 || uv2;
                if (arry) {
                    target.uv2 = (arry.constructor == Float32Array) ? arry : new Float32Array(arry);
                    target.uvBuf2 = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, target.uv2, arry.length, 2, usage);
                    uv2 = arry;
                }

                core.targets.push(target);  // We'll iterate this to destroy targets when we recover from error
            }

        } catch (e) {

            /* Allocation failure - deallocate target VBOs
             */
            for (var i = 0, len = core.targets.length; i < len; i++) {

                target = core.targets[i];

                if (target.vertexBuf) {
                    target.vertexBuf.destroy();
                }
                if (target.normalBuf) {
                    target.normalBuf.destroy();
                }
                if (target.uvBuf) {
                    target.uvBuf.destroy();
                }
                if (target.uvBuf2) {
                    target.uvBuf2.destroy();
                }
            }

            throw SceneJS_error.fatalError(
                SceneJS.errors.ERROR,
                "Failed to allocate VBO(s) for morphGeometry: " + e);
        }

        this._pickPositionsDirty = true;
    };

    SceneJS.MorphGeometry.prototype._buildPickPositions = function (indices) {

        var core = this._core;
        var target = null;
        var pickPositions;
        var gl = this._engine.canvas.gl;
        var usage = gl.STATIC_DRAW;

        // On each morph target, build a positions array for
        // color-indexed triangle-picking.

        for (var i = 0, len = core.targets.length; i < len; i++) {

            target = core.targets[i];

            if (target.positions) {

                if (target.pickPositionsBuf) {
                    target.pickPositionsBuf.destroy();
                    target.pickPositionsBuf = null;
                }

                pickPositions = SceneJS_math_getPickPositions(target.positions, indices);

                target.pickPositionsBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(pickPositions), pickPositions.length, 3, usage);
            }
        }

        this._pickPositionsDirty = false;
    };

    SceneJS.MorphGeometry.prototype.setFactor = function (factor) {
        factor = factor || 0.0;

        var core = this._core;

        var keys = core.keys;
        var key1 = core.key1;
        var key2 = core.key2;

        var oldFactor = core.factor;

        if (factor < keys[0]) {
            key1 = 0;
            key2 = 1;

        } else if (factor > keys[keys.length - 1]) {
            key1 = keys.length - 2;
            key2 = key1 + 1;

        } else {
            while (keys[key1] > factor) {
                key1--;
                key2--;
            }
            while (keys[key2] < factor) {
                key1++;
                key2++;
            }
        }

        var frameUpdate = key1 != core.key1;

        /* Normalise factor to range [0.0..1.0] for the target frame
         */
        core.factor = (factor - keys[key1]) / (keys[key2] - keys[key1]);

        this._factor = factor;

        var morphUpdate = frameUpdate || oldFactor != core.factor;

        core.key1 = key1;
        core.key2 = key2;

        if (morphUpdate) {
            var currentFrame = this.getCurrentFrame();
            this.publish("update", currentFrame);
            if (frameUpdate) {
                this.publish("frameUpdate", currentFrame);
            }
        }

        this._engine.display.imageDirty = true;
    };

    SceneJS.MorphGeometry.prototype.getFactor = function () {
        return this._factor;
    };

    SceneJS.MorphGeometry.prototype.getKeys = function () {
        return this._core.keys;
    };

    SceneJS.MorphGeometry.prototype.getTargets = function () {
        return this._core.targets;
    };

    SceneJS.MorphGeometry.prototype.getCurrentFrame = function () {
        var core = this._core;
        var key1 = core.key1;
        var key2 = core.key2;
        return {
            key1: key1,
            key2: key2,
            factor: core.factor,
            target1: core.targets[key1],
            target2: core.targets[key2]
        }
    };

    SceneJS.MorphGeometry.prototype._compile = function (ctx) {

        if (!this._core.hash) {
            this._makeHash();
        }

        this._engine.display.morphGeometry = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.morphGeometry = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.MorphGeometry.prototype._makeHash = function () {
        var core = this._core;
        if (core.targets.length > 0) {
            var target0 = core.targets[0];  // All targets have same arrays
            var t = "t";
            var f = "f";
            core.hash = ([
                target0.vertexBuf ? t : f,
                target0.normalBuf ? t : f,
                target0.uvBuf ? t : f,
                target0.uvBuf2 ? t : f
            ]).join("");
        } else {
            core.hash = "";
        }
    };

    SceneJS.MorphGeometry.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Destroy core if no other references
            if (document.getElementById(this._engine.canvas.canvasId)) { // Context won't exist if canvas has disappeared
                var core = this._core;
                var target;
                for (var i = 0, len = core.targets.length; i < len; i++) {
                    target = core.targets[i];
                    if (target.vertexBuf) {
                        target.vertexBuf.destroy();
                    }
                    if (target.pickPositionsBuf) {
                        target.pickPositionsBuf.destroy();
                    }
                    if (target.normalBuf) {
                        target.normalBuf.destroy();
                    }
                    if (target.uvBuf) {
                        target.uvBuf.destroy();
                    }
                    if (target.uvBuf2) {
                        target.uvBuf2.destroy();
                    }
                }
            }
        }
    };

})();