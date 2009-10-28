/**
 * WebGL backend for SceneJs.Vars node
 *
 */
SceneJs.private.backendModules.installBackend(
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