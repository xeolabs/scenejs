/**
 *
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'texture';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                ctx.textures = (function() {

                    var textures = {
                    };
                    var activeTexture = null;

                    var loaded = false;

                    /** When a new program is activated we will need to lazy-load our current texture
                     */
                    ctx.programs.onProgramActivate(function() {
                        loaded = false;
                    });

                    /**
                     * When geometry is about to draw we load our texture if not loaded already
                     */
                    ctx.geometry.onDraw(function() {
                        if (!loaded && activeTexture) {
                            ctx.programs.bindTexture(activeTexture.ptexture);
                            loaded = true;
                        }
                    });


                    return {

                        getTexture : function(textureId) {
                            var texture = textures[textureId];
                            if (texture) {
                                texture.timeToLive--;
                                //    evict();
                                return textureId;
                            }
                            return null;
                        },

                        loadTexture: function(uri, callback) {
                            var textureId = uri;
                            var image = new Image();
                            var texture = {
                                textureId:textureId,
                                image: image,
                                timeToLive : 1000
                            };
                            texture.image.onload = function() {
                                textures[textureId] = texture;
                                callback(texture.textureId);
                            };
                            texture.image.src = uri;
                        },

                        bindTexture: function(textureId) {
                            var texture = textures[textureId];
                            var context = ctx.renderer.canvas.context;
                            texture.ptexture = context.createTexture();
                            context.bindTexture(context.TEXTURE_2D, texture.ptexture);
                            context.texImage2D(context.TEXTURE_2D, 0, texture.image);
                            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
                            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_NEAREST);
                            context.generateMipmap(context.TEXTURE_2D);
                            context.bindTexture(context.TEXTURE_2D, null);
                        },

                        activateTexture: function(textureId) {
                            var texture = textures[textureId];
                            if (!texture) {
                                throw "No such texture loaded \"" + textureId + "\"";
                            }
                            activeTexture = texture;
                            loaded = false;
                        },

                        getActiveTextureId: function() {
                            return activeTexture ? activeTexture.textureId : null;
                        }
                    };
                })();
            };

            /** Looks for loaded texture, which may have been evicted after lack of recent use
             */
            this.getTexture = function(textureId) {
                return ctx.textures.getTexture(textureId);
            };

            /** Triggers asynchronous load of texture image and begins new process; callback will fire with new texture ID
             *  for the client texture node. The texture node will have to then call textureLoaded to notify the backend that
             * the texture has loaded and allow backend to kill the process.
             */
            this.loadTexture = function(uri, callback) {
                ctx.scenes.processStarted();
                ctx.textures.loadTexture(uri, callback);
            };

            /** Notifies backend that load has completed; backend then kills the process.
             */
            this.textureLoaded = function(textureId) {
                ctx.scenes.processStopped();
                ctx.textures.bindTexture(textureId);
            };


            /** Activates currently loaded texture of given ID
             */
            this.activateTexture = function(textureId) {
                ctx.textures.activateTexture(textureId);
            };


            this.reset = function() {
                   // TODO:  Delete textures!
            };
        })());