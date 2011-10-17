var SceneJS_nodeEventsModule = new (function() {
    var idStack = [];
    var listenerStack = [];
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
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setRenderListeners(idStack[stackLen - 1], listenerStack.slice(0, stackLen));
                    } else {
                        SceneJS_DrawList.setRenderListeners();
                    }
                    dirty = false;
                }
            });

    this.preVisitNode = function(node) {
        var listeners = node.listeners["rendered"];
        if (listeners && listeners.length > 0) {

            idStack[stackLen] = node.attr.id;
            listenerStack[stackLen] = function (params) {
                node._fireEvent("rendered", params);
            };
            stackLen++;

            dirty = true;
        }
    };

    this.postVisitNode = function(node) {
        if (node.attr.id == idStack[stackLen - 1]) {
            stackLen--;
            dirty = true;
        }
    };
})();

