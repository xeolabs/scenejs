/**
 * Backend that manages scene shader.
 *
 * @private
 */
var SceneJS_shaderModule = new (function() {

    var idStack = new Array(255);
    var shaderStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setShader(idStack[stackLen-1], shaderStack[stackLen - 1]);
                    } else {
                        SceneJS_renderModule.setShader();
                    }
                    dirty = false;
                }
            });

    this.pushShaders = function(id, shaders) {
        idStack[stackLen] = id;
        shaderStack[stackLen] = shaders;
        stackLen++;
        dirty = true;
    };

    this.popShaders = function() {
        stackLen--;
        dirty = true;
    };
})();

