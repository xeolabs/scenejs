/**

 */
SceneJS._stationaryModule = new (function() {

    var idStack = new Array(255);
    var stationaryStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS._renderModule.setStationary(idStack[stackLen-1], stationaryStack[stackLen - 1]);
                    } else {
                        SceneJS._renderModule.setStationary();
                    }
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
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

