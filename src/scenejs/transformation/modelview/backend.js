/**
 * Manages the current model-view transformation
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'model-view-transform';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.mvpTransform) {
                    var t = Matrix.I(4);
                    ctx.mvpTransform = {
                        matrix : t,
                        normalMatrix : t.inverse().transpose().make3x3(),
                        fixed: true
                    };
                }
            };

            this.setTransform = function(transform) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                }
                ctx.mvpTransform = transform;
                ctx.programs.setVar('scene_ModelViewMatrix', transform.matrix);
                ctx.programs.setVar('scene_NormalMatrix', transform.normalMatrix);
            };

            this.getTransform = function() {
                return ctx.mvpTransform;
            };
        })());