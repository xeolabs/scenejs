/**
 * Backend that tracks which named scene subgraph is currently being traversed.
 *
 * Holds a current name path and services the SceneJS.name node, providing it with methods to
 * push and pop a name to and from the path. On each push or pop, fires a NAME_UPDATED event
 * to notify subscribers of changes to the path.
 *
 *  @private
 */
var SceneJS_nameModule = new (function() {
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

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
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

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                //  if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
                SceneJS_eventModule.fireEvent(
                        SceneJS_eventModule.NAME_EXPORTED,
                        item);
                //}
            });

//    ctx.names = {
//
//        getItemByColor: function(color) {
//            if (!canvas) {
//                return null;
//            }
//            var key = color[0] + "." + color[1] + "." + color[2];
//            return namesByColor[key];
//        },
//
//        getItemByPath: function(path) {
//            if (!canvas) {
//                return null;
//            }
//            return namesByPath[path];
//        }
//        //                ,
//        //
//        //                getCurrentItem: function() {
//        //                    return item;
//        //                }
//    };

    // @private
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

    // @private
    this.pushName = function(name) {
        if (!canvas) {
            SceneJS_errorModule.fatalError("No canvas active");
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
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.NAME_UPDATED,
                item);
    };

    // @private
    this.popName = function() {
        nameStack.pop();
        namePath = nameStack.join("/");
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.NAME_UPDATED,
                namesByPath[namePath]); // Can be null
    };
})();