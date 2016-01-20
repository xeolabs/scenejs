/**
 * @class Scene graph node which defines textures to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.Texture} nodes
    var defaultCore = {
        type: "decal",
        stateId: SceneJS._baseStateId++,
        empty: true,
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.decal = defaultCore;
            stackLen = 0;
        });

    var coreStack = [];
    var stackLen = 0;

    /**
     * @class Scene graph node which defines a texture for drawinging on the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Decal = SceneJS_NodeFactory.createNodeType("decal");

    SceneJS.Decal.prototype._init = function (params) {

        var self = this;

        if (this._core.useCount == 1) { // This node is the resource definer

            if (params.applyFrom) {
                if (params.applyFrom != "uv" &&
                    params.applyFrom != "uv2") {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "decal applyFrom value is unsupported - " +
                        "should be either 'uv' or 'uv2'");
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
                        "decal applyTo value is unsupported - " +
                        "should be either 'color', 'baseColor', 'specular' or 'normals'");
                }
            }

            if (params.blendMode) {
                if (params.blendMode != "add" && params.blendMode != "multiply") {
                    throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "decal layer blendMode value is unsupported - " +
                        "should be either 'add' or 'multiply'");
                }
            }

            if (params.applyTo == "color") {
                params.applyTo = "baseColor";
            }

            SceneJS._apply({
                    texture: null,
                    applyFrom: !!params.applyFrom ? params.applyFrom : "uv",
                    applyTo: !!params.applyTo ? params.applyTo : "baseColor",
                    blendMode: !!params.blendMode ? params.blendMode : "multiply",
                    blendFactor: (params.blendFactor != undefined && params.blendFactor != null) ? params.blendFactor : 1.0,
                    translate: params.translate ? SceneJS._apply(params.translate, {x: 0, y: 0}) : {x: 0, y: 0},
                    scale: params.scale ? SceneJS._apply(params.scale, {x: 1, y: 1}) : {x: 1, y: 1},
                    rotate: params.rotate || 0,
                    matrix: null,
                    _matrixDirty: true,
                    buildMatrix: buildMatrix
                },
                this._core);

            buildMatrix.call(this._core);

            this._setTextureImage(params.image);

            this._core.webglRestored = function () {
                self._setTextureImage(self._core.image);
            };
        }
    };

    function buildMatrix() {
        var matrix;
        var t;
        if (this.translate.x != 0 || this.translate.y != 0) {
            matrix = SceneJS_math_translationMat4v([this.translate.x || 0, this.translate.y || 0, 0]);
        }
        if (this.scale.x != 1 || this.scale.y != 1) {
            t = SceneJS_math_scalingMat4v([this.scale.x || 1, this.scale.y || 1, 1]);
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

    SceneJS.Decal.prototype._setTextureImage = function (image) {

        var gl = this._engine.canvas.gl;
        var texture = this._core.texture ? this._core.texture.texture : gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, SceneJS._webgl.ensureImageSizePowerOfTwo(image));

        this._core.texture = new SceneJS._webgl.Texture2D(gl, {
            texture: texture,
            minFilter: this._getGLOption("minFilter", gl.LINEAR),
            magFilter: this._getGLOption("magFilter", gl.LINEAR),
            wrapS: gl.REPEAT,
            wrapT: gl.REPEAT,
            isDepth: false,
            depthMode: gl.LUMINANCE,
            depthCompareMode: this._getGLOption("depthCompareMode", gl.COMPARE_R_TO_TEXTURE),
            depthCompareFunc: this._getGLOption("depthCompareFunc", gl.LEQUAL),
            flipY: this._getOption(this._core.flipY, true),
            width: this._getOption(this._core.width, 1),
            height: this._getOption(this._core.height, 1),
            internalFormat: this._getGLOption("internalFormat", gl.ALPHA),
            sourceFormat: this._getGLOption("sourceFormat", gl.ALPHA),
            sourceType: this._getGLOption("sourceType", gl.UNSIGNED_BYTE),
            update: null
        });

        this._core.image = image;

        this._engine.display.imageDirty = true;
    };

    SceneJS.Decal.prototype._getGLOption = function (name, defaultVal) {
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

    SceneJS.Decal.prototype._getOption = function (value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    };

    SceneJS.Decal.prototype.setImage = function (image) {
        this._core.image = image;
        this._core.src = null;
        this._core.target = null;
        this._setTextureImage(image);
    };

    /**
     * Sets the texture's blend factor with respect to other active textures.
     * @param {number} blendFactor The blend factor, in range [0..1]
     */
    SceneJS.Decal.prototype.setBlendFactor = function (blendFactor) {
        this._core.blendFactor = blendFactor;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Decal.prototype.getBlendFactor = function () {
        return this._core.blendFactor;
    };

    SceneJS.Decal.prototype.setTranslate = function (t) {
        if (!this._core.translate) {
            this._core.translate = {x: 0, y: 0};
        }
        this._core.translate.x = t.x;
        this._core.translate.y = t.y;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Decal.prototype.getTranslate = function () {
        return this._core.translate;
    };

    SceneJS.Decal.prototype.setScale = function (s) {
        if (!this._core.scale) {
            this._core.scale = {x: 0, y: 0};
        }
        this._core.scale.x = s.x;
        this._core.scale.y = s.y;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Decal.prototype.getScale = function () {
        return this._core.scale;
    };

    SceneJS.Decal.prototype.setRotate = function (angle) {
        this._core.rotate = angle;
        this._core._matrixDirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Decal.prototype.getRotate = function () {
        return this._core.rotate;
    };

    SceneJS.Decal.prototype.getMatrix = function () {
        if (this._core._matrixDirty) {
            this._core.buildMatrix.call(this.core)()
        }
        return this.core.matrix;
    };

    SceneJS.Decal.prototype._compile = function (ctx) {
        this._makeHash();
        coreStack[stackLen++] = this._core;
        this._engine.display.decal = this._core;
        this._compileNodes(ctx);
        this._engine.display.decal = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.Decal.prototype._makeHash = function () {
        var hash;
        var hashParts = [];
        hashParts.push("/");
        hashParts.push(this._core.applyFrom);
        hashParts.push("/");
        hashParts.push(this._core.applyTo);
        hashParts.push("/");
        hashParts.push(this._core.blendMode);
        if (this._core.matrix) {
            hashParts.push("/anim");
        }
        hash = hashParts.join("");
        if (this._core.hash != hash) {
            this._core.hash = hash;
        }
    };

    SceneJS.Decal.prototype._destroy = function () {
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