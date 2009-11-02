/** Backend for projection nodes.
 */
SceneJs.private.backendModules.installBackend(
        new (function() {

            this.type = 'projection';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                ctx.projectionMatrix = new SceneJs.utils.Matrix4();
            };

            /** Sets a projection matrix on the shader
             */
            this.setProjectionMatrix = function(mat) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw 'No shader active';
                }
                ctx.programs.setVar('scene_ProjectionMatrix', mat || new SceneJs.utils.Matrix4());
                ctx.projectionMatrix = mat;
            };

            this.getProjectionMatrix = function() {
                return ctx.projectionMatrix;
            }
        })());