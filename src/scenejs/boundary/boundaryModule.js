SceneJS._boundaryModule = new (function() {

    var viewMat;

    var boundaryStack = new Array(400);
    var stackLen = 0;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                viewMat = SceneJS._math_identityMat4();
                stackLen = 0;
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    /* When and if renderer requires the current view-space boundary, transform it into view-space and export it.
     * Whether this happens depends on what kind of rendering the renderer is doing, eg. if it needs to sort objects,
     * find intersections etc.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_NEEDS_BOUNDARIES,
            function() {
                if (dirty) {
                    var topBoundary = stackLen > 0 ? boundaryStack[stackLen - 1] : null;
                    if (topBoundary && !topBoundary.viewBox) {
                        topBoundary.viewBox = transformModelBoundaryToView(topBoundary.modelBox);
                    }
                    SceneJS._eventModule.fireEvent(SceneJS._eventModule.BOUNDARY_EXPORTED, topBoundary);
                    dirty = false;
                }
            });

    function transformModelBoundaryToView(boundary) {
        var modelCoords = [
            [boundary.min[0], boundary.min[1], boundary.min[2]],
            [boundary.max[0], boundary.min[1], boundary.min[2]],
            [boundary.max[0], boundary.max[1], boundary.min[2]],
            [boundary.min[0], boundary.max[1], boundary.min[2]],
            [boundary.min[0], boundary.min[1], boundary.max[2]],
            [boundary.max[0], boundary.min[1], boundary.max[2]],
            [boundary.max[0], boundary.max[1], boundary.max[2]],
            [boundary.min[0], boundary.max[1], boundary.max[2]]
        ];
        return new SceneJS._math_Box3().fromPoints(SceneJS._math_transformPoints3(viewMat, modelCoords));
    }

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushBoundary = function(modelBox, nodeId, observed) {
        boundaryStack[stackLen++] = {
            modelBox: modelBox,
            viewBox: null,
            nodeId: nodeId,
            observed: observed
        };
        dirty = true;
    };

    this.popBoundary = function() {
        stackLen--;
    };
})();
