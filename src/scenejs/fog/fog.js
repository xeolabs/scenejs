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
                        SceneJS_renderModule.setFog(idStack[stackLen - 1], fogStack[stackLen - 1]);
                    } else  {
                        SceneJS_renderModule.setFog();
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
        this.setMode(params.mode);
        this.setColor(params.color);
        this.setDensity(params.density);
        this.setStart(params.start);
        this.setEnd(params.end);
    };

    Fog.prototype.setMode = function(mode) {
        mode = mode || "disabled";
        if (mode != "disabled" && mode != "constant" && mode != "exp" && mode != "exp2" && mode != "linear") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "fog has a mode of unsupported type: '" + mode + " - should be 'disabled', 'constant', 'exp', 'exp2' or 'linear'");
        }
        this.attr.mode = mode;
    };

    Fog.prototype.getMode = function() {
        return this.attr.mode;
    };

    Fog.prototype.setColor = function(color) {
        color = color || {};
        this.attr.color = {
            r : color.r != undefined ? color.r : 0.5,
            g : color.g != undefined ? color.g : 0.5,
            b : color.b != undefined ? color.b : 0.5
        };
    };

    Fog.prototype.getColor = function() {
        return {
            r: this.attr.color.r,
            g: this.attr.color.g,
            b: this.attr.color.b
        };
    };

    Fog.prototype.setDensity = function(density) {
        this.attr.density = density || 1.0;
    };

    Fog.prototype.getDensity = function() {
        return this.attr.density;
    };

    Fog.prototype.setStart = function(start) {
        this.attr.start = start || 0;
    };

    Fog.prototype.getStart = function() {
        return this.attr.start;
    };

    Fog.prototype.setEnd = function(end) {
        this.attr.end = end || 0;
    };

    Fog.prototype.getEnd = function() {
        return this.attr.end;
    };

    Fog.prototype.getAttributes = function() {
        return {
            mode: this.attr.mode,
            color: {
                r: this.attr.color.r,
                g: this.attr.color.g,
                b: this.attr.color.b
            },
            density: this.attr.density,
            start: this.attr.start,
            end: this.attr.end
        };
    };

    Fog.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Fog.prototype._preCompile = function() {
        pushFog(this.attr.id, this.attr);
    };

    Fog.prototype._postCompile = function() {
        popFog();
    };

})();