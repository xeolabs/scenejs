/**

 */
var SceneJS_stationaryModule = new (function() {

    var idStack = new Array(255);
    var stationaryStack = new Array(255);
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
                        SceneJS_renderModule.setStationary(idStack[stackLen-1], stationaryStack[stackLen - 1]);
                    } else {
                        SceneJS_renderModule.setStationary();
                    }
                    dirty = false;
                }
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushStationary = function(id) {
        idStack[stackLen] = id;
        stationaryStack[stackLen] = {};
        stackLen++;
        dirty = true;
    };

    this.popStationary = function() {
        stackLen--;
        dirty = true;
    };
})();

