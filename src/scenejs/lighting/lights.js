SceneJS.lights = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var lightsBackend = SceneJS._backends.getBackend('lights');
    var modelTransformBackend = SceneJS._backends.getBackend('model-transform');

    var lights;

    function vectorToArray(v) {
        return v ? [ v.x || 0, v.y || 0, v.z || 0] : [ 0,  0,  0];
    }

    function colourToArray(v) {
        return v ? [ v.r || 0, v.g || 0, v.b || 0, v.a || 1 ] : [ 0,  0,  0];
    }

    function transformLight(mat, l) {  // Shading is done in model-space
        return {
            pos : SceneJS._math.transformPoint3(mat, vectorToArray(l.pos)),
            //            ambient : colourToArray(l.ambient),
            //            diffuse : colourToArray(l.diffuse),
            //            specular : colourToArray(l.specular),
            dir: SceneJS._math.transformVector3(mat, vectorToArray(l.dir)),
            constantAttenuation: l.constantAttenuation,
            linearAttenuation: l.linearAttenuation,
            quadraticAttenuation: l.quadraticAttenuation
        };
    }

    function transformLights(mat, lights) {
        var lights2 = [];
        for (var i = 0; i < lights.length; i++) {
            var light = lights[i];
            lights2.push(transformLight(mat, light));
        }
        return lights2;
    }

    return SceneJS._utils.createNode(
            function(scope) {

                /* Memoize lights if they are given in a constant node config and if the
                 * current view and model coordinate system is also constant
                 */
                if (!lights || !cfg.fixed || !modelTransformBackend.getTransform().fixed) {
                    lights = transformLights(modelTransformBackend.getTransform().matrix, cfg.getParams(scope).lights);
                }
                lightsBackend.pushLights(lights);
                SceneJS._utils.visitChildren(cfg, scope);
                lightsBackend.popLights(lights.length);
            });
};