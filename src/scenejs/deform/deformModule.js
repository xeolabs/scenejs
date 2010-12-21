/**
 * Backend that manages mesh deformation. Deformations are pushed and popped by "deform" nodes.
 *
 * @private
 */
SceneJS._deformModule = new (function() {
    var viewMat;
    var modelMat;

    var deformStack = new Array(255);
    var stackLen = 0;
    var dirty;

    /* Make fresh flag stack for new render pass, containing default flags
     * to enable/disable various things for subgraph
     */
    var self = this;
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                deformStack = [];
                stackLen = 0;
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MODEL_TRANSFORM_UPDATED,
            function(params) {
                modelMat = params.matrix;
            });

    /* Export deform when renderer needs them - only when current set not exported (dirty)
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._shaderModule.setDeform(stackLen > 0 ? deformStack[stackLen - 1] : null);
                    dirty = false;
                }
            });

    /* Push deform to top of stack - stack top becomes active deformation
     */
    this.pushDeform = function(deform) {
        var d = {
            verts: []
        };
        var vert;
        for (var i = 0, len = deform.verts.length; i < len; i++) {
            vert = deform.verts[i];
            d.verts.push({
                pos: SceneJS._math_transformPoint3(viewMat, SceneJS._math_transformPoint3(modelMat, [vert.x, vert.y, vert.z])) ,
                mode: vert.mode,
                weight: vert.weight
            });
        }
        deformStack[stackLen++] = d;
        dirty = true;
    };

    /* Pop deform to top of stack - stack top becomes active deformation
     */
    this.popDeform = function() {
        stackLen--;
        dirty = true;
    };

})();

