var SceneJS_layerModule = new (function() {

    this.DEFAULT_LAYER_NAME = "___default";

    var layerStack = [];
    var idStack = [];
    var stackLen = 0;

    var dirty = true;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setLayer(idStack[stackLen - 1], layerStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setLayer();
                    }
                    dirty = false;
                }
            });

    var Layer = SceneJS.createNodeType("layer");

    Layer.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node defines the resource
            this.core.priority = params.priority || 0;
            this.core.enabled = params.enabled !== false; 
            this.setLayer(params.layer);
        }
    };

    Layer.prototype.setPriority = function(priority) {
        this.core.priority = priority;
    };

    Layer.prototype.getPriority = function() {
        return this.core.priority;
    };

    Layer.prototype.setEnabled = function(enabled) {
        this.core.enabled = enabled;
    };

    Layer.prototype.getEnabled = function() {
        return this.core.enabled;
    };

    Layer.prototype._compile = function() {
        layerStack[stackLen] = this.core;
        idStack[stackLen] = this.attr.id;
        stackLen++;

        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };
})();

