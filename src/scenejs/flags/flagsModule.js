/**
 * Backend that manages scene flags. These are pushed and popped by "flags" nodes
 * to enable/disable features for the subgraph. An important point to note about these
 * is that they never trigger the generation of new GLSL shaders - flags are designed
 * to switch things on/of with minimal overhead.
 *
 * @private
 */
var SceneJS_flagsModule = new (function() {

    var idStack = [];
    var flagStack = [];
    var stackLen = 0;
    var dirty;

    /* These flags are inherited, where not overidden, by all flags in a scene, in order to support
     * flag reading on randomly-accessed nodes. For example, this allows the renderer to check if
     * "picking" is set for some random node, without having to know if the flag is set on higher nodes.  
     */
    var DEFAULT_FLAGS = {
        fog: true,              // Fog enabled
        colortrans : true,      // Effect of colortrans enabled
        picking : true,         // Picking enabled
        clipping : true,        // User-defined clipping enabled
        enabled : true,         // Node not culled from traversal
        visible : true,         // Node visible - when false, everything happens except geometry draw
        transparent: false,     // Node transparent - works in conjunction with matarial alpha properties
        backfaces: true,        // Show backfaces
        frontface: "ccw"        // Default vertex winding for front face
    };

    this.flags = {}; // Flags at top of flag stack

    /** Creates flag set by inheriting flags off top of stack where not overridden
     */
    function createFlags(flags) {
        var newFlags = {};
        var topFlags = (stackLen > 0) ? flagStack[stackLen - 1] : DEFAULT_FLAGS;
        var flag;
        for (var name in flags) {
            if (flags.hasOwnProperty(name)) {
                newFlags[name] = flags[name];
            }
        }
        for (var name in topFlags) {
            if (topFlags.hasOwnProperty(name)) {
                flag = newFlags[name];
                if (flag == null || flag == undefined) {
                    newFlags[name] = topFlags[name];
                }
            }
        }
        return newFlags;
    }

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

    /* Make fresh flag stack for new render pass, containing default flags
     * to enable/disable various things for subgraph
     */
    var self = this;
    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                self.flags = DEFAULT_FLAGS;
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
                        SceneJS_renderModule.setFlags(idStack[stackLen - 1], self.flags);
                    } else   {
                        SceneJS_renderModule.setFlags();
                    }
                    dirty = false;
                }
            });

    this.preVisitNode = function(node) {
        var attr = node.attr;
        var flags = attr.flags;
        if (flags) {
            flags = createFlags(flags);
        } else {
            flags = (stackLen > 0) ? flagStack[stackLen - 1] : DEFAULT_FLAGS;
        }
        idStack[stackLen] = attr.id;
        flagStack[stackLen] = flags;
        stackLen++;
        dirty = true;
        this.flags = flags;
    };

    this.postVisitNode = function(node) {
        if (stackLen > 0 && idStack[stackLen - 1] === node.attr.id) {
            stackLen--;
            this.flags = (stackLen > 0) ? flagStack[stackLen - 1] : DEFAULT_FLAGS;
            dirty = true;
        }
    };

})();

