/**
 * @class A scene node that defines morphing of geometry positions
 */
new (function() {

    var idStack = [];
    var morphStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function(params) {
                stackLen = 0;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {

                        /* Get top morph on stack
                         */
                        var morph = morphStack[stackLen - 1];
                        var factor = morph.factor;

                        /* Will hold target frame enclosing factor
                         */
                        var key1;
                        var key2;

                        /* Find the target frame
                         */
                        if (factor <= morph.keys[0]) {

                            /* Clamp to first target frame
                             */
                            factor = morph.keys[0];
                            key1 = 0;
                            key2 = 1;

                        } else {

                            if (factor >= morph.keys[morph.keys.length - 1]) {

                                /* Clamp to last target frame
                                 */
                                factor = morph.keys[morph.keys.length - 1];
                                key1 = morph.keys.length - 2;
                                key2 = morph.keys.length - 1;

                            } else {

                                /* Find target frame enclosing
                                 */
                                for (var i = morph.targets.length - 1; i >= 0; i--) {
                                    if (factor > morph.keys[i]) {
                                        key1 = i;
                                        key2 = i + 1; // Clamping to last ensures this is never out of range
                                        break;
                                    }
                                }
                            }
                        }

                        /* Normalise factor to range [0.0..1.0] for the target frame
                         */
                        var normalizedFactor = (factor - morph.keys[key1]) / (morph.keys[key2] - morph.keys[key1]);
                        SceneJS_renderModule.setMorph(idStack[stackLen - 1], { // Set factor and target frame on shader module
                            factor: normalizedFactor,
                            target1: morph.targets[key1],
                            target2: morph.targets[key2]
                        });

                    } else { // Set null morph
                        SceneJS_renderModule.setMorph();
                    }
                    dirty = false;
                }
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
//                for (var canvasId in canvasMorphs) {    // Destroy geometries on all canvases
//                    if (canvasMorphs.hasOwnProperty(canvasId)) {
//                        var morphs = canvasMorphs[canvasId];
//                        for (var resource in morphs) {
//                            if (morphs.hasOwnProperty(resource)) {
//                                var morph = morphs[resource];
//                                destroyMorph(morph);
//                            }
//                        }
//                    }
//                }
//                canvas = null;
//                canvasMorphs = {};
//                currentMorphs = null;
                stackLen = 0;
            });

    /**
     * Destroys morph, returning true if memory freed, else false
     * where canvas not found and morph was implicitly destroyed
     */
    function destroyMorph(morph) {
        if (document.getElementById(morph.canvas.canvasId)) { // Context won't exist if canvas has disappeared
            var target;
            for (var i = 0, len = morph.targets.length; i < len; i++) {
                target = morph.targets[i];
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
        }
    }


    function createMorphGeometry(scene, source, options, callback) {

        if (typeof source == "string") {

            /* Load from stream - http://scenejs.wikispaces.com/MorphGeoLoaderService
             */
            var geoService = SceneJS.Services.getService(SceneJS.Services.MORPH_GEO_LOADER_SERVICE_ID);
            geoService.loadMorphGeometry(source,
                    function(data) {
                        callback(_createMorph(scene, data, options));
                    });
        } else {

            /* Create from arrays
             */
            var data = createTypedMorph(source);
            return _createMorph(scene, data, options);
        }
    }

    function createTypedMorph(data) {
        var typedMorph = {
            keys: data.keys,
            targets: []
        };
        for (var i = 0, len = data.targets.length; i < len; i++) {
            typedMorph.targets.push(createTypedArrays(data.targets[i]));
        }
        return typedMorph;
    }

    function createTypedArrays(data) {
        return {
            positions: data.positions ? new Float32Array(data.positions) : undefined,
            normals: data.normals ? new Float32Array(data.normals) : undefined,
            uv: data.uv ? new Float32Array(data.uv) : undefined,
            uv2: data.uv2 ? new Float32Array(data.uv2) : undefined
        };
    }


    function _createMorph(scene, data, options) {

        var context = scene.canvas.context;

        var morph = {
            scene: scene,
            canvas: scene.canvas,
            keys: data.keys,
            targets: []
        };

        try {

            var usage = context.STATIC_DRAW;

            var target;
            var newTarget;

            for (var i = 0, len = data.targets.length; i < len; i++) {
                target = data.targets[i];
                newTarget = {};
                morph.targets.push(newTarget);  // We'll iterate this to destroy targets when we recover from error
                if (target.positions && target.positions.length > 0) {
                    newTarget.vertexBuf = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER,
                            target.positions, target.positions.length, 3, usage);
                }
                if (target.normals && target.normals.length > 0) {
                    newTarget.normalBuf = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER,
                            target.normals, target.normals.length, 3, usage);
                }
                if (target.uv && target.uv.length > 0) {
                    newTarget.uvBuf = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER,
                            target.uv, target.uv.length, 2, usage);
                }
                if (target.uv2 && target.uv2.length > 0) {
                    newTarget.uvBuf2 = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER,
                            target.uv2, target.uv2.length, 2, usage);
                }
            }

            return morph;

        } catch (e) {

            /* Allocation failure - deallocate all target VBOs
             */
            for (var i = 0, len = morph.targets.length; i < len; i++) {
                target = morph.targets[i];
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
            throw e;
        }
    }

    var MorphGeometry = SceneJS.createNodeType("morphGeometry");

    MorphGeometry.prototype._init = function(params) {

        if (this.core._nodeCount == 1) { // This node defines the resource

            if (params.create instanceof Function) {
                var data = this._createMorphData(params.create());
                SceneJS._apply(createMorphGeometry(this.scene, data, params.options), this.core);
            } else if (params.stream) {

                /* Load from stream
                 * TODO: Expose the arrays on the node
                 */
                this._stream = params.stream;
                this.core._loading = true;

                var self = this;
                createMorphGeometry(
                        this.scene,
                        this._stream,
                        params.options,
                        function(morph) {
                            SceneJS._apply(morph, self.core);
                            self.core._loading = false;
                            SceneJS_compileModule.nodeUpdated(self, "loaded"); // Compile again to apply freshly-loaded geometry
                        });
            } else {

                /* Create from arrays
                 */
                var data = this._createMorphData(params);
                SceneJS._apply(createMorphGeometry(this.scene, data, params.options), this.core);
            }
        }

        this.core.factor = params.factor || 0;
        this.core.clamp = !!params.clamp;
    };

    MorphGeometry.prototype._createMorphData = function(params) {
        var targets = params.targets || [];
        if (targets.length < 2) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "morphGeometry node should have at least two targets");
        }
        var keys = params.keys || [];
        if (keys.length != targets.length) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "morphGeometry node mismatch in number of keys and targets");
        }

        /* First target's arrays are defaults for where not given on subsequent targets
         */

        var positions;
        var normals;
        var uv;
        var uv2;
        var target;

        for (var i = 0, len = targets.length; i < len; i++) {
            target = targets[i];
            if (!positions && target.positions) {
                positions = target.positions.slice(0);
            }
            if (!normals && target.normals) {
                normals = target.normals.slice(0);
            }
            if (!uv && target.uv) {
                uv = target.uv.slice(0);
            }
            if (!uv2 && target.uv2) {
                uv2 = target.uv2.slice(0);
            }
        }

        for (var i = 0, len = targets.length; i < len; i++) {
            target = targets[i];
            if (!target.positions) {
                target.positions = positions;  // Can be undefined
            }
            if (!target.normals) {
                target.normals = normals;
            }
            if (!target.uv) {
                target.uv = uv;
            }
            if (!target.uv2) {
                target.uv2 = uv2;
            }
        }
        return {
            keys : keys,
            targets : targets
        }
    };

    MorphGeometry.prototype.getState = function() {
        return this.core;
    };

    MorphGeometry.prototype.getStream = function() {
        return this._stream;
    };

    MorphGeometry.prototype.setFactor = function(factor) {
        this.core.factor = factor || 0.0;
    };

    MorphGeometry.prototype.getFactor = function() {
        return this.core.factor;
    };

    MorphGeometry.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    MorphGeometry.prototype._preCompile = function() {
        if (!this.core._loading) {
            idStack[stackLen] = this.attr.id;
            morphStack[stackLen] = this.core;
            stackLen++;
            dirty = true;
        }
    };

    MorphGeometry.prototype._postCompile = function() {
        if (!this.core._loading) {
            stackLen--;
            dirty = true;
        }
    };

    MorphGeometry.prototype._destroy = function() {
        if (this.core._nodeCount == 1) { // Last resource user
            destroyMorph(this.core);
        }
    };

})();