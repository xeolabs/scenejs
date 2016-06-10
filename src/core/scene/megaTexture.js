new (function () {

    /**
     * @class Scene graph node which defines a megatexture
     * @extends SceneJS.Node
     */
    SceneJS.MegaTexture = SceneJS_NodeFactory.createNodeType("megaTexture");

    SceneJS.MegaTexture.prototype._init = function (params) {

        var self = this;

        if (this._core.useCount == 1) { // This node is the resource definer

            this._pixelsPerSide = params.pixelsPerSide || 1000;

            if (this._pixelsPerSide <= 0) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "SceneJS.MegaTexture param 'pixelsPerSide' should be greater than zero");
            }

            // Number of cache tiles on each side

            this._tilesPerSide = params.tilesPerSide || 10;

            if (this._tilesPerSide <= 0) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "SceneJS.MegaTexture param 'tilesPerSide' should be greater than zero");
            }

            this._core.info = SceneJS_math_vec2([
                this._pixelsPerSide,
                this._tilesPerSide
            ]);

            // Cache texture

            var gl = this._engine.canvas.gl;
            var texture = gl.createTexture();

            this._core.texture = new SceneJS._webgl.Texture2D(gl, {
                texture: texture,
                minFilter: gl.NEAREST,
                magFilter: gl.NEAREST,
                wrapS: gl.CLAMP_TO_EDGE,
                wrapT: gl.CLAMP_TO_EDGE
            });

            this.clear();

            // TODO: handle WebGLContextRestore
        }
    };

    /**
     * Gets the number of pixels along each side of this MegaTexture.
     * @returns {Number}
     */
    SceneJS.MegaTexture.prototype.getPixelsPerSide = function () {
        return this._pixelsPerSide;
    };

    /**
     * Gets the number of tiles along each side of this MegaTexture.
     * @returns {Number}
     */
    SceneJS.MegaTexture.prototype.getTilesPerSide = function () {
        return this._tilesPerSide;
    };

    /**
     * Clears this MegaTexture.
     */
    SceneJS.MegaTexture.prototype.clear = function () {

        var canvas = document.createElement('canvas');

        var pixelsPerSide = this._core.info[0];

        canvas.width = pixelsPerSide;
        canvas.height = pixelsPerSide;

        var ctx = canvas.getContext("2d");
        ctx.rect(0, 0, pixelsPerSide, pixelsPerSide);
        ctx.fillStyle = "black";
        ctx.fill();

        var image = new Image();
        image.src = canvas.toDataURL();

        var gl = this._engine.canvas.gl;
        gl.bindTexture(gl.TEXTURE_2D, this._core.texture.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this._engine.display.imageDirty = true;
    };

    /**
     * Copies an image into this MegaTexture at the given pixel coordinates.
     *
     * @param {HTMLImageElement} image Source image.
     * @param {Number} x X coordinate within MegaTexture
     * @param {Number} y Y coordinate within MegaTexture
     */
    SceneJS.MegaTexture.prototype.draw = function (image, x, y) {
        var gl = this._engine.canvas.gl;
        gl.bindTexture(gl.TEXTURE_2D, this._core.texture.texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this._engine.display.imageDirty = true;
    };

    SceneJS.MegaTexture.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Last core user
            if (this._core.texture) { // Don't wipe out target texture
                this._core.texture.destroy();
                this._core.texture = null;
            }
        }
        if (this._core) {
            this._engine._coreFactory.putCore(this._core);
        }
    };

})();
