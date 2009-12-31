/**
 * Manages the current model-view transformation
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'projection-transform';

            var ctx;

            var init = function() {
                var t = Matrix.I(4);
                ctx.projTransform = {
                    matrix: t,
                    matrixAsArray : new WebGLFloatArray(t.flatten())
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
                ctx.projTransform = transform;
                ctx.programs.setVar('scene_ProjectionMatrix', transform.matrixAsArray);
            };

            this.getTransform = function() {
                return ctx.projTransform;
            };

            this.reset = function() {
                init();
            };
        })());