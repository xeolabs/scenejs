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
            var canvas;
            var nameStack = [];
            var namePath = "";
            var namesByPath = {};
            var namesByColor = {};
            var colorMap = {};
            var redCount = 0;
            var blueCount = 0;
            var greenCount = 0;
            var item = null;

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(_canvas) {
                        canvas = _canvas;
                        nameStack = [];
                        namePath = "";
                        namesByPath = {};
                        namesByColor = {};
                        colorMap = {};
                        redCount = 0;
                        blueCount = 0;
                        greenCount = 0;
                        item = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                      //  if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.NAME_EXPORTED,
                                    item);
                        //}
                    });

            ctx.names = {

                getItemByColor: function(color) {
                    if (!canvas) {
                        return null;
                    }
                    var key = color[0] + "." + color[1] + "." + color[2];
                    return namesByColor[key];
                },

                getItemByPath: function(path) {
                    if (!canvas) {
                        return null;
                    }
                    return namesByPath[path];
                }
                //                ,
                //
                //                getCurrentItem: function() {
                //                    return item;
                //                }
            };

            function nextColor() {
                if (blueCount < 1) {
                    blueCount += 0.01;
                } else {
                    blueCount = 0;
                    if (greenCount < 1) {
                        greenCount += 0.01;
                    } else {
                        greenCount = 0;
                        if (redCount < 1) {
                            redCount += 0.01;
                        } else {
                            redCount = 0; // TODO: Handle running out of colours
                        }
                    }
                }
                return [redCount, greenCount, blueCount];
            }

            /* Node-facing API
             */
            return {

                pushName : function(name) {
                    if (!canvas) {
                        ctx.error.fatalError("No canvas active");
                    }
                    nameStack.push(name);
                    namePath = nameStack.join("/");
                    item = namesByPath[namePath];
                    if (!item) {
                        item = {
                            path : namePath,
                            color: nextColor()
                        };
                        namesByPath[namePath] = item;
                    }
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.NAME_UPDATED,
                            item);
                },

                popName : function() {
                    nameStack.pop();
                    namePath = nameStack.join("/");
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.NAME_UPDATED,
                            namesByPath[namePath]); // Can be null
                }
            };
        });