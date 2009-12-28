/** Backend for viewport node
 *
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'viewport';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.setViewport = function(viewport) {
                if (!ctx.canvas) {
                    throw 'No canvas active';
                }
                var context = ctx.canvas.context;
                context.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                ctx.viewport = viewport;
            };

            this.getViewport = function() {
                if (!ctx.canvas) {
                    throw 'No canvas active';
                }

                /* Lazy-create default viewport - assumes that client node always calls getViewport before setViewport
                 */
                if (!ctx.viewport) {
                    ctx.viewport = { x : 1, y: 1, width: ctx.canvas.width, height: ctx.canvas.height };
                }
                return ctx.viewport;
            };

            this.clear = function() {
                ctx.canvas.context.clear(ctx.canvas.context.COLOR_BUFFER_BIT);
            };
        })());
