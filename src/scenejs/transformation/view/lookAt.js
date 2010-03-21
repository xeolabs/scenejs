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

                    params.eye = params.eye ? cloneVec(params.eye) : { x: 0.0, y: 0.0, z: 0.0 };
                    params.look = params.look ? cloneVec(params.look) : { x: 0.0, y: 0.0, z: 0.0 };
                    params.up = params.up ? cloneVec(params.up) : { x: 0.0, y: 1.0, z: 0.0 };

                    if (params.eye.x == params.look.x && params.eye.y == params.look.y && params.eye.z == params.look.z) {
                        throw new SceneJS.exceptions.InvalidLookAtConfigException
                                ("Invald lookAt parameters: eye and look cannot be identical");
                    }
                    if (params.up.x == 0 && params.up.y == 0 && params.up.z == 0) {
                        throw new SceneJS.exceptions.InvalidLookAtConfigException
                                ("Invald lookAt parameters: up vector cannot be of zero length, ie. all elements zero");
                    }
                    mat = SceneJS._math.lookAtMat4c(
                            params.eye.x, params.eye.y, params.eye.z,
                            params.look.x, params.look.y, params.look.z,
                            params.up.x, params.up.y, params.up.z);
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