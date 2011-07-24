new (function() {

    var idStack = [];
    var fogStack = [];
    var stackLen = 0;
    var dirty;

    function colourToArray(v, fallback) {
        return v ?
               [
                   v.r != undefined ? v.r : fallback[0],
                   v.g != undefined ? v.g : fallback[1],
                   v.b != undefined ? v.b : fallback[2]
               ] : fallback;
    }

    function _createFog(f) {
        f = f || {};
        if (f.mode &&
            (f.mode != "disabled"
                    && f.mode != "constant"
                    && f.mode != "exp"
                    && f.mode != "exp2"
                    && f.mode != "linear")) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "SceneJS.fog node has a mode of unsupported type - should be 'disabled', 'constant', 'exp', 'exp2' or 'linear'");
        }
        if (f.mode == "disabled") {
            return {
                mode: f.mode || "exp"
            };
        } else {
            return {
                mode: f.mode || "disabled",
                color: colourToArray(f.color, [ 0.5,  0.5, 0.5 ]),
                density: f.density || 1.0,
                start: f.start || 0,
                end: f.end || 0
            };
        }
    }

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setFog(idStack[stackLen - 1], fogStack[stackLen - 1]);
                    } else { // Full compile supplies it's own default states
                        SceneJS_DrawList.setFog();
                    }
                    dirty = false;
                }
            });

    function pushFog(id, fog) {
        idStack[stackLen] = id;
        fogStack[stackLen] = _createFog(fog);
        stackLen++;
        dirty = true;
    }

    function popFog() {
        stackLen--;
        dirty = true;
    }

    var Fog = SceneJS.createNodeType("fog");

    Fog.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node defines the resource
            this.setMode(params.mode);
            this.setColor(params.color);
            this.setDensity(params.density);
            this.setStart(params.start);
            this.setEnd(params.end);
        }
    };

    Fog.prototype.setMode = function(mode) {
        mode = mode || "disabled";
        if (mode != "disabled" && mode != "constant" && mode != "exp" && mode != "exp2" && mode != "linear") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "fog has a mode of unsupported type: '" + mode + " - should be 'disabled', 'constant', 'exp', 'exp2' or 'linear'");
        }
        this.core.mode = mode;
    };

    Fog.prototype.getMode = function() {
        return this.core.mode;
    };

    Fog.prototype.setColor = function(color) {
        color = color || {};
        this.core.color = {
            r : color.r != undefined ? color.r : 0.5,
            g : color.g != undefined ? color.g : 0.5,
            b : color.b != undefined ? color.b : 0.5
        };
    };

    Fog.prototype.getColor = function() {
        return {
            r: this.core.color.r,
            g: this.core.color.g,
            b: this.core.color.b
        };
    };

    Fog.prototype.setDensity = function(density) {
        this.core.density = density || 1.0;
    };

    Fog.prototype.getDensity = function() {
        return this.core.density;
    };

    Fog.prototype.setStart = function(start) {
        this.core.start = start || 0;
    };

    Fog.prototype.getStart = function() {
        return this.core.start;
    };

    Fog.prototype.setEnd = function(end) {
        this.core.end = end || 0;
    };

    Fog.prototype.getEnd = function() {
        return this.core.end;
    };

    Fog.prototype.getAttributes = function() {
        return {
            mode: this.core.mode,
            color: {
                r: this.core.color.r,
                g: this.core.color.g,
                b: this.core.color.b
            },
            density: this.core.density,
            start: this.core.start,
            end: this.core.end
        };
    };

    Fog.prototype._compile = function() {
        this._preCompile();
        this._compileNodes();
        this._postCompile();
    };

    Fog.prototype._preCompile = function() {
        pushFog(this.attr.id, this.core);
    };

    Fog.prototype._postCompile = function() {
        popFog();
    };

})();