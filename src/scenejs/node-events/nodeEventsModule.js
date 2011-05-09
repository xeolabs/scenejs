/**
 *
 *
 *  @private
 */
var SceneJS_nodeEventsModule = new (function() {
    var idStack = new Array(255);
    var listenerStack = new Array(255);
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
                        SceneJS_renderModule.setRenderListeners(idStack[stackLen - 1], listenerStack.slice(0, stackLen));
                    } else {
                        SceneJS_renderModule.setRenderListeners();
                    }
                    dirty = false;
                }
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.preVisitNode = function(node) {
        var listener = node._listeners["rendered"];
        if (listener) {
            idStack[stackLen] = node._attr.id;
            listenerStack[stackLen] = listener.fn;
            if (!node.__nodeEvents_rendered) {
                node.__nodeEvents_rendered = function (params) {
                    node._fireEvent("rendered", params);
                };
            }
            listenerStack[stackLen] = node.__nodeEvents_rendered;
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

