/**
 * Backend that manages scene flags. These are pushed and popped by "flags" nodes
 * to enable/disable features for the subgraph. An important point to note about these
 * is that they never trigger the generation of new GLSL shaders - flags are designed
 * to switch things on/of with minimal overhead.
 *
 * @private
 */
SceneJS._flagsModule = new (function() {

    var flagStack = new Array(255);
    var stackLen = 0;
    var dirty;

    /** Creates flag set by inheriting flags off top of stack where not overridden
     */
    function createFlags(flags) {
        if (flagStack.length == 0) {
            return flags;
        }
        var topFlags = flagStack[stackLen - 1];
        for (var name in topFlags) {
            if (topFlags.hasOwnProperty(name)) {
                if (flags[name] == "undefined") {
                    flags[name] = topFlags[name];
                }
            }
        }
        return flags;
    }

    /* Make fresh flag stack for new render pass
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                flagStack = [
                    {
                        fog: true
                    }
                ];
                stackLen = 1;
                dirty = true;
            });

    /* Export flags when renderer needs them - only when current set not exported (dirty)
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._shaderModule.setFlags(flagStack[stackLen - 1]);
                    dirty = false;
                }
            });

    /*  
     */
    this.pushFlags = function(f) {
        flagStack[stackLen++] = createFlags(f);   // TODO: memoize flags?
        dirty = true;
    };

    /*
     */
    this.popFlags = function() {
        stackLen--;
        dirty = true;
    };

})();

