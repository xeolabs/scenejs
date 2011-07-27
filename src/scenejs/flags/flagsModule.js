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
        transparent: false,     // Node transparent - works in conjunction with matarial alpha properties
        backfaces: true,        // Show backfaces
        frontface: "ccw"        // Default vertex winding for front face
    };

    /** Creates flag set by inheriting flags off top of stack where not overridden
     */
    function createFlags(flags) {
        var newFlags = {};
        var topFlags = (stackLen > 0) ? flagStack[stackLen - 1] : DEFAULT_FLAGS;
        var flag;
        var name;
        for (name in flags) {
            if (flags.hasOwnProperty(name)) {
                newFlags[name] = flags[name];
            }
        }
        for (name in topFlags) {
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
                        SceneJS_DrawList.setFlags(idStack[stackLen - 1], flagStack[stackLen - 1]);
                    } else { // Full compile supplies it's own default states
                        SceneJS_DrawList.setFlags();
                    }
                    dirty = false;
                }
            });

    this.preVisitNode = function(node) {
        var attr = node.attr;
        var flags = attr.flags;
        if (flags) {
            flags = createFlags(flags);  // TODO: very inefficient
        } else {
            flags = (stackLen > 0) ? flagStack[stackLen - 1] : DEFAULT_FLAGS;
        }
        idStack[stackLen] = attr.id;
        flagStack[stackLen] = flags;
        stackLen++;
        dirty = true;
    };

    this.postVisitNode = function(node) {
        if (stackLen > 0 && idStack[stackLen - 1] === node.attr.id) {
            stackLen--;
            dirty = true;
        }
    };

    var Flags = SceneJS.createNodeType("flags");

    Flags.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node defines the resource
            if (!params.flags) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "flags node 'flags' attribute missing ");
            }
            this.setFlags(params.flags);
        }
    };

    Flags.prototype.setFlags = function(flags) {
        this.core.flags = SceneJS._shallowClone(flags);
    };

    Flags.prototype.addFlags = function(flags) {
        SceneJS._apply(flags, this.core.flags);
    };

    Flags.prototype.getFlags = function() {
        return SceneJS._shallowClone(this.core.flags);
    };

    Flags.prototype._compile = function() {
        var flags = this.core.flags;

        flags = createFlags(flags);  // TODO: very inefficient

        idStack[stackLen] = this.attr.id;
        flagStack[stackLen] = flags;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };



    var Mask = SceneJS.createNodeType("mask");

    Mask.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node defines a core
            if (!params.mask) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "mask node 'mask' attribute missing ");
            }
            this.setMask(params.mask);
        }
    };

    Mask.prototype.setMask = function(mask) {
        this.core.mask = SceneJS._shallowClone(mask);
    };

    Mask.prototype.addMask = function(mask) {
        SceneJS._apply(mask, this.core.mask);
    };

    Mask.prototype.getMask = function() {
        return SceneJS._shallowClone(this.core.mask);
    };

    Mask.prototype._compile = function() {
        var mask = this.core.mask;

        mask = createFlags(mask);  // TODO: very inefficient

        idStack[stackLen] = this.attr.id;
        flagStack[stackLen] = mask;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };
})();






