SceneJs.material = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'material';

    var cloneColor = function(v) {
        v = v || {};
        return { r: v.r || 0, g: v.g || 0, b: v.b || 0, a:v.a || 1 };
    };

    return SceneJs.node(
            SceneJs.apply(cfg, {

                reset : function() {
                    this.ambient = cloneColor(cfg.ambient);
                    this.diffuse = cloneColor(cfg.diffuse);
                    this.specular = cloneColor(cfg.specular);
                    this.shininess = cloneColor(cfg.shininess);
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.pushMaterial({
                            ambient:  this.ambient,
                            diffuse:  this.diffuse,
                            specular: this.specular,
                            shininess:this.shininess
                        });
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.popMaterial();
                    }
                }
            }));
};