/**
 * WebGL backend for SceneJs.Vars node
 *
 */
SceneJs.private.backend.installBackend(
        new (function() {

            this.type = 'vars';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.pushVarOverrides = function(vars) {
                if (!ctx.programs.getActiveProgramName()) {
                    throw 'No shader active';
                }
                ctx.pushVarOverrides(ctx.canvas.context, vars);
            };

            this.popVarOverrides = function() {
                ctx.popVarOverrides(ctx.canvas.context);
            };
        })());