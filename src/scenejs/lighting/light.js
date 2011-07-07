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
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setLights(idStack[stackLen - 1], lightStack.slice(0, stackLen));
                    } else  { // Full compile supplies it's own default states
                        SceneJS_renderModule.setLights();
                    }
                    dirty = false;
                }
            });

    function pushLight(id, light) {  // TODO: what to do with ID?
        var modelMat = SceneJS_modelTransformModule.getTransform().matrix;
        if (light.mode == "point") {
            light.worldPos = SceneJS_math_transformPoint3(modelMat, light.pos);
        } else if (light.mode == "dir") {
            light.worldDir = SceneJS_math_transformVector3(modelMat, light.dir);
        }
        idStack[stackLen] = id;
        lightStack[stackLen] = light;
        stackLen++;
        dirty = true;
    }

    var Light = SceneJS.createNodeType("light");

    Light.prototype._init = function(params) {
        params = params || {};
        this._light = {};
        this.setMode(params.mode);
        this.setColor(params.color);
        this.setDiffuse(params.diffuse);
        this.setSpecular(params.specular);
        this.setPos(params.pos);
        this.setDir(params.dir);
        this.setConstantAttenuation(params.constantAttenuation);
        this.setLinearAttenuation(params.linearAttenuation);
        this.setQuadraticAttenuation(params.quadraticAttenuation);
    };

    Light.prototype.setMode = function(mode) {
        mode = mode || "dir";
        if (mode != "dir" && mode != "point") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Light unsupported mode - should be 'dir' or 'point' or 'ambient'");
        }
        this._light.mode = mode;
        return this;
    };

    Light.prototype.getMode = function() {
        return this._light.mode;
    };

    Light.prototype.setColor = function(color) {
        color = color || {};
        this._light.color = [
            color.r != undefined ? color.r : 1.0,
            color.g != undefined ? color.g : 1.0,
            color.b != undefined ? color.b : 1.0
        ];
        return this;
    };

    Light.prototype.getColor = function() {
        return {
            r: this._light.color[0],
            g: this._light.color[1],
            b: this._light.color[2] };
    };

    Light.prototype.setDiffuse = function (diffuse) {
        this._light.diffuse = (diffuse != undefined) ? diffuse : true;
        return this;
    };

    Light.prototype.getDiffuse = function() {
        return this._light.diffuse;
    };

    Light.prototype.setSpecular = function (specular) {
        this._light.specular = specular || true;
        return this;
    };

    Light.prototype.getSpecular = function() {
        return this._light.specular;
    };

    Light.prototype.setPos = function(pos) {
        pos = pos || {};
        this._light.pos = [ pos.x || 0.0, pos.y || 0.0, pos.z || 0.0 ];
        return this;
    };

    Light.prototype.getPos = function() {
        return { x: this._light.pos[0], y: this._light.pos[1], z: this._light.pos[2] };
    };

    Light.prototype.setDir = function(dir) {
        dir = dir || {};
        this._light.dir = [ dir.x || 0.0, dir.y || 0.0, (dir.z == undefined || dir.z == null) ? -1 : dir.z ];
        return this;
    };

    Light.prototype.getDir = function() {
        return { x: this._light.dir[0], y: this._light.dir[1], z: this._light.dir[2] };
    };

    Light.prototype.setConstantAttenuation = function (constantAttenuation) {
        this._light.constantAttenuation = (constantAttenuation != undefined) ? constantAttenuation : 1.0;
        return this;
    };

    Light.prototype.getConstantAttenuation = function() {
        return this._light.constantAttenuation;
    };

    Light.prototype.setLinearAttenuation = function (linearAttenuation) {
        this._light.linearAttenuation = linearAttenuation || 0.0;
        return this;
    };

    Light.prototype.getLinearAttenuation = function() {
        return this._light.linearAttenuation;
    };

    Light.prototype.setQuadraticAttenuation = function (quadraticAttenuation) {
        this._light.quadraticAttenuation = quadraticAttenuation || 0.0;
        return this;
    };

    Light.prototype.getQuadraticAttenuation = function() {
        return this._light.quadraticAttenuation;
    };

    Light.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Light.prototype._preCompile = function() {
        pushLight(this.attr.id, this._light);
    };

    Light.prototype._postCompile = function() {
    };

})();