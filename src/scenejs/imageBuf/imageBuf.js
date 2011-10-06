new (function() {

    var sceneBufs = {};

    var idStack = [];
    var bufStack = [];
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
                        SceneJS_DrawList.setImagebuf(idStack[stackLen - 1], bufStack[stackLen - 1]);
                    } else { // Full compile supplies it's own default states
                        SceneJS_DrawList.setImagebuf(); // No imageBuf
                    }
                    dirty = false;
                }
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_DESTROYED,
            function(params) {
                sceneBufs[params.sceneId] = null;
            });

    /** Creates image buffer, registers it under the given ID
     */
    function createImageBuffer(scene, bufId) {

        var canvas = scene.canvas;
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
            throw SceneJS_errorModule.fatalError("Invalid framebuffer");
        }
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw SceneJS_errorModule.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw SceneJS_errorModule.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw SceneJS_errorModule.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw SceneJS_errorModule.fatalError("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw SceneJS_errorModule.fatalError("Incomplete framebuffer: " + status);
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
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }
                };
            }
        };

        /* Register the buffer
         */
        var bufs = sceneBufs[scene.attr.id];
        if (!bufs) {
            bufs = sceneBufs[scene.attr.id] = {};
        }
        bufs[bufId] = buf;
        return buf;
    }

    function destroyImageBuffer(buf) {

    }

    SceneJS._compilationStates.setSupplier("imageBuf", {
        get: function(sceneId, id) {
            var bufs = sceneBufs[sceneId];
            return {
                bind: function(unit) {
                    var buf = bufs[id];
                    if (buf && buf.isRendered()) {
                        buf.getTexture().bind(unit);
                    }
                },

                unbind: function(unit) {
                    var buf = bufs[id];
                    if (buf && buf.isRendered()) {
                        buf.getTexture().unbind(unit);
                    }
                }
            };
        }
    });

    var ImageBuf = SceneJS.createNodeType("imageBuf");

    ImageBuf.prototype._init = function() {
        this._buf = createImageBuffer(this.scene, this.attr.id);
    };

    ImageBuf.prototype._compile = function() {
        idStack[stackLen] = this.attr.id;
        bufStack[stackLen] = this._buf;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };

    ImageBuf.prototype._destroy = function() {
        if (this._buf) {
            destroyImageBuffer(this._buf);
        }
    };
})();