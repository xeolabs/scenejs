/**
 * Backend that manages the current color transforms.
 *
 * Services the colortrans scene node, providing it with methods to set and get the current color transforms.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a call to
 * setColortrans to set the material properties to the shading backend.
 *
 * Avoids redundant export of the colors transforms with a dirty flag; they are only set when that flag is set, which
 * occurs when color transforms is set by the colortrans node, or on SCENE_COMPILING, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 *  @private
 */
var SceneJS_colortransModule = new (function() {
    var idStack = new Array(255);
    var colortransStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setColortrans(idStack[stackLen - 1], colortransStack[stackLen - 1]);
                    } else {
                        SceneJS_renderModule.setColortrans();
                    }
                    dirty = false;
                }
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });


    this.pushColortrans = function(id, trans) {
        idStack[stackLen] = id;
        colortransStack[stackLen] = trans;
        stackLen++;
        dirty = true;
    };

    this.popColortrans = function() {
        stackLen--;
        dirty = true;
    };

})();
