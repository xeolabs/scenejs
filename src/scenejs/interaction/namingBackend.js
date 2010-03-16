/**
 * Backend that tracks which named scene subgraph is currently being traversed.
 *
 * Holds a current name path and services the SceneJS.name node, providing it with methods to
 * push and pop a name to and from the path. On each push or pop, fires a NAME_UPDATED event
 * to notify subscribers of changes to the path.
 *
 */
SceneJS._backends.installBackend(

        "naming",

        function(ctx) {

            var namePath = [];
            var map = {};
            var sceneMap;
            var canvasMap;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_CREATED,
                    function(params) {
                        map[params.sceneId] = { };
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function(params) {
                        namePath = [];
                        sceneMap = map[params.sceneId];
                        canvasMap = null;
                    });


            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(canvas) {
                        canvasMap = sceneMap[canvas.canvasId];
                        if (!canvasMap) {
                            canvasMap = {
                                canvasId: canvas.canvasId,
                                namePath : [],
                                namesByPath : {},
                                namesByColor : {},
                                colorMap : {},
                                redCount : 0,
                                blueCount : 0,
                                greenCount : 0
                            };
                            sceneMap[canvas.canvasId] = canvasMap;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvasMap = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_DEACTIVATED,
                    function() {
                        sceneMap = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_DESTROYED,
                    function(params) {
                        map[params.sceneId] = null;
                        sceneMap = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        map = {};
                    });

            ctx.names = {

                getByColor: function(color) {
                    if (!canvasMap) {
                        return null;
                    }
                    var key = color[0] + "." + color[1] + "." + color[2];
                    return canvasMap.namesByColor[key];
                },

                getByPath: function(path) {
                    if (!canvasMap) {
                        return null;
                    }
                    return canvasMap.namesByPath[path];
                }
            };

            function nextColor(canvasMap) {
                if (canvasMap.blueCount < 1) {
                    canvasMap.blueCount += 0.01;
                } else {
                    canvasMap.blueCount = 0;
                    if (canvasMap.greenCount < 1) {
                        canvasMap.greenCount += 0.01;
                    } else {
                        canvasMap.greenCount = 0;
                        if (canvasMap.redCount < 1) {
                            canvasMap.redCount += 0.01;
                        } else {
                            canvasMap.redCount = 0; // TODO: Handle running out of colours
                        }
                    }
                }
                return [canvasMap.redCount, canvasMap.greenCount, canvasMap.blueCount];
            }

            /* Node-facing API
             */
            return {

                pushName : function(name) {
                    if (!canvasMap) {
                        throw "No canvas active";
                    }
                    namePath.push(name);
                    var item = canvasMap.namesByPath[namePath];
                    if (!item) {
                        item = {
                            path : namePath,
                            color: nextColor(canvasMap)
                        };
                        canvasMap.namesByPath[namePath] = item;
                    }
                    ctx.events.fireEvent(SceneJS._eventTypes.NAME_UPDATED, item);
                },

                popName : function() {
                    namePath.pop();
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.NAME_UPDATED,
                            canvasMap.namesByPath[namePath]); // Can be null
                }
            };
        });