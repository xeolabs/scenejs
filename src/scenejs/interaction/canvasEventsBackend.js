/**
 * Backend that asynchronously converts canvas events into SceneJS events.
 *
 * For example, on a "mousedown" event on a canvas that is connected to a scene, this backend imediately fires
 * a MOUSE_DOWN event parameterised with the scene ID, the canvas and the original HTML5 canvas event.
 *
 */
SceneJS._backends.installBackend(

        "canvasEvents",

        function(ctx) {

            var sceneMap = {};
            var sceneEntry;
            var canvasEntry;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_CREATED,
                    function(params) {
                        var se = {
                            sceneId: params.sceneId,
                            canvasMap : {}
                        };
                        sceneMap[params.sceneId] = se;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function(params) {
                        sceneEntry = sceneMap[params.sceneId];
                        canvasEntry = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(canvas) {
                        canvasEntry = sceneEntry.canvasMap[canvas.canvasId];
                        if (!canvasEntry) {
                            var sceneId = sceneEntry.sceneId;
                            canvasEntry = {
                                canvas: canvas.canvas,
                                buffers: {
                                    mouseDown: []
                                },
                                handlers : {}
                            };
                            canvasEntry.mouseDown = function(e) {
                                canvasEntry.buffers.mouseDown.push({
                                    sceneId: sceneId,
                                    canvas:  canvas,
                                    event: e
                                });
                            };
                            canvas.canvas.addEventListener('mousedown', canvasEntry.mouseDown, false);
                            sceneEntry.canvasMap[canvas.canvasId] = canvasEntry;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvasEntry = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_DEACTIVATED,
                    function() {
                        sceneEntry = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_DESTROYED,
                    function(params) {
                        var se = sceneMap[params.sceneId];
                        for (var canvasId in se.canvasMap) {
                            var l = se.canvasMap[canvasId];
                            l.canvas.removeEventListener('mousedown', l.mouseDown, false);
                        }
                        sceneMap[params.sceneId] = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        sceneMap = {};
                    });

            ctx.canvasEvents = {
                getEvent:function(type) {
                    return canvasEntry.buffers[type].pop();
                }
            };
        });

