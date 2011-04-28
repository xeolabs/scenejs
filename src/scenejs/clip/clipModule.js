/**
 * Backend that manages scene clipping planes.
 *
 * @private
 */
SceneJS._clipModule = new (function() {
    var idStack = new Array(255);
    var clipStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS._renderModule.setClips(idStack[stackLen - 1], clipStack.slice(0, stackLen));
                    } else {
                        SceneJS._renderModule.setClips();
                    }
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushClip = function(id, clip) {
        var modelMat = SceneJS._modelTransformModule.getTransform().matrix;       

        var worldA = SceneJS._math_transformPoint3(modelMat, clip.a);
        var worldB = SceneJS._math_transformPoint3(modelMat, clip.b);
        var worldC = SceneJS._math_transformPoint3(modelMat, clip.c);

        var normal = SceneJS._math_normalizeVec3(
                SceneJS._math_cross3Vec4(
                        SceneJS._math_normalizeVec3(
                                SceneJS._math_subVec3(worldB, worldA, [0,0,0]), [0,0,0]),
                        SceneJS._math_normalizeVec3(
                                SceneJS._math_subVec3(worldB, worldC, [0,0,0]), [0,0,0])));

        var dist = SceneJS._math_dotVector3(normal, worldA);

        clip.normalAndDist = [normal[0], normal[1], normal[2], dist];

        clipStack[stackLen] = clip;
        idStack[stackLen] = id;
        stackLen++;
        dirty = true;
    };

    // No pop because clip planes apply to successor nodes 

})();

