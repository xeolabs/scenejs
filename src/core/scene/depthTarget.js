new (function () {

    var defaultCore = {
        type: "renderTarget",
        stateId: SceneJS._baseStateId++,
        targets: null
    };

    // Map of  nodes to cores, for reallocation on WebGL context restore
    var nodeCoreMap = {};

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.renderTarget = defaultCore;
            stackLen = 0;
        });

    // Reallocate VBOs when context restored after loss
    SceneJS_events.addListener(
        SceneJS_events.WEBGL_CONTEXT_RESTORED,
        function () {
            for (var nodeId in nodeCoreMap) {
                if (nodeCoreMap.hasOwnProperty(nodeId)) {
                    nodeCoreMap[nodeId]._buildNodeCore();
                }
            }
        });

    SceneJS.DepthTarget = SceneJS_NodeFactory.createNodeType("depthTarget");

    SceneJS.DepthTarget.prototype._init = function (params) {
        nodeCoreMap[this._core.coreId] = this;
        this._core.bufType = "depth";
        this._core.renderBuf = new SceneJS._webgl.RenderBuffer({ canvas: this._engine.canvas });
    };

    SceneJS.DepthTarget.prototype._compile = function (ctx) {
        if (!this.__core) {
            this.__core = this._engine._coreFactory.getCore("renderTarget");
        }
        var parentCore = this._engine.display.renderTarget;
        if (!this._core.empty) {
            this.__core.targets = (parentCore && parentCore.targets) ? parentCore.targets.concat([this._core]) : [this._core];
        }
        coreStack[stackLen++] = this.__core;
        this._engine.display.renderTarget = this.__core;
        this._compileNodes(ctx);
        this._engine.display.renderTarget = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };


    SceneJS.DepthTarget.prototype._destroy = function () {
        if (this._core) {
            if (this._core.renderBuf) {
                this._core.renderBuf.destroy();
            }
            delete nodeCoreMap[this._core.coreId];
        }
    };
})();