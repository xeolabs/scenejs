/*
 *  @private
 */
SceneJS._imageBufModule = new (function() {
    var sceneBufs = {};
    var currentSceneBufs = null;
    var bufStack = [];
    var boundBuf = null;
    var canvas;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.INIT,
            function() {
                sceneBufs = {};
                boundBuf = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function(e) {
                canvas = e.canvas;
                currentSceneBufs = sceneBufs[e.sceneId];
                if (!currentSceneBufs) {
                    currentSceneBufs = sceneBufs[e.sceneId] = {};
                }
                bufStack = [];
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._shaderModule.addImageBuf((bufStack.length > 0)
                            ? bufStack[bufStack.length - 1]
                            : null);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    /** Creates image buffer, registers it under the given ID
     */
    this.createImageBuffer = function(id) {
        var bufId = id;
        var gl = canvas.context;
        var width = canvas.canvas.width;
        var height = canvas.canvas.height;
        var frameBuf = gl.createFramebuffer();
        var renderBuf = gl.createRenderbuffer();
        var texture = gl.createTexture() ;
        var rendered = false;

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        try {
            // Do it the way the spec requires
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        } catch (exception) {
            // Workaround for what appears to be a Minefield bug.
            var textureStorage = new WebGLUnsignedByteArray(width * height * 4);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, textureStorage);
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuf);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuf);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /* Verify framebuffer is OK
         */
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf);
        if (!gl.isFramebuffer(frameBuf)) {
            throw("Invalid framebuffer");
        }
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw("Incomplete framebuffer: " + status);
        }

        /* Create handle to image buffer
         */
        var buf = {
            id: bufId,

            /** Binds the image buffer as target for subsequent geometry renders
             */
            bind: function() {
                // gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuf);
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.disable(gl.CULL_FACE);
                gl.depthRange(0, 1);
                gl.disable(gl.SCISSOR_TEST);
                //  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.disable(gl.BLEND);
            },

            /** Unbinds image buffer, the default buffer then becomes the rendering target
             */
            unbind:function() {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
                gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuf);
                rendered = true;
            },

            /** Returns true if this texture has been rendered
             */
            isRendered: function() {
                return rendered;
            },

            /** Gets the texture from this image buffer
             */
            getTexture: function() {
                return {

                    bind: function(unit) {
                        gl.activeTexture(gl["TEXTURE" + unit]);
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                    },

                    unbind : function(unit) {
                        gl.activeTexture(gl["TEXTURE" + unit]);
                        gl.bindTexture(this.target, null);
                    }
                };
            }
        };

        /* Register the buffer
         */
        currentSceneBufs[bufId] = buf;

        return bufId;
    };

    /** Pushes image buffer onto active buffer stack, makes it the active buffer
     */
    this.pushImageBuffer = function(bufId) {
        var buf = currentSceneBufs[bufId];
        if (!buf) {
            throw "Image buffer not found: " + bufId;
        }
        bufStack.push(buf);
        dirty = true;
    };

    /** Pops top image buffer off active stack, activates the next on the stack, if any
     */
    this.popImageBuffer = function() {
        bufStack.pop();
        dirty = true;
    };


    this.destroyImageBuffer = function(bufId) {

    };

    /** Gets an image buffer
     */
    this.getImageBuffer = function(bufId) {
        return currentSceneBufs[bufId];
    };

    /** Gets texture from an image buffer
     */
    this.getTexture = function(bufId) {
        var buf = currentSceneBufs[bufId];
        return buf ? buf.getTexture() : null;
    };

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_DESTROYED,
            function() {

            });
})();
