/** Backend for scissor node
 *
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'scissor';

            var ctx;

            var init = function() {
                ctx.scissor = null;
            };

            this.install = function(_ctx) {
                ctx = _ctx;
                init();
            };

            this.getScissor = function() {
                if (!ctx.canvas) {
                    throw new SceneJs.exceptions.NoCanvasActiveException('No canvas active for scissor');
                }
                return ctx.scissor;
            };

            this.setScissor = function(scissor) {
                if (!ctx.canvas) {
                    throw new SceneJs.exceptions.NoCanvasActiveException('No canvas active for scissor');
                }
                var context = ctx.canvas.context;
                if (scissor) { // Set null when no scissor
                    var viewport = ctx.viewport;
                    if (!viewport) {
                        throw new SceneJs.exceptions.NoViewportActiveException('No viewport active for scissor');
                    }
                    context.enable(context.SCISSOR_TEST);
                    context.scissor(
                            scissor.x || viewport.x,
                            scissor.y || viewport.y,
                            scissor.width || viewport.width,
                            scissor.height || viewport.height);
                } else {
                    context.disable(context.SCISSOR_TEST);
                }
                ctx.scissor = scissor;
            };

            this.reset = function() {
                init();
            };
        })());
