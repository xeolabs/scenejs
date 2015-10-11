/**
 * @class Scene graph node which defines textures to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
new (function () {

    // The default state core singleton for {@link SceneJS.RegionMap} nodes
    var defaultCore = {
        type: "regionMap",
        stateId: SceneJS._baseStateId++,
        empty: true,
        texture: null,
        highlightColor:[ -1.0, -1.0, -1.0 ],    // Highlight off by default
        highlightFactor:[ 1.5, 1.5, 0.0 ],
        regionData: {},
        hash: ""
    };

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.regionMap = defaultCore;
            stackLen = 0;
        });

    var coreStack = [];
    var stackLen = 0;

    /**
     * @class Scene graph node which defines a color-coded region map
     * @extends SceneJS.Node
     */
    SceneJS.RegionMap = SceneJS_NodeFactory.createNodeType("regionMap");

    SceneJS.RegionMap.prototype._init = function (params) {

        var self = this;

        if (this._core.useCount == 1) { // This node is the resource definer

            SceneJS._apply({
                    regionMap: null
                },
                this._core);


            if (params.src) {

                // Load from URL

                this._initTexture();
                this._core.src = params.src;
                this._loadTexture(params.src);

            } else if (params.image) {

                // Create from image

                this._initTexture(params.preloadColor);
                this._core.image = params.image;
                this._setTextureImage(params.image);

            } else if (params.target) {

                // Render to this region map

                this.getScene().getNode(params.target,
                    function (target) {
                        self.setTarget(target);
                    });
            }

            this._core.webglRestored = function () {

                if (self._core.image) {
                    self._initTexture();
                    self._setTextureImage(self._core.image);

                } else if (self._core.src) {
                    self._initTexture();
                    self._loadTexture(self._core.src);

                } else if (self._core.target) {
                    // Don't need to rebind anything for targets
                }
            };

            this.setHighlightColor(params.highlightColor);
            this.setHighlightFactor(params.highlightFactor);
            this.setRegionData(params.regionData);

            this._core.hash = "reg";
        }
    };

    SceneJS.RegionMap.prototype._initTexture = function () {

        var gl = this._engine.canvas.gl;

        // Keep this for a little bit for debugging
        var preloadColor = {r: 0.57735, g: 0.57735, b: 0.57735};
        preloadColor.a = preloadColor.a === undefined ? 1 : preloadColor.a;
        preloadColor = new Uint8Array([
            Math.floor(preloadColor.r * 255),
            Math.floor(preloadColor.g * 255),
            Math.floor(preloadColor.b * 255),
            Math.floor(preloadColor.a * 255)
        ]);

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, preloadColor);
        this._setCoreTexture(texture);
    };

    SceneJS.RegionMap.prototype._loadTexture = function (src) {
        var self = this;
        var taskId = SceneJS_sceneStatusModule.taskStarted(this, "Loading texture");
        var image = new Image();
        var loaded = false;
        var taskFinished = false;

        image.onload = function () {
            self._setTextureImage(image);
            if (!taskFinished) {
                SceneJS_sceneStatusModule.taskFinished(taskId);
            }
            loaded = true;
            self._engine.display.imageDirty = true;
        };
        image.onerror = function () {
            SceneJS_sceneStatusModule.taskFailed(taskId);
        };
        this._fetchImage(image, src);
    };

    SceneJS.RegionMap.prototype._fetchImage = function (image, src) {
        if (src.indexOf("data") == 0) {  // Image data
            image.src = src;
        } else { // Image file
            image.crossOrigin = "Anonymous";
            image.src = src;
        }
    };

    SceneJS.RegionMap.prototype._setTextureImage = function (image) {
        var gl = this._engine.canvas.gl;
        var texture = this._core.texture ? this._core.texture.texture : gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, SceneJS._webgl.ensureImageSizePowerOfTwo(image));
        this._core.image = image;
        this._setCoreTexture(texture);
    };

    SceneJS.RegionMap.prototype._setCoreTexture = function (texture) {
        var gl = this._engine.canvas.gl;

        this._core.texture = new SceneJS._webgl.Texture2D(gl, {
            texture: texture, // WebGL texture object
            minFilter: this._getGLOption("minFilter", gl.NEAREST_MIPMAP_NEAREST),  // Don't want any interpolation
            magFilter: this._getGLOption("magFilter", gl.NEAREST),
            wrapS: this._getGLOption("wrapS", gl.REPEAT),
            wrapT: this._getGLOption("wrapT", gl.REPEAT),
            isDepth: this._getOption(this._core.isDepth, false),
            depthMode: this._getGLOption("depthMode", gl.LUMINANCE),
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

        if (this.destroyed) { // Node was destroyed while loading
            this._core.texture.destroy();
        }

        this._engine.display.imageDirty = true;
    };

    SceneJS.RegionMap.prototype._getGLOption = function (name, defaultVal) {
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

    SceneJS.RegionMap.prototype._getOption = function (value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    };

    SceneJS.RegionMap.prototype.setSrc = function (src) {
        this._core.image = null;
        this._core.src = src;
        this._core.target = null;
        this._loadTexture(src);
    };

    SceneJS.RegionMap.prototype.setImage = function (image) {
        this._core.image = image;
        this._core.src = null;
        this._core.target = null;
        this._setTextureImage(image);
    };

    SceneJS.RegionMap.prototype.setTarget = function (target) {
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

    SceneJS.RegionMap.prototype.setHighlightColor = function (color) {
        var defaultHighlightColor = defaultCore.highlightColor;
        this._core.highlightColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultHighlightColor[0],
            color.g != undefined && color.g != null ? color.g : defaultHighlightColor[1],
            color.b != undefined && color.b != null ? color.b : defaultHighlightColor[2]
        ] : defaultCore.highlightColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.RegionMap.prototype.setHighlightFactor = function (color) {
        var defaultHighlightFactor = defaultCore.highlightFactor;
        this._core.highlightFactor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultHighlightFactor[0],
            color.g != undefined && color.g != null ? color.g : defaultHighlightFactor[1],
            color.b != undefined && color.b != null ? color.b : defaultHighlightFactor[2]
        ] : defaultCore.highlightFactor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.RegionMap.prototype.setRegionData = function (data) {
        this._core.regionData = data ? data : defaultCore.regionData;
        return this;
    };


    SceneJS.RegionMap.prototype._compile = function (ctx) {
        var parentCore = this._engine.display.regionMap;
        this._engine.display.regionMap = this._core;
        this._compileNodes(ctx);
        this._engine.display.regionMap = parentCore;
    };

    SceneJS.RegionMap.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Last core user
            if (this._core.texture && !this._core.target) { // Don't wipe out target texture
                this._core.texture.destroy();
                this._core.texture = null;
            }
        }
    };

})();