/**
 * Backend for a material node, feeds given material properties into the active shader and retains them.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'material';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.material) {
                    ctx.material = {  // Default to some colour so we'll see at least something while debugging a scene 
                        ambient:  { r: 0, g : 0, b : 1 },
                        diffuse:  { r: 0, g : 0, b : 1 },
                        specular: { r: 0, g : 0, b : 1 },
                        shininess:{ r: 0, g : 0, b : 1 }
                    };
                }
            };

            this.setMaterial = function(material) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw 'No shader active';
                }
                ctx.programs.setVar('scene_Material', material);
                ctx.material = material;
            };

            this.getMaterial = function() {
                return ctx.material;
            };
        })());