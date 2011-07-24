var SceneJS_pickingModule = new (function() {
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
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setPickListeners(idStack[stackLen - 1], listenerStack.slice(0, stackLen));
                    } else  {
                        SceneJS_DrawList.setPickListeners();
                    }
                    dirty = false;
                }
            });

    this.preVisitNode = function(node) {
        var listeners = node.listeners["picked"];
        if (listeners) {
            idStack[stackLen] = node.attr.id;
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
        if (node.attr.id == idStack[stackLen - 1]) {
            stackLen--;
            dirty = true;
        }
    };
})();

