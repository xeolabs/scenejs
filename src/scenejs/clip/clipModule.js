/**
 * Backend that manages scene clipping planes.
 *
 * @private
 */
var SceneJS_clipModule = new (function() {
    var idStack = new Array(255);
    var clipStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });   

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setClips(idStack[stackLen - 1], clipStack.slice(0, stackLen));
                    } else {
                        SceneJS_renderModule.setClips();
                    }
                    dirty = false;
                }
            });

    this.pushClip = function(id, clip) {
        var modelMat = SceneJS_modelTransformModule.getTransform().matrix;

        var worldA = SceneJS_math_transformPoint3(modelMat, clip.a);
        var worldB = SceneJS_math_transformPoint3(modelMat, clip.b);
        var worldC = SceneJS_math_transformPoint3(modelMat, clip.c);

        var normal = SceneJS_math_normalizeVec3(
                SceneJS_math_cross3Vec4(
                        SceneJS_math_normalizeVec3(
                                SceneJS_math_subVec3(worldB, worldA, [0,0,0]), [0,0,0]),
                        SceneJS_math_normalizeVec3(
                                SceneJS_math_subVec3(worldB, worldC, [0,0,0]), [0,0,0])));

        var dist = SceneJS_math_dotVector3(normal, worldA);

        clip.normalAndDist = [normal[0], normal[1], normal[2], dist];

        clipStack[stackLen] = clip;
        idStack[stackLen] = id;
        stackLen++;
        dirty = true;
    };

    // No pop because clip planes apply to successor nodes 

})();

