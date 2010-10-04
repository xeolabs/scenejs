/**
 * Backend that manages scene layers
 *
 * @private
 */
SceneJS._layerModule = new (function() {

    var layerStack;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                layerStack = [];
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
                            SceneJS._eventModule.LAYER_EXPORTED,
                            layerStack[layerStack.length - 1]);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushLayer = function(layer) {
        layerStack.push(layer);
        dirty = true;
    };

    this.popLayer = function() {
        layerStack.pop();
    };

})();

