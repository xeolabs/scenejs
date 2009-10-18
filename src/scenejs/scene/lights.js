SceneJs.lights = function() {

    var cfg = SceneJs.getConfig(arguments);

    var type = 'lights';

    var clonePos = function(v) {
        v = v || {};
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    var cloneVec = function(v) {
        v = v || {};
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    var cloneColor = function(v) {
        v = v || {};
        return { r: v.r || 0, g: v.g || 0, b: v.b || 0, a:v.a || 1 };
    };

    var cloneLight = function(l) {
        return {
            pos : clonePos(l.pos),
            ambient : cloneColor(l.ambient),
            diffuse : cloneColor(l.diffuse),
            specular : cloneColor(l.specular),
            dir: cloneVec(l.dir),
            constantAttenuation: l.constantAttenuation || 0,
            linearAttenuation: l.linearAttenuation || 0,
            quadraticAttenuation: l.quadraticAttenuation || 0
        };
    };

    var cloneLights = function(lights) {
        var lights2 = [];
        for (var i = 0; i < lights.length; i++) {
            lights2.push(cloneLight(lights[i]));
        }
        return lights2;
    };

    return SceneJs.node(
            SceneJs.apply(cfg, {

                reset : function() {
                    this.lights = cfg.lights ? cloneLights(cfg.lights) : [];
                },

                preVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.pushLights(this.lights);
                    }
                },

                postVisit : function() {
                    var backend = SceneJs.Backend.getNodeBackend(type);
                    if (backend) {
                        backend.popLights(this.lights.length);
                    }
                }
            }));
};