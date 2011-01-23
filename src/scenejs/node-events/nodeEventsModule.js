/**
 *
 *
 *  @private
 */
SceneJS._nodeEventsModule = new (function() {
    var idStack = new Array(255);
    var listenerStack = new Array(255);
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
                        SceneJS._renderModule.setRenderListeners(idStack[stackLen - 1], listenerStack.slice(0, stackLen));
                    } else {
                        SceneJS._renderModule.setRenderListeners();
                    }
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.preVisitNode = function(node) {
        var listener = node._listeners["rendered"];
        if (listener) {
            idStack[stackLen] = node._attr.id;
            listenerStack[stackLen] = listener.fn;
            listenerStack[stackLen] = function (params) {
                node._fireEvent("rendered", params);
            };

            stackLen++;
            dirty = true;
        }
    };

    this.postVisitNode = function(node) {
        if (node._attr.id == idStack[stackLen - 1]) {
            stackLen--;
            dirty = true;
        }
    };
})();

