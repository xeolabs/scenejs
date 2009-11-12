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

            this.setViewport = function(x, y, width, height) {
                if (!ctx.canvas) {
                    throw 'No canvas active';
                }
                var context = ctx.canvas.context;
                context.viewport(x, y, width, height);
                context.clear(context.COLOR_BUFFER_BIT);
            };
        })());
