/**
 * @class Scene graph node which defines fresnels to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Fresnel} nodes
    var defaultCore = {
        type: "fresnel",
        stateId: SceneJS._baseStateId++,
        centerBias: 1.0,
        edgeBias: 0.0,
        power: 1.0,
        centerColor:[ 1.0, 1.0, 1.0 ],
        edgeColor:[ 0.0, 0.0, 0.0 ],
        empty: true,
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.fresnel = defaultCore;
            stackLen = 0;
        });

    var coreStack = [];
    var stackLen = 0;

    /**
     * @class Scene graph node which defines a fresnel to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Fresnel = SceneJS_NodeFactory.createNodeType("fresnel");

    SceneJS.Fresnel.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node is the resource definer

            if (params.applyTo) {
                if (params.applyTo != "color" &&
                    params.applyTo != "specular" &&
                    params.applyTo != "alpha" &&
                    params.applyTo != "reflect" &&
                    params.applyTo != "emit" &&
                    params.applyTo != "fragment") {

                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "fresnel applyTo value is unsupported - should be either 'color', 'specular', 'alpha', 'reflect', 'emit' or 'fragment'");
                }
            }

            this._core.applyTo = params.applyTo;

            this.setCenterBias(params.centerBias);
            this.setEdgeBias(params.edgeBias);
            this.setPower(params.power);
            this.setCenterColor(params.centerColor);
            this.setEdgeColor(params.edgeColor);
        }
    };

    SceneJS.Fresnel.prototype.getApplyTo = function () {
        return this._core.applyTo;
    };

    SceneJS.Fresnel.prototype.setCenterBias = function (centerBias) {
        this._core.centerBias = (centerBias !== undefined && centerBias !== null) ? centerBias : defaultCore.centerBias;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Fresnel.prototype.getCenterBias = function () {
        return this._core.centerBias;
    };

    SceneJS.Fresnel.prototype.setEdgeBias = function (edgeBias) {
        this._core.edgeBias = (edgeBias !== undefined && edgeBias !== null) ? edgeBias : defaultCore.edgeBias;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Fresnel.prototype.getEdgeBias = function () {
        return this._core.edgeBias;
    };

    SceneJS.Fresnel.prototype.setPower = function (power) {
        this._core.power = (power !== undefined && power !== null) ? power : defaultCore.power;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Fresnel.prototype.getPower = function () {
        return this._core.power;
    };

    SceneJS.Fresnel.prototype.setCenterColor = function (color) {
        var defaultCenterColor = defaultCore.centerColor;
        this._core.centerColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultCenterColor[0],
            color.g != undefined && color.g != null ? color.g : defaultCenterColor[1],
            color.b != undefined && color.b != null ? color.b : defaultCenterColor[2]
        ] : defaultCore.centerColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Fresnel.prototype.getCenterColor = function () {
        return {
            r:this._core.centerColor[0],
            g:this._core.centerColor[1],
            b:this._core.centerColor[2]
        };
    };

    SceneJS.Fresnel.prototype.setEdgeColor = function (color) {
        var defaultEdgeColor = defaultCore.edgeColor;
        this._core.edgeColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultEdgeColor[0],
            color.g != undefined && color.g != null ? color.g : defaultEdgeColor[1],
            color.b != undefined && color.b != null ? color.b : defaultEdgeColor[2]
        ] : defaultCore.edgeColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Fresnel.prototype.getEdgeColor = function () {
        return {
            r:this._core.edgeColor[0],
            g:this._core.edgeColor[1],
            b:this._core.edgeColor[2]
        };
    };
    
    SceneJS.Fresnel.prototype._compile = function (ctx) {

        if (!this.__core) {
            this.__core = this._engine._coreFactory.getCore("fresnel");
        }

        var parentCore = this._engine.display.fresnel;

        if (!this._core.empty) {
            this.__core.diffuse = this._core.applyTo == "color" ? this._core : parentCore.diffuse;
            this.__core.specular = this._core.applyTo == "specular" ? this._core : parentCore.specular;
            this.__core.alpha = this._core.applyTo == "alpha" ? this._core : parentCore.alpha;
            this.__core.reflect = this._core.applyTo == "reflect" ? this._core : parentCore.reflect;
            this.__core.emit = this._core.applyTo == "emit" ? this._core : parentCore.emit;
            this.__core.fragment = this._core.applyTo == "fragment" ? this._core : parentCore.fragment;
        }

        this._makeHash(this.__core);

        coreStack[stackLen++] = this.__core;

        this._engine.display.fresnel = this.__core;
        this._compileNodes(ctx);
        this._engine.display.fresnel = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Fresnel.prototype._makeHash = function (core) {
        var hash = [];
        if (core.diffuse) {
            hash.push("d;")
        }
        if (core.specular) {
            hash.push("s;")
        }
        if (core.alpha) {
            hash.push("a;")
        }
        if (core.reflect) {
            hash.push("r;")
        }
        if (core.emit) {
            hash.push("e;")
        }
        if (core.fragment) {
            hash.push("f;")
        }
        hash = hash.join("");
        if (core.hash != hash) {
            core.hash = hash;
        }
    };

    SceneJS.Fresnel.prototype._destroy = function () {
        if (this._core) {
            this._engine._coreFactory.putCore(this._core);
        }
    };

})();