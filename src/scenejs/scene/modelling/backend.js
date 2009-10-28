/** WebGL backends for model-view transformation nodes.
 *
 * @param type
 */
SceneJs.private.backend.installBackend(
        new (function() {

            this.type = 'modeltransform';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.modelTransform) {
                    ctx.modelTransform = {
                        matrix : new SceneJs.utils.Matrix4(),
                        cacheSafe: true
                    };
                }
            };

            this.setModelTransform = function(transform) {
                if (!ctx.programs.getActiveProgramName()) {
                    throw 'No shader active';
                }
                ctx.modelTransform = transform
                ctx.programs.setVar(ctx.canvas.context, 'scene_ModelMatrix', transform.matrix);
            };

            this.getModelTransform = function() {
                return ctx.modelTransform;
            };
        })());