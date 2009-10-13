SceneJs.Material = function(cfg) {
    cfg = cfg || {};

    var cloneColor = function(v) {
        return v ? { r: v.r || 0, g: v.g || 0, b: v.b || 0, a:v.a || 1 } : { r: 0, g : 0, b: 0, a : 1 };
    };

    var init = function() {
        this.ambient = cloneColor(cfg.ambient);
        this.diffuse = cloneColor(cfg.diffuse);
        this.specular = cloneColor(cfg.specular);
        this.shininess = cloneColor(cfg.shininess);
    };

    init.call(this);

    this.reset = function() {
        init.call(this);
    };

    this.preVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.pushVars({
                ambient:  this.ambient,
                diffuse:  this.diffuse,
                specular: this.specular,
                shininess:this.shininess
            });
        }
    };

    this.preVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.popVars();
        }
    };

    SceneJs.Material.superclass.constructor.call(this, SceneJs.apply(cfg, {
        getType: function() {
            return 'material';
        }
    }));
};

SceneJs.extend(SceneJs.Material, SceneJs.Node, {});