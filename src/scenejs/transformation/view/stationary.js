/**
 * Defined as a sub-node of a lookat, this node will disable the effects of the
 * lookat's translation for its sub-nodes. These are useful as a super node for
 * background objects such as sky boxes, that may rotate about the viewpoint
 * while not translating, ie. always staying in the distance. These nodes will
 * silently do nothing unless they are defined with in a lookup.
 */
SceneJs.stationary = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend = SceneJs.backends.getBackend('view-transform');
    var xform;

   var rotateMat = function(pos, target, up) {
           var pos4 = [pos[0],pos[1],pos[2],0.0];
           var target4 = [target[0],target[1],target[2],0.0];
           var up4 = [up[0],up[1],up[2],0.0];

           var v = SceneJs.math.normalizeVec4(SceneJs.math.subVec4(target4, pos4));
           var u = SceneJs.math.normalizeVec4(up4);
           var s = SceneJs.math.normalizeVec4(SceneJs.math.cross3Vec4(v, u));

           u = SceneJs.math.normalizeVec4(SceneJs.math.cross3Vec4(s, v));

           var m = new SceneJs.math.mat4();

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

    return function(scope) {
        var superXform = backend.getTransform();
        var lookat = superXform.lookat;
        if (lookat) {
            if (!xform || !superXform.fixed) {
                xform = {
                    matrix: SceneJs.math.mulMat4(
                            superXform.matrix,
                            SceneJs.math.translationMat4c(
                                    lookat.eye.x,
                                    lookat.eye.y,
                                    lookat.eye.z)),
                    lookat: lookat,
                    fixed: superXform.fixed
                };
            }
            backend.setTransform(xform);
            SceneJs.utils.visitChildren(cfg, scope);
            backend.setTransform(superXform);
        } else {
            SceneJs.utils.visitChildren(cfg, scope);
        }
    };
};

