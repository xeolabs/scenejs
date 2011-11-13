(function() {

    var idStack = [];
    var nameStack = [];
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
                        SceneJS_DrawList.setName(idStack[stackLen - 1], nameStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setName();
                    }
                    dirty = false;
                }
            });

    var Name = SceneJS.createNodeType("name");

    Name.prototype._init = function(params) {
     if (this.core._nodeCount == 1) {
            this.setName(params.name);
        }
    };

    Name.prototype.setName = function(name) {
        this.core.name = name || "unnamed";
    };

    Name.prototype._compile = function() {
        var id = this.attr.id;
        idStack[stackLen] = id;
        nameStack[stackLen] = this.core.name;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };
})();