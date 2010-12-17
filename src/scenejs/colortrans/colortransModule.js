/**
 * Backend that manages the current color transforms.
 *
 * Services the colortrans scene node, providing it with methods to set and get the current color transforms.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a call to
 * setColortrans to set the material properties to the shading backend.
 *
 * Avoids redundant export of the colors transforms with a dirty flag; they are only set when that flag is set, which
 * occurs when color transforms is set by the colortrans node, or on SCENE_RENDERING, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 *  @private
 */
SceneJS._colortransModule = new (function() {
    var colortransStack = new Array(500);  // TODO: auto-grow stack
    var stackLen = 0;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                colortransStack = [];
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
                    SceneJS._shaderModule.setColortrans(stackLen > 0 ? colortransStack[stackLen - 1] : null);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });


    this.pushColortrans = function(trans) {
        colortransStack[stackLen++] = trans;
        dirty = true;
    };

    this.popColortrans = function() {
        stackLen--;
        dirty = true;
    };

})();
