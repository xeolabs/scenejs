/**
 * Backend that manages mesh deformation. Deformations are pushed and popped by "deform" nodes.
 *
 * @private
 */
SceneJS._deformModule = new (function() {
    var idStack = new Array(255);
    var deformStack = new Array(255);
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
                        SceneJS._renderModule.setDeform(idStack[stackLen - 1], deformStack[stackLen - 1]);
                    } else {
                        SceneJS._renderModule.setDeform();
                    }
                    dirty = false;
                }
            });

    this.pushDeform = function(id, deform) {
        var modelMat = SceneJS._modelTransformModule.getTransform().matrix;
        var vert;
        for (var i = 0, len = deform.verts.length; i < len; i++) {
            vert = deform.verts[i];
            vert.worldPos = SceneJS._math_transformPoint3(modelMat, [vert.x, vert.y, vert.z]);
        }
        idStack[stackLen] = id;
        deformStack[stackLen] = deform;
        stackLen++;
        dirty = true;
    };

    this.popDeform = function() {
     //   stackLen--;
        dirty = true;
    };

})();
