/**
 * Scene node that constructs an viewing transform matrix and sets it on the current shader.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'viewtransform';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.viewTransform) {
                    ctx.viewTransform = {
                        matrix :  new SceneJs.utils.Matrix4(),
                        fixed: true
                    };
                }
            };

            this.setViewTransform = function(transform) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw 'No shader active';
                }
                ctx.viewTransform = transform;
                ctx.programs.setVar('scene_ViewMatrix', transform.matrix);
            };

            this.getViewTransform = function() {
                return ctx.viewTransform;
            };
        })());