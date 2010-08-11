/* Manages picking
 *
 * In response to a request to pick Geometry at the given canvas coordinates, this puts SceneJS
 * into TRAVERSAL_PICKING_MODE for the next render traversal.
 *
 * When the next traversal begins, signalled by an incoming SCENE_RENDERING event, the module will ensure that a
 * pick buffer (frame buffer) exists on the current scene's canvas, then bind the buffer to make it active.
 *
 * Scene nodes then register their pre-rendering on this module during the traversal. This module assumes that the node
 * has just been registered on SceneJS._nodeEventsModule. When a node has an SID (scoped identifier), then this
 * module generates a colour value that is unique to the node within the traversal, then tags the current node   
 *
 *  @private
 */
SceneJS._pickModule = new (function() {
    var scenePickBufs = {};            // Pick buffer for each existing scene
    var boundPickBuf = null;           // Pick buffer for currently active scene while picking
    var color = { r: 0, g: 0, b: 0 };
    var pickX = null;
    var pickY = null;
    var debugCfg = null;
    var nodeIndex = 0;
    var pickedNodeIndex = 0;

    /**
     * On init, put SceneJS in rendering mode.
     * Pick buffers are destroyed when their scenes are destroyed.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.INIT,
            function() {
                SceneJS._traversalMode = SceneJS._TRAVERSAL_MODE_RENDER;
                debugCfg = SceneJS._debugModule.getConfigs("picking"); // TODO: debug mode only changes on reset
                scenePickBufs = {};
                boundPickBuf = null;
            });

    /** Make sure we are back in render mode on error/reset
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                SceneJS._traversalMode = SceneJS._TRAVERSAL_MODE_RENDER;
            });

    /** Called by SceneJS.Scene to pick at x,y and enter picking mode.
     */
    this.pick = function(x, y) {
        if (debugCfg.logTrace) {
            SceneJS._loggingModule.info("Picking at (" + x + ", " + y + ")");
        }
        SceneJS._traversalMode = SceneJS._TRAVERSAL_MODE_PICKING;
        pickX = x;
        pickY = y;
        color = { r: 0, g: 0, b: 0 };
        nodeIndex = 0;
    };

    /**
     * When a scene begins rendering, then if in pick mode, bind pick buffer for scene,
     * creating buffer first if not existing
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function(e) {
                if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
                    if (!scenePickBufs[e.sceneId]) {
                        scenePickBufs[e.sceneId] = createPickBuffer(e.canvas);
                    }
                    bindPickBuffer(scenePickBufs[e.sceneId]);
                }
            });

    function createPickBuffer(canvas) {
        var gl = canvas.context;
        var width = canvas.canvas.width;
        var height = canvas.canvas.height;
        var pickBuf = {
            canvas : canvas,
            frameBuf : gl.createFramebuffer(),
            renderBuf : gl.createRenderbuffer(),
            texture : gl.createTexture()
        };

        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.frameBuf);

        gl.bindTexture(gl.TEXTURE_2D, pickBuf.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        try {
            // Do it the way the spec requires
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        } catch (exception) {
            // Workaround for what appears to be a Minefield bug.
            var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, textureStorage);
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, pickBuf.renderBuf);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickBuf.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pickBuf.renderBuf);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /* Verify framebuffer is OK
         */
        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.frameBuf);
        if (!gl.isFramebuffer(pickBuf.frameBuf)) {
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
        return pickBuf;
    }

    function bindPickBuffer(pickBuf) {
        if (debugCfg.logTrace) {
            SceneJS._loggingModule.info("Binding pick buffer");
        }
        var context = pickBuf.canvas.context;
        context.bindFramebuffer(context.FRAMEBUFFER, pickBuf.frameBuf);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.disable(context.BLEND);
        boundPickBuf = pickBuf;
    }

    /**
     * Notify pick module of node pre-render, assuming that SceneJS._nodeEventsModule.preVisit has been notified prior.
     * If node has a SID, then tag it on the SceneJS._nodeEventsModule.
     */
    this.preVisitNode = function(node) {
        if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) { // Quietly igore if not picking
            var sid = node.getSID();
            if (sid) {
                color.g = parseFloat(Math.round((nodeIndex + 1) / 256) / 256);
                color.r = parseFloat((nodeIndex - color.g * 256 + 1) / 256);
                color.b = 1.0;
                SceneJS._nodeEventsModule.tagNode("" + nodeIndex);
                nodeIndex++;
            }
        }
    };

    /** Export the current pick color when requested by shader module
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
                    SceneJS._eventModule.fireEvent(
                            SceneJS._eventModule.PICK_COLOR_EXPORTED, { pickColor: [color.r,color.g,color.b]});
                }
            });

    /** When scene finished rendering, then if in pick mode, read and unbind pick buffer
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERED,
            function() {
                if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
                    readPickBuffer();
                    unbindPickBuffer();
                }
            });

    function readPickBuffer() {
        var context = boundPickBuf.canvas.context;
        var pix = context.readPixels(pickX, boundPickBuf.canvas.canvas.height - pickY, 1, 1, context.RGBA, context.UNSIGNED_BYTE);
        if (!pix) {  //  http://asalga.wordpress.com/2010/07/14/compensating-for-webgl-readpixels-spec-changes/
            pix = new WebGLUnsignedByteArray(4);
            context.readPixels(pickX, boundPickBuf.canvas.canvas.height - pickY, 1, 1, context.RGBA, context.UNSIGNED_BYTE, pix);
        }
        if (debugCfg.logTrace) {
            SceneJS._loggingModule.info("Reading pick buffer - picked pixel(" + pickX + ", " + pickY + ") = {r:" + pix[0] + ", g:" + pix[1] + ", b:" + pix[2] + "}");
        }
        pickedNodeIndex = (pix[0] + pix[1] * 256) - 1;
    }

    function unbindPickBuffer() {
        if (debugCfg.logTrace) {
            SceneJS._loggingModule.info("Unbinding pick buffer");
        }
        boundPickBuf.canvas.context.bindFramebuffer(boundPickBuf.canvas.context.FRAMEBUFFER, null);
        boundPickBuf = null;
    }

    /**
     * When a scene finished rendering in pick mode, find picked node and fire "picked" event at
     * each node on path back to root that is listening for "picked" events.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERED,
            function() {
                if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
                    if (debugCfg.logTrace) {
                        SceneJS._loggingModule.info("Finished rendering..");
                    }
                    SceneJS._nodeEventsModule.fireEventFromTagNode("" + pickedNodeIndex, "picked");
                    SceneJS._traversalMode = SceneJS._TRAVERSAL_MODE_RENDER;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_DESTROYED,
            function() {
                if (debugCfg.logTrace) {
                    SceneJS._loggingModule.info("Destroying pick buffer");
                }
            });
})();
