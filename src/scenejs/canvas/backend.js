/**
 * Backend for a canvas node.
 */
SceneJs.backends.installBackend(
        new (function() {

            var CONTEXT_TYPE = 'moz-glweb20';

            this.type = 'canvas';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.findCanvas = function(canvasId) {
                var canvas = document.getElementById(canvasId);
                if (!canvas) {
                    throw new SceneJs.canvas.CanvasNotFoundException
                            ('Could not find canvas document element with id \'' + canvasId + '\'');
                }
                var context = canvas.getContext('moz-glweb20');
                if (!context) {
                    throw new SceneJs.canvas.CanvasNotSupportedException
                            ('Canvas document element with id \''
                                    + canvasId
                                    + '\' failed to provide a \'' + CONTEXT_TYPE + '\' context');
                }
                context.clearColor(0.8, 0.8, 0.9, 1.0);
                context.clearDepth(1.0);
                context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
                context.enable(context.DEPTH_TEST);

                return {
                    canvas: canvas,
                    context: context,
                    canvasId : canvasId
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
                    ctx.canvas.context.enable(cfg.context.DEPTH_TEST);
                } else {
                    ctx.canvas.context.disable(cfg.context.DEPTH_TEST);
                }
            };

            this.setClearColor = function(c) {
                ctx.canvas.context.clearColor(c.r, c.g, c.b, c.a);
            };

            this.setClearDepth = function(depth) {
                ctx.canvas.context.clearDepth(depth);
            };

            this.flush = function() {
                ctx.canvas.context.flush();
            };

            this.swapBuffers = function() {
                ctx.canvas.context.swapBuffers();
            };
        })());



