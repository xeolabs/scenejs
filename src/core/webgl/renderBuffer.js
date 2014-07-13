SceneJS._webgl.RenderBuffer = function (cfg) {

    var canvas = cfg.canvas;
    var gl = canvas.gl;

    var buf;
    var bound = false;

    /**
     * Called after WebGL context is restored.
     */
    this.webglRestored = function (_gl) {
        gl = _gl;
        buf = null;
    };

    /** Binds this renderbuffer
     */
    this.bind = function () {
        this._touch();
        if (bound) {
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, buf.framebuf);
        bound = true;
    };

    this._touch = function () {
        var width = canvas.canvas.width;
        var height = canvas.canvas.height;
        if (buf) { // Currently have a pick buffer
            if (buf.width == width && buf.height == height) { // Canvas size unchanged, buffer still good
                return;
            } else { // Buffer needs reallocation for new canvas size
                gl.deleteTexture(buf.texture);
                gl.deleteFramebuffer(buf.framebuf);
                gl.deleteRenderbuffer(buf.renderbuf);
            }
        }
        buf = {
            framebuf: gl.createFramebuffer(),
            renderbuf: gl.createRenderbuffer(),
            texture: gl.createTexture(),
            width: width,
            height: height
        };
        gl.bindFramebuffer(gl.FRAMEBUFFER, buf.framebuf);
        gl.bindTexture(gl.TEXTURE_2D, buf.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        try {
            // Do it the way the spec requires
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        } catch (exception) {
            // Workaround for what appears to be a Minefield bug.
            var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, textureStorage);
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, buf.renderbuf);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, buf.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, buf.renderbuf);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // Verify framebuffer is OK
        gl.bindFramebuffer(gl.FRAMEBUFFER, buf.framebuf);
        if (!gl.isFramebuffer(buf.framebuf)) {
            throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Invalid framebuffer");
        }
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw SceneJS_error.fatalError(SceneJS.errors.ERROR, "Incomplete framebuffer: " + status);
        }
        bound = false;
    };

    /** Clears this renderbuffer
     */
    this.clear = function () {
        if (!bound) {
            throw "Pick buffer not bound";
        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.BLEND);
    };


    /** Reads buffer pixel at given coordinates
     */
    this.read = function (pickX, pickY) {
        var x = pickX;
        var y = canvas.canvas.height - pickY;
        var pix = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pix);
        return pix;
    };

    /** Unbinds this renderbuffer
     */
    this.unbind = function () {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        bound = false;
    };
};

