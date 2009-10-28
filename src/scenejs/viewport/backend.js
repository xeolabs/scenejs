/** WebGL backend for SceneJs.Viewport node
 *
 */
SceneJs.private.backendModules.installBackend(
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
                ctx.canvas.context.viewport(x, y, width, height);
                ctx.canvas.context.clear(context.COLOR_BUFFER_BIT);
            };
        })());
