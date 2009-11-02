/** Backend for modelling transform nodes. Allows client node to set a modelling matrix on the shader. The matrix
 * is bundled with a flag which signifies if the matrix is constant, where it can be memoized by the client node.
 */
SceneJs.private.backendModules.installBackend(
        new (function() {

            this.type = 'modeltransform';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.modelTransform) {
                    ctx.modelTransform = {
                        matrix : new SceneJs.utils.Matrix4(),
                        fixed: true
                    };
                }
            };

            /** Sets a modelling matrix on the shader. The matrix is wrapped in an object that bundles a cacheability
             * flag.
             */
            this.setModelTransform = function(transform) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw 'No shader active';
                }
                ctx.modelTransform = transform
                ctx.programs.setVar('scene_ModelMatrix', transform.matrix);
            };

            /** Returns modelling matrix, bundled with cacheability flag
             */
            this.getModelTransform = function() {
                return ctx.modelTransform;
            };
        })());