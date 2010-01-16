/**
 * Backend for a material node, feeds given material properties into the active shader and retains them.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'material';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.material = (function() {

                    var material;
                    var loaded = false;

                    var _init = function() {
                        material = {  // Default to some colour so we'll see at least something while debugging a scene
                            ambient:  { r: 0, g : 0, b : 1 },
                            diffuse:  { r: 0, g : 0, b : 1 },
                            specular: { r: 0, g : 0, b : 1 },
                            shininess:{ r: 0, g : 0, b : 1 }
                        };
                        loaded = false;
                    };

                    _init();

                    /** When a new program is activated we will need to lazy-load our material
                     */
                    ctx.programs.onProgramActivate(function() {
                        loaded = false;
                    });

                    /**
                     * When geometry is about to draw we load our material if not loaded already
                     */
                    ctx.geometry.onDraw(function() {
                        if (!loaded) {
                            ctx.programs.setVar('scene_Material', material);
                            loaded = true;
                        }
                    });

                    return {

                        setMaterial : function(m) {
                            material = m;
                            loaded = false;
                        },

                        getMaterial : function() {
                            return material;
                        },

                        reset: function() {
                            _init();
                        }
                    };
                })();

            };

            this.setMaterial = function(material) {
                ctx.material.setMaterial(material);
            };

            this.getMaterial = function() {
                return ctx.material.getMaterial();
            };

            this.reset = function() {
                ctx.material.reset();
            };
        })());