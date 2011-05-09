/**
 *
 *
 *  @private
 */
var SceneJS_pickingModule = new (function() {
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
                        SceneJS_renderModule.setPickListeners(idStack[stackLen - 1], listenerStack.slice(0, stackLen));
                    } else {
                        SceneJS_renderModule.setPickListeners();
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
        var listeners = node._listeners["picked"];
        if (listeners) {
            idStack[stackLen] = node._attr.id;
            if (!node.__pickingModule_picked) {
                node.__pickingModule_picked = function (params, options) {
                    node._fireEvent("picked", params, options);
                };
            }
            listenerStack[stackLen] = node.__pickingModule_picked;
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

