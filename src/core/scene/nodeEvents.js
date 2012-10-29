/**
 * Manages scene node event listeners
 * @private
 */
var SceneJS_nodeEventsModule = new (function() {

    var idStack = [];
    var listenerStack = [];
    var stackLen = 0;
    var dirty;

    var defaultCore = {
        type: "listeners",
        stateId: SceneJS._baseStateId++,
        empty: true,
        listeners:  []
    };

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_events.addListener(
            SceneJS_events.OBJECT_COMPILING,
            function(params) {

                if (dirty) {

                    if (stackLen > 0) {

                        var core = {
                            type: "listeners",
                            stateId: idStack[stackLen - 1],
                            listeners: listenerStack.slice(0, stackLen)
                        };

                        params.display.renderListeners = core;

                    } else {

                        params.display.renderListeners = defaultCore;
                    }

                    dirty = false;
                }
            });

    this.preVisitNode = function(node) {

        var listeners = node._listeners["rendered"];

        if (listeners && listeners.length > 0) {
            idStack[stackLen] = node.id;

            var fn = node.__fireRenderedEvent;
            if (!fn) {
                fn = node.__fireRenderedEvent = function (params) {
                    node._fireEvent("rendered", params);
                };
            }

            listenerStack[stackLen] = fn;
            stackLen++;
            dirty = true;
        }
    };

    this.postVisitNode = function(node) {
        if (node.id == idStack[stackLen - 1]) {
            stackLen--;
            dirty = true;
        }
    };

})();

