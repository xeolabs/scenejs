(function() {

    var idStack = [];
    var tagStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setTag(idStack[stackLen - 1], tagStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setTag();
                    }
                    dirty = false;
                }
            });

    var Tag = SceneJS.createNodeType("tag");

    Tag.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node defines the resource
            if (!params.tag) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "tag node attribute missing : 'tag'");
            }
            this.core.tag = "enabled";
            this.setTag(params.tag);
        }
    };

    Tag.prototype.setTag = function(tag) {
        var core = this.core;
        core.tag = tag;
        core.pattern = null;
        core.matched = false;

    };

    Tag.prototype.getTag = function() {
        return this.core.tag;
    };

    Tag.prototype._compile = function() {
        idStack[stackLen] = this.attr.id;
        tagStack[stackLen] = this.core;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };
})();