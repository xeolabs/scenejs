/**
 * Manages the current model-view transformation
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'model-view-transform';

            var ctx;

            var init = function() {
                var t = Matrix.I(4);
                ctx.mvTransform = {
                    matrix : t,
                    normalMatrix : new WebGLFloatArray(t.inverse().transpose().make3x3().flatten()),
                    fixed: true
                };
            };

            this.install = function(_ctx) {
                ctx = _ctx;
                init();
            };

            this.setTransform = function(transform) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                }
                ctx.mvTransform = transform;
                ctx.programs.setVar('scene_ModelViewMatrix', transform.matrixAsArray);
                ctx.programs.setVar('scene_NormalMatrix', transform.normalMatrixAsArray);
            };

            this.getTransform = function() {
                return ctx.mvTransform;
            };

            this.reset = function() {
                init();
            };
        })());