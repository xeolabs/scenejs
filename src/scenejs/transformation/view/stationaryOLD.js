/**
 * Defined as a sub-node of a lookAt, this node will disable the effects of the
 * lookAt's translation for its sub-nodes. These are useful as a super node for
 * background objects such as sky boxes, that may rotate about the viewpoint
 * while not translating, ie. always staying in the distance. These nodes will
 * silently do nothing unless they are defined with in a lookup.
 */
SceneJS.stationary = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('view-transform');
    var xform;

    var rotateMat = function(pos, target, up) {
        var pos4 = [pos[0],pos[1],pos[2],0.0];
        var target4 = [target[0],target[1],target[2],0.0];
        var up4 = [up[0],up[1],up[2],0.0];

        var v = SceneJS._math.normalizeVec4(SceneJS._math.subVec4(target4, pos4));
        var u = SceneJS._math.normalizeVec4(up4);
        var s = SceneJS._math.normalizeVec4(SceneJS._math.cross3Vec4(v, u));

        u = SceneJS._math.normalizeVec4(SceneJS._math.cross3Vec4(s, v));

        var m = new SceneJS._math.mat4();

        m[0] = s[0];
        m[1] = u[0];
        m[2] = -v[0];
        m[3] = 0.0;

        m[4] = s[1];
        m[5] = u[1];
        m[6] = -v[1];
        m[7] = 0.0;

        m[8] = s[2];
        m[9] = u[2];
        m[10] = -v[2];
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        return m;
    };

    return SceneJS._utils.createNode(
            function(data) {
                var superXform = backend.getTransform();
                var lookAt = superXform.lookAt;
                if (lookAt) {
                    if (!xform || !superXform.fixed) {
                        xform = {
                            matrix: SceneJS._math.mulMat4(
                                    superXform.matrix,
                                    SceneJS._math.translationMat4c(
                                            lookAt.eye.x,
                                            lookAt.eye.y,
                                            lookAt.eye.z)),
                            lookAt: lookAt,
                            fixed: superXform.fixed
                        };
                    }
                    backend.setTransform(xform);
                    SceneJS._utils.visitChildren(cfg, data);
                    backend.setTransform(superXform);
                } else {
                    SceneJS._utils.visitChildren(cfg, data);
                }
            });
};

