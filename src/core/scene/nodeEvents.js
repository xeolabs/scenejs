/**
 * Manages scene node event listeners
 * @private
 */
var SceneJS_nodeEventsModule = new (function () {

    var idStack = [];
    var listenerStack = [];
    var stackLen = 0;
    var dirty;

    var defaultCore = {
        type:"listeners",
        stateId:SceneJS._baseStateId++,
        empty:true,
        listeners:[]
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function () {
            stackLen = 0;
            dirty = true;
        });

    SceneJS_events.addListener(
        SceneJS_events.OBJECT_COMPILING,
        function (params) {
            if (dirty) {
                if (stackLen > 0) {
                    var core = {
                        type:"listeners",
                        stateId:idStack[stackLen - 1],
                        listeners:listenerStack.slice(0, stackLen)
                    };
                    params.display.renderListeners = core;
                } else {
                    params.display.renderListeners = defaultCore;
                }
                dirty = false;
            }
        });


    this.preVisitNode = function (node) {

        var renderedSubs = node._topicSubs["rendered"]; // DEPRECATED in V3.2
        var worldPosSubs = node._topicSubs["worldPos"];
        var viewPosSubs = node._topicSubs["viewPos"];
        var cameraPosSubs = node._topicSubs["cameraPos"];
        var projPosSubs = node._topicSubs["projPos"];
        var canvasPosSubs = node._topicSubs["canvasPos"];

        if (worldPosSubs || viewPosSubs || cameraPosSubs || projPosSubs || canvasPosSubs) {
            idStack[stackLen] = node.id;

            listenerStack[stackLen] = function (event) {

                // Don't retain - callback must get positions for
                // required coordinate via methods on the event object.
                // That's dirty, therefore deprecated.
                if (renderedSubs) {
                    node.publish("rendered", event, true); // DEPRECATED in V3.2
                }

                // Publish retained positions for coordinate systems where subscribed
                if (worldPosSubs) {
                    node.publish("worldPos", event.getWorldPos());
                }
                if (viewPosSubs) {
                    node.publish("viewPos", event.getViewPos());
                }
                if (cameraPosSubs) {
                    node.publish("cameraPos", event.getCameraPos());
                }
                if (projPosSubs) {
                    node.publish("projPos", event.getProjPos());
                }
                if (canvasPosSubs) {
                    node.publish("canvasPos", event.getCanvasPos());
                }
            };

            stackLen++;
            dirty = true;
        }
    };

    this.postVisitNode = function (node) {
        if (node.id == idStack[stackLen - 1]) {
            stackLen--;
            dirty = true;
        }
    };

})();

