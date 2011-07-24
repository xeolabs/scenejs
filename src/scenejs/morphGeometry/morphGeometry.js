new (function() {

    var idStack = [];
    var morphStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setMorph(idStack[stackLen - 1], morphStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setMorph();
                    }
                    dirty = false;
                }
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
            return _createMorph(scene, createTypedMorph(source), options);
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
            targets: [],
            key1: 0,
            key2: 1
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
                SceneJS._apply(createMorphGeometry(this.scene, this._createMorphData(params), params.options), this.core);
            }
            
            this.setFactor(params.factor);
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
            targets : targets,
            key1 : 0,
            key2 : 1,
            factor: 0
        };
    };

    MorphGeometry.prototype.getState = function() {
        return this.core;
    };

    MorphGeometry.prototype.getStream = function() {
        return this._stream;
    };

    MorphGeometry.prototype.setFactor = function(factor) {
        factor = factor || 0.0;

        var core = this.core;

        var keys = core.keys;
        var key1 = core.key1;
        var key2 = core.key2;

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

        /* Normalise factor to range [0.0..1.0] for the target frame
         */
        core.factor = (factor - keys[key1]) / (keys[key2] - keys[key1]);
        core.key1 = key1;
        core.key2 = key2;
    };

    MorphGeometry.prototype.getFactor = function() {
        return this.core.factor;
    };

    MorphGeometry.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
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