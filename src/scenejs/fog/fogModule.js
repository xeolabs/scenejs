/**
 * Backend that manages scene fog.
 *
 * @private
 */
SceneJS._fogModule = new (function() {

    var fog;
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
                    && f.mode != "exp"
                    && f.mode != "exp2"
                    && f.mode != "linear")) {
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.InvalidNodeConfigException(
                    "SceneJS.fog node has a mode of unsupported type - should be 'none', 'exp', 'exp2' or 'linear'"));
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
                end: f.end || 1.0
            };
        }
    }

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                fog = _createFog();
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
                    SceneJS._eventModule.fireEvent(
                            SceneJS._eventModule.FOG_EXPORTED,
                            fog);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.setFog = function(f) {
        fog = _createFog(f);
        dirty = true;
    };

    this.getFog = function() {
        return fog;
    };

})();

