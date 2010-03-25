/**
 * Scene node that constructs a 'lookAt' view transformation matrix and sets it on the current shader.
 */

SceneJS.lookAt = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var backend = SceneJS._backends.getBackend('view-transform');

    var cloneVec = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    var mat;
    var xform;

    return SceneJS._utils.createNode(
            function(data) {

                if (!mat || !cfg.fixed) { // Memoize matrix if node config is constant
                    var params = cfg.getParams(data);

                    var eye = cloneVec(SceneJS._utils.getParam(params.eye, data), { x: 0.0, y: 0.0, z: 0.0 });
                    var look = cloneVec(SceneJS._utils.getParam(params.look, data), { x: 0.0, y: 0.0, z: 0.0 });
                    var up = cloneVec(SceneJS._utils.getParam(params.up, data), { x: 0.0, y: 1.0, z: 0.0 });

                    if (eye.x == look.x && eye.y == look.y && eye.z == look.z) {
                        throw new SceneJS.exceptions.InvalidLookAtConfigException
                                ("Invald lookAt parameters: eye and look cannot be identical");
                    }
                    if (up.x == 0 && up.y == 0 && up.z == 0) {
                        throw new SceneJS.exceptions.InvalidLookAtConfigException
                                ("Invald lookAt parameters: up vector cannot be of zero length, ie. all elements zero");
                    }
                    mat = SceneJS._math.lookAtMat4c(
                            eye.x, eye.y, eye.z,
                            look.x, look.y, look.z,
                            up.x, up.y, up.z);
                }

                var superXform = backend.getTransform();
                if (!xform || !superXform.fixed || !cfg.fixed) {
                    var tempMat = SceneJS._math.mulMat4(superXform.matrix, mat);
                    xform = {
                        matrix: tempMat,
                        fixed: superXform.fixed && cfg.fixed
                    };
                }
                backend.setTransform(xform);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setTransform(superXform);
            });
};