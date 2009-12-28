/**
 * Manages the current model-view transformation
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'projection-transform';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.projMatrix) {
                    ctx.projMatrix = Matrix.I(4);
                }
            };

            this.setMatrix = function(matrix) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                }
                ctx.projMatrix = matrix;
                ctx.programs.setVar('scene_ProjectionMatrix', matrix);
            };

            this.getMatrix = function() {
                return ctx.projMatrix;
            };
        })());