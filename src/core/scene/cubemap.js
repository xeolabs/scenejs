(function () {

    // The default state core singleton for {@link SceneJS.ColorBuf} nodes
    var defaultCore = {
        type: "cubemap",
        stateId: SceneJS._baseStateId++,
        empty: true,
        texture: null,
        hash:""
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.cubemap = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which configures the color buffer for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.CubeMap = SceneJS_NodeFactory.createNodeType("cubemap");

    SceneJS.CubeMap.prototype._init = function (params) {
        if (this._core.useCount == 1) { // This node is first to reference the state core, so sets it up
            this._core.hash = "y";
            var self = this;
            var gl = this._engine.canvas.gl;
            var texture = gl.createTexture();
            var faces = [
                gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
            ];
            var taskId = SceneJS_sceneStatusModule.taskStarted(this, "Loading cubemap texture");
            var numImagesLoaded = 0;
            var loadFailed = false;
            for (var i = 0; i < faces.length; i++) {
                var face = faces[i];
                var image = new Image();
                image.onload = function (face, image) {
                    return function () {
                        if (loadFailed) {
                            return;
                        }
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                        gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ensureImageSizePowerOfTwo(image));
                        //self._core.texture = texture;
                        //gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  ensureImageSizePowerOfTwo(image));
                        if (++numImagesLoaded == faces.length) {
                            self._core.texture = new SceneJS_webgl_Texture2D(gl, {
                                texture:texture,
                                target: gl.TEXTURE_CUBE_MAP,
                                minFilter:gl.LINEAR,
                                magFilter:gl.LINEAR,
                                wrapS:gl.CLAMP_TO_EDGE,
                                wrapT:gl.CLAMP_TO_EDGE
                            });
                            SceneJS_sceneStatusModule.taskFinished(taskId);
                            self._engine.display.imageDirty = true;
                        }
                    }
                }(face, image);
                image.onerror = function () {
                    loadFailed = true;
                    SceneJS_sceneStatusModule.taskFailed(taskId);
                };
                image.src = params.src[i];
            }
        }
    };

    function ensureImageSizePowerOfTwo (image) {
        if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
            var canvas = document.createElement("canvas");
            canvas.width = nextHighestPowerOfTwo(image.width);
            canvas.height = nextHighestPowerOfTwo(image.height);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);

            image = canvas;
            image.crossOrigin = "";
        }
        return image;
    }

    function isPowerOfTwo(x) {
        return (x & (x - 1)) == 0;
    }

    function nextHighestPowerOfTwo(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    }

    SceneJS.CubeMap.prototype._compile = function (ctx) {
        this._engine.display.cubemap = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.cubemap = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

    SceneJS.CubeMap.prototype._destroy = function () {
        if (this._core.useCount == 1) { // Last resource user
            if (this._core.texture) {
                this._engine.display.gl.deleteTexture(this._core.texture);
                this._core.texture = null;
            }
        }
    }

})();