/**
 * Backend that manages scene flags. These are pushed and popped by "flags" nodes
 * to enable/disable features for the subgraph. An important point to note about these
 * is that they never trigger the generation of new GLSL shaders - flags are designed
 * to switch things on/of with minimal overhead.
 *
 */
var SceneJS_flagsModule = new (function() {

    var idStack = [];
    var flagStack = [];
    var stackLen = 0;
    var dirty;

    /**
     * Maps renderer node properties to WebGL context enums
     * @private
     */
    var glEnum = function(context, name) {
        if (!name) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Null SceneJS.renderer node config: \"" + name + "\"");
        }
        var result = SceneJS_webgl_enumMap[name];
        if (!result) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Unrecognised SceneJS.renderer node config value: \"" + name + "\"");
        }
        var value = context[result];
        if (!value) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "This browser's WebGL does not support renderer node config value: \"" + name + "\"");
        }
        return value;
    };

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    /* Export flags when renderer needs them - only when current set not exported (dirty)
     */
    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setFlags(idStack[stackLen - 1], flagStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setFlags();
                    }
                    dirty = false;
                }
            });

    var Flags = SceneJS.createNodeType("flags");

    Flags.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node defines the resource
            if (!params.flags) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "flags node 'flags' attribute missing ");
            }
            this.core.flags = {};
            this.setFlags(params.flags);
        }
    };

    Flags.prototype.setFlags = function(flags) {
        SceneJS._apply(flags, this.core.flags, true); // Node's flags object is shared with drawlist node   
    };

    Flags.prototype.addFlags = function(flags) {
        SceneJS._apply(flags, this.core.flags);
    };

    Flags.prototype.getFlags = function() {
        return SceneJS._shallowClone(this.core.flags);
    };

    Flags.prototype._compile = function() {
        idStack[stackLen] = this.attr.id;
        flagStack[stackLen] = this.core.flags;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };
})();