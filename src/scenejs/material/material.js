/** Sets material properties on the current shader for sub-nodes
 */
SceneJS.material = function() {
    var errorBackend = SceneJS._backends.getBackend('error');
    var backend = SceneJS._backends.getBackend('material');

    var cfg = SceneJS._utils.getNodeConfig(arguments);

    return SceneJS._utils.createNode(
            "material",
            cfg.children,

            new (function() {
                var _material = {
                    baseColor : [ 0.0, 0.0, 0.0 ],
                    specularColor: [ 0.0,  0.0,  0.0 ],
                    specular : 0,
                    shine : 0,
                    reflect : 0,
                    alpha : 1.0,
                    emit : 0.0,
                    blendMode : "multiply"
                };

                this.setBaseColor = function(color) {
                    _material.baseColor = [
                        color.r != undefined ? color.r : 0.0,
                        color.g != undefined ? color.g : 0.0,
                        color.b != undefined ? color.b : 0.0
                    ];
                    return this;
                };

                this.getBaseColor = function() {
                    return {
                        r: _material.baseColor,
                        g: _material.baseColor,
                        b: _material.baseColor
                    };
                };

                this.setSpecularColor = function(color) {
                    _material.specularColor = [
                        color.r != undefined ? color.r : 0.5,
                        color.g != undefined ? color.g : 0.5,
                        color.b != undefined ? color.b : 0.5
                    ];
                    return this;
                };

                this.getSpecularColor = function() {
                    return {
                        r: _material.specularColor[0],
                        g: _material.specularColor[1],
                        b: _material.specularColor[2]
                    };
                };

                this.setSpecular = function(specular) {
                    _material.specular = specular || 0;
                };

                this.getSpecular = function() {
                    return _material.specular;
                };

                this.setShine = function(shine) {
                    _material.shine = shine || 0;
                };

                this.getShine = function() {
                    return _material.shine;
                };

                this.setReflect = function(reflect) {
                    _material.reflect = reflect || 0;
                };

                this.getReflect = function() {
                    return _material.reflect;
                };

                this.setEmit = function(emit) {
                    _material.emit = emit || 0;
                };

                this.getEmit = function() {
                    return _material.emit;
                };

                this.setAlpha = function(alpha) {
                    _material.alpha = alpha == undefined ? 1.0 : alpha;
                };

                this.getAlpha = function() {
                    return _material.alpha;
                };

                this.setBlendMode = function(mode) {
                    if (mode != "add" && mode != "multiply") {
                        errorBackend.fatalError(new SceneJS.exceptions.InvalidNodeConfigException(
                                "SceneJS.material blendMode of unsupported type: '" + mode + "' - should be 'add' or 'multiply'"));
                    }
                    _material.blendMode = mode;
                };

                this.getBlendMode = function() {
                    return _material.blendMode;
                };

                this._init = function(params) {
                    if (params.baseColor) {
                        this.setBaseColor(params.baseColor);
                    }
                    if (params.specularColor) {
                        this.setSpecularColor(params.specularColor);
                    }
                    if (params.specular) {
                        this.setSpecular(params.specular);
                    }
                    if (params.shine) {
                        this.setShine(params.shine);
                    }
                    if (params.reflect) {
                        this.setReflect(params.reflect);
                    }
                    if (params.emit) {
                        this.setEmit(params.emit);
                    }
                    if (params.alpha) {
                        this.setAlpha(params.alpha);
                    }
                    if (params.blendMode) {
                        this.setAlpha(params.blendMode);
                    }
                };

                if (cfg.fixed) {
                    this._init(cfg.getParams());
                }

                this._render = function(traversalContext, data) {
                    if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                        this._renderChildren(traversalContext, data);
                    } else {
                        if (!cfg.fixed) {
                            this._init(cfg.getParams(data));
                        }
                        var saveMaterial = backend.getMaterial();
                        backend.setMaterial(_material);
                        this._renderChildren(traversalContext, data);
                        backend.setMaterial(saveMaterial);
                    }
                };
            })());
};

