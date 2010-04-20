/**
 * Scene node that constructs a 'lookAt' view transformation matrix and sets it on the current shader.
 */

(function() {
    var backend = SceneJS._backends.getBackend('view-transform');
    var errorBackend = SceneJS._backends.getBackend('error');

    var cloneVec = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    SceneJS.lookAt = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);

        var mat;
        var fixed = cfg.fixed;
        var xform;

        return SceneJS._utils.createNode(
                function(traversalContext, data) {
                    if (!mat || !fixed) {
                        var nodeParams = new SceneJS._utils.NodeParams("SceneJS.lookAt", cfg.getParams(data), data);

                        var eye = cloneVec(nodeParams.getParam("eye", data, true), { x: 0.0, y: 0.0, z: 0.0 });
                        var look = cloneVec(nodeParams.getParam("look", data, false), { x: 0.0, y: 0.0, z: 0.0 });
                        var up = cloneVec(nodeParams.getParam("up", data, false), { x: 0.0, y: 1.0, z: 0.0 });

                        if (eye.x == look.x && eye.y == look.y && eye.z == look.z) {
                            throw new SceneJS.exceptions.InvalidLookAtConfigException
                                    ("Invald lookAt parameters: eye and look cannot be identical");
                        }
                        if (up.x == 0 && up.y == 0 && up.z == 0) {
                            errorBackend.fatalError(
                                    new SceneJS.exceptions.InvalidLookAtConfigException
                                            ("Invald lookAt parameters: up vector cannot be of zero length, ie. all elements zero"));
                        }

                        mat = SceneJS_math_lookAtMat4c(
                                eye.x, eye.y, eye.z,
                                look.x, look.y, look.z,
                                up.x, up.y, up.z);

                        fixed = cfg.fixed && nodeParams.fixed;
                    }

                    var superXform = backend.getTransform();
                    if (!xform || !superXform.fixed || !fixed) {
                        var tempMat = SceneJS_math_mulMat4(superXform.matrix, mat);
                        xform = {
                            type: "lookat",
                            matrix: tempMat,
                            lookAt : {
                                eye: eye,
                                look: look,
                                up: up
                            },
                            fixed: superXform.fixed && fixed
                        };
                    }
                    backend.setTransform(xform);
                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                    backend.setTransform(superXform);
                });
    };
})()