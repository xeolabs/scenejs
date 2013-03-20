new (function() {

    /**
     * The default state core singleton for {@link SceneJS.Framebuf} nodes
     */
    var defaultCore = {

        type: "framebuf",
        stateId: SceneJS._baseStateId++,
        empty: true,

        framebuf: null
    };

    var nodeCoreMap = {}; // Map of framebuf nodes to cores, for reallocation on WebGL context restore

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.framebuf = defaultCore;
                stackLen = 0;
            });

    SceneJS_events.addListener(// Reallocate VBOs when context restored after loss
            SceneJS_events.WEBGL_CONTEXT_RESTORED,
            function() {

                var node;

                for (var nodeId in nodeCoreMap) {
                    if (nodeCoreMap.hasOwnProperty(nodeId)) {

                        node = nodeCoreMap[nodeId];

                        if (!node._core._loading) {
                            node._buildNodeCore();
                        }
                    }
                }
            });

    SceneJS_events.addListener(
            SceneJS_events.SCENE_DESTROYED,
            function(params) {
                //     sceneBufs[params.sceneId] = null;
            });

    /**
     * @class Scene graph node which sets up a frame buffer to which the {@link SceneJS.Geometry} nodes in its subgraph will be rendered.
     * The frame buffer may be referenced as an image source by successive {@link SceneJS.Texture} nodes.
     * @extends SceneJS.Node
     */
    SceneJS.Framebuf = SceneJS_NodeFactory.createNodeType("framebuf");

    SceneJS.Framebuf.prototype._init = function() {

        nodeCoreMap[this._core.coreId] = this; // Register for core rebuild on WEBGL_CONTEXT_RESTORED

        this._buildNodeCore();
    };

    SceneJS.Framebuf.prototype._buildNodeCore = function() {

        var canvas = this._engine.canvas;
        var gl = canvas.gl;
        var width = canvas.canvas.width;
        var height = canvas.canvas.height;

        var framebuf = gl.createFramebuffer();
        var renderbuf = gl.createRenderbuffer();
        var texture = gl.createTexture() ;

        var rendered = false;

        if (!this._core) {
            this._core = {};
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);

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
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuf);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuf);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /* Verify framebuffer is OK
         */
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);

        if (!gl.isFramebuffer(framebuf)) {
            throw SceneJS_error.fatalError("Invalid framebuffer");
        }

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw SceneJS_error.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw SceneJS_error.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw SceneJS_error.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw SceneJS_error.fatalError("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw SceneJS_error.fatalError("Incomplete framebuffer: " + status);
        }

        this._core.framebuf = {

            id: this.id, // TODO: maybe unused?

            /** Binds the image buffer as target for subsequent geometry renders
             */
            bind: function() {
             //   gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuf);
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
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
               // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuf);
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
    };

    SceneJS.Framebuf.prototype._compile = function() {
        this._engine.display.framebuf = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.framebuf = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.Framebuf.prototype._destroy = function() {
        if (this._core) {
            //destroyFrameBuffer(this._buf);
        }
    };


})();