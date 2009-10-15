/** A list of lights to apply to sub-nodes. Each 
 *
 * @param cfg
 */
SceneJs.Lights = function(cfg) {
    cfg = cfg || {};

    var clonePos = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    var cloneVec = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    var cloneColor = function(v) {
        return v ? { r: v.r || 0, g: v.g || 0, b: v.b || 0, a:v.a || 1 } : { r: 0, g : 0, b: 0, a : 1 };
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

    var init = function() {
        this.lights = cfg.lights ? cloneLights(cfg.lights) : [];
    };

    this.reset = function() {
        init.call(this);
    };

    this.preVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.pushLights(cloneLights(this.lights));
        }
    };

    this.preVisit = function() {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.popLights(this.lights.length);
        }
    };

    SceneJs.Lights.superclass.constructor.call(this, SceneJs.apply(cfg, {
        getType: function() {
            return 'lights';
        }
    }));
};

SceneJs.extend(SceneJs.Lights, SceneJs.Node, {});