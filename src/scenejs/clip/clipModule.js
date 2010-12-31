/**
 * Backend that manages scene clipping planes.
 *
 * @private
 */
SceneJS._clipModule = new (function() {

    var clipStack;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                clipStack = [];
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
                    if (clipStack.length > 0) {
                        SceneJS._shaderModule.addClips(clipStack.slice(0));
                    }
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushClip = function(clip) {
        clipStack.push(clip);
        dirty = true;
    };

    this.popClip = function() {
        clipStack.pop();
        dirty = true;
    };

})();

