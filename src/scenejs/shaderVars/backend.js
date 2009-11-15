/**
 * Backend for scene vars node, sets variables on the active shader and retains them.
 *
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'vars';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.setVars = function(v) {
                ctx.programs.setVars(ctx.canvas.context, v);
            };

            this.getVars = function() {
                ctx.programs.getVars(ctx.canvas.context);
            };
        })());