/**
 * Backend that manages scene clipping planes.
 *
 * @private
 */
SceneJS._clipModule = new (function() {
    var idStack = new Array(255);
    var clipStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
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
                    if (stackLen > 0) {
                        SceneJS._renderModule.setClips(idStack[stackLen - 1], clipStack.slice(0, stackLen));
                    } else {
                        SceneJS._renderModule.setClips();
                    }
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushClip = function(id, clip) {
        clipStack[stackLen] = clip;
        idStack[stackLen] = id;
        stackLen++;
        dirty = true;
    };

    this.popClip = function() {
        stackLen--;
        dirty = true;
    };

})();

