new (function() {

    var idStack = [];
    var lightStack = [];
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
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setLights(idStack[stackLen - 1], lightStack.slice(0, stackLen));
                    } else { // Full compile supplies it's own default states
                        SceneJS_DrawList.setLights();
                    }
                    dirty = false;
                }
            });

    var Light = SceneJS.createNodeType("light");

    Light.prototype._init = function(params) {
        params = params || {};
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this.core.light = {
               viewSpace: !!params.viewSpace
            };
            this.setMode(params.mode);
            this.setColor(params.color);
            this.setDiffuse(params.diffuse);
            this.setSpecular(params.specular);
            this.setPos(params.pos);
            this.setDir(params.dir);
            this.setConstantAttenuation(params.constantAttenuation);
            this.setLinearAttenuation(params.linearAttenuation);
            this.setQuadraticAttenuation(params.quadraticAttenuation);
        }
    };

    Light.prototype.setMode = function(mode) {
        mode = mode || "dir";
        if (mode != "dir" && mode != "point") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Light unsupported mode - should be 'dir' or 'point' or 'ambient'");
        }
        this.core.light.mode = mode;
    };

    Light.prototype.getMode = function() {
        return this.core.light.mode;
    };

    Light.prototype.setColor = function(color) {
        color = color || {};
        this.core.light.color = [
            color.r != undefined ? color.r : 1.0,
            color.g != undefined ? color.g : 1.0,
            color.b != undefined ? color.b : 1.0
        ];
    };

    Light.prototype.getColor = function() {
        return {
            r: this.core.light.color[0],
            g: this.core.light.color[1],
            b: this.core.light.color[2] };
    };

    Light.prototype.setDiffuse = function (diffuse) {
        this.core.light.diffuse = (diffuse != undefined) ? diffuse : true;
    };

    Light.prototype.getDiffuse = function() {
        return this.core.light.diffuse;
    };

    Light.prototype.setSpecular = function (specular) {
        this.core.light.specular = specular || true;
    };

    Light.prototype.getSpecular = function() {
        return this.core.light.specular;
    };

    Light.prototype.setPos = function(pos) {
        pos = pos || {};
        this.core.light.pos = [ pos.x || 0.0, pos.y || 0.0, pos.z || 0.0 ];
    };

    Light.prototype.getPos = function() {
        return { x: this.core.light.pos[0], y: this.core.light.pos[1], z: this.core.light.pos[2] };
    };

    Light.prototype.setDir = function(dir) {
        dir = dir || {};
        this.core.light.dir = [ dir.x || 0.0, dir.y || 0.0, (dir.z == undefined || dir.z == null) ? -1 : dir.z ];
    };

    Light.prototype.getDir = function() {
        return { x: this.core.light.dir[0], y: this.core.light.dir[1], z: this.core.light.dir[2] };
    };

    Light.prototype.setConstantAttenuation = function (constantAttenuation) {
        this.core.light.constantAttenuation = (constantAttenuation != undefined) ? constantAttenuation : 1.0;
    };

    Light.prototype.getConstantAttenuation = function() {
        return this.core.light.constantAttenuation;
    };

    Light.prototype.setLinearAttenuation = function (linearAttenuation) {
        this.core.light.linearAttenuation = linearAttenuation || 0.0;
    };

    Light.prototype.getLinearAttenuation = function() {
        return this.core.light.linearAttenuation;
    };

    Light.prototype.setQuadraticAttenuation = function (quadraticAttenuation) {
        this.core.light.quadraticAttenuation = quadraticAttenuation || 0.0;
    };

    Light.prototype.getQuadraticAttenuation = function() {
        return this.core.light.quadraticAttenuation;
    };

    Light.prototype._compile = function() {
        var modelMat = SceneJS_modelTransformModule.transform.matrix;
        if (this.core.light.mode == "point") {
            this.core.light.worldPos = SceneJS_math_transformPoint3(modelMat, this.core.light.pos);
        } else if (this.core.light.mode == "dir") {
            this.core.light.worldDir = SceneJS_math_transformVector3(modelMat, this.core.light.dir);
        }
        idStack[stackLen] = this.attr.id;
        lightStack[stackLen] = this.core.light;
        stackLen++;
        dirty = true;

        this._compileNodes();
    };

})();