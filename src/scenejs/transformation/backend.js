/**
 * Manages the current model-view transformation
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'mvp-transform';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.mvpTransform) {
                    ctx.mvpTransform = {
                        matrix : Matrix.I(4),
                        fixed: true
                    };
                }
            };

            this.setTransform = function(transform) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                }
                ctx.mvpTransform = transform;
                ctx.programs.setVar('scene_MVPMatrix', transform.matrix);
            };

            this.getTransform = function() {
                return ctx.mvpTransform;
            };
        })());