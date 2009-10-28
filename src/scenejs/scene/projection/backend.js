/** WebGL backends for projection nodes.
 *
 * @param type
 */

SceneJs.private.backend.installBackend(
        new (function() {

            this.type = 'projection';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.setProjectionMatrix = function(mat) {
                if (!ctx.programs.getActiveProgramName()) {
                    throw 'No shader active';
                }
                ctx.programs.setVar(ctx.canvas.context, 'scene_ProjectionMatrix', mat || new SceneJs.utils.Matrix4());
            };
        })());