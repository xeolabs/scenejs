SceneJS._boundaryModule = new (function() {

    var viewMat;
    var boundaryStack = new Array(1000);
    var stackLen = 0;
    var dirty;
    var boundaries = new Array(1000);
    var numBoundaries;
    var observedBoundaries = new Array(500);
    var numObservedBoundaries;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                viewMat = SceneJS._math_identityMat4();
                stackLen = 0;
                dirty = true;
                numBoundaries = 0;          // Number of non-observed boundingBoxes
                numObservedBoundaries = 0;  // number of observed boundingBoxes
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

    /* Export current view-space boundary when render needs it. Whether this happens depends on what kind
     * of rendering the renderer is doing, eg. if it needs to sort objects, find intersections etc.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_NEEDS_BOUNDARIES,
            function() {
                if (dirty) {
                    var topBoundary = stackLen > 0 ? boundaryStack[stackLen - 1] : null;
                    SceneJS._eventModule.fireEvent(SceneJS._eventModule.BOUNDARY_EXPORTED, topBoundary);
                    dirty = false;
                }
            });

    this.pushBoundary = function(modelBox, viewBox, nodeId, isectState, observed) {
        var boundary = {
            modelBox: modelBox,
            viewBox: viewBox,
            nodeId: nodeId ,
            isectState : isectState
        };
        boundaryStack[stackLen++] = boundary;
        dirty = true;
        if (observed) {
            observedBoundaries[numObservedBoundaries++] = boundary;
        } else {
            boundaries[numBoundaries++] = boundary;
        }
    };

    this.popBoundary = function() {
        stackLen--;
    };

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_DEACTIVATED,
            function() {
                if (numObservedBoundaries > 0) {
                    findViewBoundingBoxIntersects(observedBoundaries, numObservedBoundaries, boundaries, numBoundaries);
                }
            });

    function findViewBoundingBoxIntersects(list1, len1, list2, len2) {
        var b1, b2;
        var isects = {};
        var numIntersects = 0;
        for (var i = 0; i < len1; i++) {
            for (var j = 0; j < len2; j++) {
                if (list1[i].nodeId != list2[j].nodeId) {
                    b1 = list1[i].viewBox;
                    b2 = list2[j].viewBox;

                    if (b1.max[0] < b2.min[0] ||
                        b1.max[1] < b2.min[1] ||
                        b1.max[2] < b2.min[2] ||

                        b2.max[0] < b1.min[0] ||
                        b2.max[1] < b1.min[1] ||
                        b2.max[2] < b1.min[2]) {
                    } else {
                        isects[list2[j].nodeId] = true;
                        numIntersects ++;
                    }
                }
            }
            if (numIntersects > 0) {
                SceneJS._nodeIDMap[list1[i].nodeId]._fireEvent("intersect", { nodeIds: isects });
                isects = {};
            }
        }
    }
})();
