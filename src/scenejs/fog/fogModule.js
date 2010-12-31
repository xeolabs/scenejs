/**
 * Backend that manages scene fog.
 *
 * @private
 */
SceneJS._fogModule = new (function() {

    var fogStack;
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
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.InvalidNodeConfigException(
                            "SceneJS.fog node has a mode of unsupported type - should be 'disabled', 'constant', 'exp', 'exp2' or 'linear'"));
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

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                fogStack = [];
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._shaderModule.addFog(fogStack.length > 0 ? fogStack[fogStack.length - 1] : null);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushFog = function(f) {
        fogStack.push(_createFog(f));
        dirty = true;
    };

    this.popFog = function() {
        fogStack.pop();
        dirty = true;
    };

})();

