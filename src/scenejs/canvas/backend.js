/**
 * Backend for a canvas node.
 */
SceneJs.backends.installBackend(
        new (function() {

            var CONTEXT_TYPES = ["experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"];

            this.type = 'canvas';

            var ctx;

            var init = function() {
                ctx.canvas = null;
            };

            this.install = function(_ctx) {
                ctx = _ctx;
                init();
            };

            this.findCanvas = function(cfg) {
                var canvas = document.getElementById(cfg.canvasId);
                if (!canvas) {
                    throw new SceneJs.exceptions.CanvasNotFoundException
                            ('Could not find canvas document element with id \'' + canvasId + '\'');
                }
                var context;

                for (var i = 0; (!context) && i < CONTEXT_TYPES.length; i++) {
                    context = canvas.getContext(CONTEXT_TYPES[i]);
                }
                if (!context) {
                    throw new SceneJs.exceptions.CanvasNotSupportedException
                            ('Canvas document element with id \''
                                    + canvasId
                                    + '\' failed to provide a supported context');
                }

                cfg = cfg || {};

                if (cfg.clearColor) {
                    context.clearColor(cfg.clearColor.r, cfg.clearColor.g, cfg.clearColor.b, cfg.clearColor.a);
                } else {
                    context.clearColor(0.0, 0.0, 0.0, 1.0);
                }

                if (cfg.clearDepth) {
                    context.clearDepth(cfg.clearDepth);
                } else {
                    //context.clearDepth(1.0);
                }

                if (cfg.depthTest) {
                    context.enable(context.DEPTH_TEST);
                } else {
                    context.disable(context.DEPTH_TEST);
                }

                if (cfg.cullFace) {
                    context.enable(context.CULL_FACE);
                } else {
                    context.disable(context.CULL_FACE);
                }

                if (cfg.texture2D) {
                    context.enable(context.TEXTURE_2D);
                } else {
                    context.disable(context.TEXTURE_2D);
                }

                if (cfg.depthFunc) {

                } else {

                }

                if (cfg.depthRange) {
                    context.depthRange(cfg.depthRange.zmin, cfg.depthRange.zmin);
                } else {
              //      context.depthRange(0.0, 0.01);
                }
                
                context.disable(context.SCISSOR_TEST);

                return {
                    canvas: canvas,
                    context: context,
                    canvasId : cfg.canvasId
                };
            };

            this.setCanvas = function(canvas) {
                ctx.canvas = canvas;
            };

            this.getCanvas = function() {
                return ctx.canvas;
            };

            this.setDepthTest = function(enable) {
                if (enable) {
                    //   ctx.canvas.context.enable(cfg.context.DEPTH_TEST);
                } else {
                    //  ctx.canvas.context.disable(cfg.context.DEPTH_TEST);
                }
            };

            this.setClearColor = function(c) {
                ctx.canvas.context.clearColor(c.r, c.g, c.b, c.a);
            };

            this.setClearDepth = function(depth) {
                //    ctx.canvas.context.clearDepth(depth);
            };

            this.clearCanvas = function() {
                ctx.canvas.context.clear(ctx.canvas.context.COLOR_BUFFER_BIT | ctx.canvas.context.DEPTH_BUFFER_BIT); // Buffers are swapped automatically in WebGL
            };

            this.flush = function() {
                ctx.canvas.context.finish();
                ctx.canvas.context.flush();
            };

            this.reset = function() {
                init();
            };
        })());



