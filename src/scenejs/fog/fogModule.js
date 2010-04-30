/**
 * Backend that manages scene fog.
 *
 * @private
 */
var SceneJS_fogModule = new (function() {

    var fog;
    var dirty;

    // @private
    function colourToArray(v, fallback) {
        return v ?
               [
                   v.r != undefined ? v.r : fallback[0],
                   v.g != undefined ? v.g : fallback[1],
                   v.b != undefined ? v.b : fallback[2]
               ] : fallback;
    }

    // @private
    function _createFog(f) {
        if (f.mode &&
            (f.mode != "disabled"
                    && f.mode != "exp"
                    && f.mode != "exp2"
                    && f.mode != "linear")) {
            ctx.fatalError(new SceneJS.exceptions.InvalidNodeConfigException(
                    "SceneJS.fog node has a mode of unsupported type - should be 'none', 'exp', 'exp2' or 'linear'"));
        }
        if (f.mode == "disabled") {
            return {
                mode: f.mode || "exp"
            };
        } else {
            return {
                mode: f.mode || "exp",
                color: colourToArray(f.color, [ 0.5,  0.5, 0.5 ]),
                density: f.density || 1.0,
                start: f.start || 0,
                end: f.end || 1.0
            };
        }
    }

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                _createFog({});
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.FOG_EXPORTED,
                            fog);
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    /** Sets the current fog
     *
     * @private
     * @param f
     */
    this.setFog = function(f) {
        fog = f ? _createFog(f) : null;
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.FOG_UPDATED,
                fog);
    };

    /** Returns the current fog
     * @private
     */
    this.getFog = function() {
        return fog;
    };

})();

