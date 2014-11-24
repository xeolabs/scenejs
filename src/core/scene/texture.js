/**
 * @class Scene graph node which defines textures to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Texture} nodes
    var defaultCore = {
        type: "texture",
        stateId: SceneJS._baseStateId++,
        empty: true,
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.texture = defaultCore;
            stackLen = 0;
        });

    var coreStack = [];
    var stackLen = 0;

    /**
     * @class Scene graph node which defines one or more textures to apply to the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.TextureMap = SceneJS_NodeFactory.createNodeType("texture");

    SceneJS.TextureMap.prototype._init = function (params) {

        var self = this;

        if (this._core.useCount == 1) { // This node is the resource definer

            if (params.applyFrom) {
                if (params.applyFrom != "uv" &&
                    params.applyFrom != "uv2" &&
                    params.applyFrom != "normal" &&
                    params.applyFrom != "geometry") {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "texture applyFrom value is unsupported - " +
                            "should be either 'uv', 'uv2', 'normal' or 'geometry'");
                }
            }

            if (params.applyTo) {
                if (params.applyTo != "baseColor" && // Colour map (deprecated)
                    params.applyTo != "color" && // Colour map
                    params.applyTo != "specular" && // Specular map
                    params.applyTo != "emit" && // Emission map
                    params.applyTo != "alpha" && // Alpha map
                    params.applyTo != "normals" && // Normal map
                    params.applyTo != "shine") { // Shininess map
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "texture applyTo value is unsupported - " +
                            "should be either 'color', 'baseColor', 'specular' or 'normals'");
                }
            }

            if (params.blendMode) {
                if (params.blendMode != "add" && params.blendMode != "multiply") {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                            "texture layer blendMode value is unsupported - " +
                            "should be either 'add' or 'multiply'");
                }
            }

            if (params.applyTo == "color") {
                params.applyTo = "baseColor";
            }

            SceneJS._apply({
                    waitForLoad: params.waitForLoad == undefined ? true : params.waitForLoad,
                    texture: null,
                    applyFrom: !!params.applyFrom ? params.applyFrom : "uv",
                    applyTo: !!params.applyTo ? params.applyTo : "baseColor",
                    blendMode: !!params.blendMode ? params.blendMode : "multiply",
                    blendFactor: (params.blendFactor != undefined && params.blendFactor != null) ? params.blendFactor : 1.0,
                    translate: params.translate ? SceneJS._apply(params.translate, { x: 0, y: 0}) : {x: 0, y: 0},
                    scale: params.scale ? SceneJS._apply(params.scale, { x: 1, y: 1}) : {x: 1, y: 1},
                    rotate: params.rotate || 0,
                    matrix: null,
                    _matrixDirty: true,
                    buildMatrix: buildMatrix
                },
                this._core);

            buildMatrix.call(this._core);

            if (params.src) { // Load from URL
                this._core.src = params.src;
                this._loadTexture(params.src);

            } else if (params.image) { // Create from image
                this._core.image = params.image;
                this._initTexture(params.image);

            } else if (params.target) { // Render to this texture
                this.getScene().getNode(params.target,
                    function (target) {
                        self.setTarget(target);
                    });
            }

            this._core.webglRestored = function () {
                if (self._core.image) {
                    self._initTexture(self._core.image);

                } else if (self._core.src) {
                    self._loadTexture(self._core.src);

                } else if (self._core.target) {
//                    self.getScene().getNode(params.target,
//                        function (target) {
//                            self.setTarget(self._core.target);
//                        });
                }
            };
        }
    };

    function buildMatrix() {
        var matrix;
        var t;
        if (this.translate.x != 0 || this.translate.y != 0) {
            matrix = SceneJS_math_translationMat4v([ this.translate.x || 0, this.translate.y || 0, 0]);
        }
        if (this.scale.x != 1 || this.scale.y != 1) {
            t = SceneJS_math_scalingMat4v([ this.scale.x || 1, this.scale.y || 1, 1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (this.rotate != 0) {
            t = SceneJS_math_rotationMat4v(this.rotate * 0.0174532925, [0, 0, 1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (matrix) {
            this.matrix = matrix;
            if (!this.matrixAsArray) {
                this.matrixAsArray = new Float32Array(this.matrix);
            } else {
                this.matrixAsArray.set(this.matrix);
            }
        }
        this._matrixDirty = false;
    }

    SceneJS.TextureMap.prototype._loadTexture = function (src) {
        var self = this;
        var taskId = SceneJS_sceneStatusModule.taskStarted(this, "Loading texture");
        var image = new Image();
        image.onload = function () {
            self._initTexture(image);
            SceneJS_sceneStatusModule.taskFinished(taskId);
            self._engine.display.imageDirty = true;
        };
        image.onerror = function () {
            SceneJS_sceneStatusModule.taskFailed(taskId);
        };
        if (src.indexOf("data") == 0) {  // Image data
            image.src = src;
        } else { // Image file
            image.crossOrigin = "Anonymous";
            image.src = src;
        }
    };

    SceneJS.TextureMap.prototype._initTexture = function (image) {

        var gl = this._engine.canvas.gl;

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._ensureImageSizePowerOfTwo(image));

    //    this._core.image = image;

        this._core.texture = new SceneJS._webgl.Texture2D(gl, {
            texture: texture, // WebGL texture object
            minFilter: this._getGLOption("minFilter", gl.LINEAR_MIPMAP_NEAREST),
            magFilter: this._getGLOption("magFilter", gl.LINEAR),
            wrapS: this._getGLOption("wrapS", gl.REPEAT),
            wrapT: this._getGLOption("wrapT", gl.REPEAT),
            isDepth: this._getOption(this._core.isDepth, false),
            depthMode: this._getGLOption("depthMode", gl.LUMINANCE),
            depthCompareMode: this._getGLOption("depthCompareMode", gl.COMPARE_R_TO_TEXTURE),
            depthCompareFunc: this._getGLOption("depthCompareFunc", gl.LEQUAL),
            flipY: this._getOption(this._core.flipY, true),
            width: this._getOption(this._core.width, 1),
            height: this._getOption(this._core.height, 1),
            internalFormat: this._getGLOption("internalFormat", gl.LEQUAL),
            sourceFormat: this._getGLOption("sourceType", gl.ALPHA),
            sourceType: this._getGLOption("sourceType", gl.UNSIGNED_BYTE),
            update: null
        });

        if (this.destroyed) { // Node was destroyed while loading
            this._core.texture.destroy();
        }

        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype._ensureImageSizePowerOfTwo = function (image) {
        if (!this._isPowerOfTwo(image.width) || !this._isPowerOfTwo(image.height)) {
            var canvas = document.createElement("canvas");
            canvas.width = this._nextHighestPowerOfTwo(image.width);
            canvas.height = this._nextHighestPowerOfTwo(image.height);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);
            image = canvas;
            image.crossOrigin = "";
        }
        return image;
    };

    SceneJS.TextureMap.prototype._isPowerOfTwo = function (x) {
        return (x & (x - 1)) == 0;
    };

    SceneJS.TextureMap.prototype._nextHighestPowerOfTwo = function (x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    };

    SceneJS.TextureMap.prototype._getGLOption = function (name, defaultVal) {
        var gl = this._engine.canvas.gl;
        var value = this._core[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS._webgl.enumMap[value];
        if (glName == undefined) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Unrecognised value for texture node property '" + name + "' value: '" + value + "'");
        }
        return gl[glName];
    };

    SceneJS.TextureMap.prototype._getOption = function (value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    };

    SceneJS.TextureMap.prototype.setSrc = function (src) {
        this._core.image = null;
        this._core.src = src;
        this._core.target = null;
        this._loadTexture(src);
    };

    SceneJS.TextureMap.prototype.setImage = function (image) {
        this._core.image = image;
        this._core.src = null;
        this._core.target = null;
        this._initTexture(image);
    };

    SceneJS.TextureMap.prototype.setTarget = function (target) {
        if (target.type != "colorTarget" && target.type != "depthTarget") {
            console.log("Target node type not compatible: " + target.type);
            return;
        }
        delete this._core.src;
        this._core.target = target;
        this._core.src = null;
        this._core.image = null;
        this._core.texture = target._core.renderBuf.getTexture(); // TODO: what happens when the target is destroyed?
        this._core.texture.bufType = target._core.bufType;
        this._engine.display.imageDirty = true;
    };

    /**
     * Sets the texture's blend factor with respect to other active textures.
     * @param {number} blendFactor The blend factor, in range [0..1]
     */
    SceneJS.TextureMap.prototype.setBlendFactor = function (blendFactor) {
        this._core.blendFactor = blendFactor;
        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype.getBlendFactor = function () {
        return this._core.blendFactor;
    };

    SceneJS.TextureMap.prototype.setTranslate = function (t) {
        if (!this._core.translate) {
            this._core.translate = {x: 0, y: 0};
        }
        this._core.translate.x = t.x;
        this._core.translate.y = t.y;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype.getTranslate = function () {
        return this._core.translate;
    };

    SceneJS.TextureMap.prototype.setScale = function (s) {
        if (!this._core.scale) {
            this._core.scale = {x: 0, y: 0};
        }
        this._core.scale.x = s.x;
        this._core.scale.y = s.y;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype.getScale = function () {
        return this._core.scale;
    };

    SceneJS.TextureMap.prototype.setRotate = function (angle) {
        this._core.rotate = angle;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.TextureMap.prototype.getRotate = function () {
        return this._core.rotate;
    };

    SceneJS.TextureMap.prototype.getMatrix = function () {
        if (this._core._matrixDirty) {
            this._core.buildMatrix.call(this.core)()
        }
        return this.core.matrix;
    };

    SceneJS.TextureMap.prototype._compile = function (ctx) {
        if (!this.__core) {
            this.__core = this._engine._coreFactory.getCore("texture");
        }
        var parentCore = this._engine.display.texture;
        if (!this._core.empty) {
            this.__core.layers = (parentCore && parentCore.layers) ? parentCore.layers.concat([this._core]) : [this._core];
        }
        this._makeHash(this.__core);
        coreStack[stackLen++] = this.__core;
        this._engine.display.texture = this.__core;
        this._compileNodes(ctx);
        this._engine.display.texture = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.TextureMap.prototype._makeHash = function (core) {
        var hash;
        if (core.layers && core.layers.length > 0) {
            var layers = core.layers;
            var hashParts = [];
            var texLayer;
            for (var i = 0, len = layers.length; i < len; i++) {
                texLayer = layers[i];
                hashParts.push("/");
                hashParts.push(texLayer.applyFrom);
                hashParts.push("/");
                hashParts.push(texLayer.applyTo);
                hashParts.push("/");
                hashParts.push(texLayer.blendMode);
                if (texLayer.matrix) {
                    hashParts.push("/anim");
                }
            }
            hash = hashParts.join("");
        } else {
            hash = "";
        }
        if (core.hash != hash) {
            core.hash = hash;
        }
    };

    SceneJS.TextureMap.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Last core user
            if (this._core.texture && !this._core.target) { // Don't wipe out target texture
                this._core.texture.destroy();
                this._core.texture = null;
            }
        }
        if (this._core) {
            this._engine._coreFactory.putCore(this._core);
        }
    };

})();