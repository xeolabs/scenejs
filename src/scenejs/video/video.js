new (function() {

    var sceneBufs = {};

    //------------------------------------------------------------
    // TODO: remove bufs when all video nodes deleted for a scene otherwise we'll have inifite redraw
    //--------------------------------------------------------

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_IDLE,
            function(params) {
                var bufs = sceneBufs[params.sceneId];
                if (bufs) {
                    for (var bufId in bufs) {                       // Update video textures for each scene
                        if (bufs.hasOwnProperty(bufId)) {
                            bufs[bufId].update();
                        }
                    }
                    SceneJS_compileModule.redraw(params.sceneId);   // Trigger scene redraw after texture update
                }
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_DESTROYED,
            function(params) {
                sceneBufs[params.sceneId] = null;
            });

    var Video = SceneJS.createNodeType("video");

    Video.prototype._init = function(params) {
        if (!params.src) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "video node parameter expected: 'src'");
        }

        /* Create hidden video canvas
         */
        var video = this._video = document.createElement("video");
        video.style.display = "none";
        video.setAttribute("loop", "loop");
        video.autoplay = true;
        video.addEventListener("ended", // looping broken in FF
                function() {
                    this.play();
                },
                true);
        document.getElementsByTagName("body")[0].appendChild(video);
        this._canvas = document.createElement("canvas"); // for webkit
        this._ctx = this._canvas.getContext("2d");
        video.src = params.src;

        /* Create video texture
         */
        var gl = this._gl = this.scene.canvas.context;
        this._texture = gl.createTexture();

        /* Create handle to video texture
         */
        var bufId = this.attr.id;

        var self = this;

        var buf = {

            id: bufId,

            update: function() {
                var video = self._video;
                var gl = self._gl;
                var canvas = self._canvas;
                var texture = self._texture;
                var ctx = self._ctx;

                gl.bindTexture(gl.TEXTURE_2D, texture);

                // TODO: fix when minefield is up to spec - thanks GLGE

                if (video.readyState > 0) {

                    if (video.height <= 0) {
                        video.style.display = "";
                        video.height = video.offsetHeight;
                        video.width = video.offsetWidth;
                        video.style.display = "none";
                    }

                    canvas.height = video.height;
                    canvas.width = video.width;

                    ctx.drawImage(video, 0, 0);

                    try {
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                    }
                    catch(e) {
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas, null);
                    }

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                    gl.generateMipmap(gl.TEXTURE_2D);

                    /*

                     For when webkit works - thanks GLGE

                     try{gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);}
                     catch(e){gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video,null);}
                     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                     gl.generateMipmap(gl.TEXTURE_2D);
                     */
                }
            },

            getTexture: function() {
                return {

                    bind: function(unit) {
                        var gl = self._gl;
                        gl.activeTexture(gl["TEXTURE" + unit]);
                        gl.bindTexture(gl.TEXTURE_2D, self._texture);
                    },

                    unbind : function(unit) {
                        var gl = self._gl;
                        gl.activeTexture(gl["TEXTURE" + unit]);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }
                };
            }
        };

        buf.update();

        /* Register the buffer
         */
        var sceneId = this.scene.attr.id;
        var bufs = sceneBufs[sceneId];
        if (!bufs) {
            bufs = sceneBufs[sceneId] = {};
        }
        this._buf = bufs[bufId] = buf;
    };

    SceneJS._compilationStates.setSupplier("video", {
        get: function(sceneId, id) {
            var bufs = sceneBufs[sceneId];
            return {
                bind: function(unit) {
                    var buf = bufs[id];
                    if (buf) {                              // Lazy-bind when video node shows up
                        buf.getTexture().bind(unit);
                    }
                },

                unbind: function(unit) {
                    var buf = bufs[id];
                    if (buf) {
                        buf.getTexture().unbind(unit);
                    }
                }
            };
        }
    });

    Video.prototype._compile = function() {
        this._compileNodes();
    };

    Video.prototype._destroy = function() {
        if (this._buf) {
            var bufs = sceneBufs[this.scene.attr.id];

        }
    };
})();