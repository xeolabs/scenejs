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
                        SceneJS_renderModule.setRenderListeners(idStack[stackLen - 1], listenerStack.slice(0, stackLen));
                    } else {
                        SceneJS_renderModule.setRenderListeners();
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


/**
 *
 *
 *  @private
 */
//var SceneJS_nodeEventsModule = new (function() {
//    var idStack = new Array(255);
//    var listenerStack = new Array(255);
//    var sparseStack = new Array(255);
//    var listenerStackLen = 0;
//    var idStackLen = 0;
//    var dirty;
//
//    SceneJS_eventModule.addListener(
//            SceneJS_eventModule.SCENE_COMPILING,
//            function() {
//                idStackLen = 0;
//                listenerStackLen = 0;
//                dirty = true;
//            });
//
//    SceneJS_eventModule.addListener(
//            SceneJS_eventModule.SCENE_RENDERING,
//            function() {
//                if (dirty) {
//                    if (idStackLen > 0) {
//                        SceneJS_renderModule.setRenderListeners(idStack[idStackLen - 1], listenerStack.slice(0, listenerStackLen));
//                    } else {
//                        SceneJS_renderModule.setRenderListeners();
//                    }
//                    dirty = false;
//                }
//            });
//
//    this.preVisitNode = function(node) {
//        var listeners = node.listeners["rendered"];
//        if (listeners && listeners.length > 0) {
//            listenerStack[listenerStackLen++] = function (params) {
//                node._fireEvent("rendered", params);
//            };
//            sparseStack[idStackLen] = true;
//
//        } else {
//            sparseStack[idStackLen] = false;
//        }
//        idStack[idStackLen++] = node.attr.id;
//        dirty = true;
//    };
//
//    this.postVisitNode = function(node) {
//        if (idStackLen > 0) {
//            if (idStackLen[idStackLen - 1] == node.attr.id) {
//                idStackLen--;
//                if (sparseStack[idStackLen]) {
//                    listenerStackLen--;
//                }
//            }
//        }
//        dirty = true;
//    };
//})();


