/**
 * WebGL backend for SceneJs.Material node
 */
SceneJs.private.backend.installBackend(
        new (function() {

            this.type = 'material';
            
            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.material) {
                    ctx.material = {};
                }
            };

            this.setMaterial = function(material) {
                if (!ctx.programs.getActiveProgramName()) {
                    throw 'No shader active';
                }
                ctx.programs.setVar(ctx.context, 'scene_Material', material);
                ctx.material = material;
            };

            this.getMaterial = function() {
                return ctx.material;
            };
        })());