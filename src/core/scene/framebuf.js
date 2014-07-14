new (function () {

    var defaultCore = {
        type: "framebuf",
        stateId: SceneJS._baseStateId++,
        framebuf: null
    };

    // Map of framebuf nodes to cores, for reallocation on WebGL context restore
    var nodeCoreMap = {};

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.framebuf = defaultCore;
            stackLen = 0;
        });

    SceneJS_events.addListener(// Reallocate VBOs when context restored after loss
        SceneJS_events.WEBGL_CONTEXT_RESTORED,
        function () {
            for (var nodeId in nodeCoreMap) {
                if (nodeCoreMap.hasOwnProperty(nodeId)) {
                    nodeCoreMap[nodeId]._buildNodeCore();
                }
            }
        });

    /**
     * @class Scene graph node which sets up a frame buffer to which the {@link SceneJS.Geometry} nodes in its subgraph will be rendered.
     * The frame buffer may be referenced as an image source by successive {@link SceneJS.Texture} nodes.
     * @extends SceneJS.Node
     */
    SceneJS.Framebuf = SceneJS_NodeFactory.createNodeType("framebuf");

    SceneJS.Framebuf.prototype._init = function () {
        nodeCoreMap[this._core.coreId] = this;
        this._buildNodeCore();
    };

    SceneJS.Framebuf.prototype._buildNodeCore = function () {
        if (!this._core) {
            this._core = {};
        }
        this._core.framebuf = new SceneJS._webgl.RenderBuffer({ canvas: this._engine.canvas });
    };

    SceneJS.Framebuf.prototype._compile = function (ctx) {
        this._engine.display.framebuf = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.framebuf = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.Framebuf.prototype._destroy = function () {
        if (this._core) {
            delete nodeCoreMap[this._core.coreId];
        }
    };
})();