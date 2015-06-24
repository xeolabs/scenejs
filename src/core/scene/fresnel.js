/**
 * @class Scene graph node which defines fresnels to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Fresnel} nodes
    var defaultCore = {
        type: "fresnel",
        stateId: SceneJS._baseStateId++,
        bias:0.0,
        power: 1.0,
        topColor:[ 1.0, 1.0, 1.0 ],
        bottomColor:[ 0.0, 0.0, 0.0 ],
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
                    params.applyTo != "emit") {

                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "fresnel applyTo value is unsupported - should be either 'color', 'specular', 'alpha', 'reflect' or 'emit'");
                }
            }

            this._core.applyTo = params.applyTo;
        }

        this.setBias(params.bias);
        this.setPower(params.power);
        this.setTopColor(params.topColor);
        this.setBottomColor(params.bottomColor);
    };

    SceneJS.Fresnel.prototype.getApplyTo = function () {
        return this._core.applyTo;
    };

    SceneJS.Fresnel.prototype.setBias = function (bias) {
        this._core.bias = (bias !== undefined && bias !== null) ? bias : defaultCore.bias;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Fresnel.prototype.getBias = function () {
        return this._core.bias;
    };

    SceneJS.Fresnel.prototype.setPower = function (power) {
        this._core.power = (power !== undefined && power !== null) ? power : defaultCore.power;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Fresnel.prototype.getPower = function () {
        return this._core.power;
    };

    SceneJS.Fresnel.prototype.setTopColor = function (color) {
        var defaultTopColor = defaultCore.topColor;
        this._core.topColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultTopColor[0],
            color.g != undefined && color.g != null ? color.g : defaultTopColor[1],
            color.b != undefined && color.b != null ? color.b : defaultTopColor[2]
        ] : defaultCore.topColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Fresnel.prototype.getTopColor = function () {
        return {
            r:this._core.topColor[0],
            g:this._core.topColor[1],
            b:this._core.topColor[2]
        };
    };

    SceneJS.Fresnel.prototype.setBottomColor = function (color) {
        var defaultBottomColor = defaultCore.bottomColor;
        this._core.bottomColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultBottomColor[0],
            color.g != undefined && color.g != null ? color.g : defaultBottomColor[1],
            color.b != undefined && color.b != null ? color.b : defaultBottomColor[2]
        ] : defaultCore.bottomColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Fresnel.prototype.getBottomColor = function () {
        return {
            r:this._core.bottomColor[0],
            g:this._core.bottomColor[1],
            b:this._core.bottomColor[2]
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
        }

        this._makeHash(this.__core);

        coreStack[stackLen++] = this.__core;

        this._engine.display.fresnel = this.__core;
        this._compileNodes(ctx);
        this._engine.display.fresnel = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
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