/**
 * Backend that maintains a model-space viewing frustum computed from the current viewport and projection
 * and view transform matrices.
 *
 * Services queries on it from scene nodes (ie. intersections etc.).
 *
 * Tracks the viewport and matrices through incoming VIEWPORT_UPDATED, PROJECTION_TRANSFORM_UPDATED and
 * VIEW_TRANSFORM_UPDATED events.
 *
 * Lazy-computes the frustum on demand, caching it until any of the viewport or matrices is updated.
 *
 * Provides an interface through which scene nodes can test axis-aligned bounding boxes against the frustum,
 * eg. to query their intersection or projected size.
 *  @private
 *
 */
SceneJS._frustumModule = new (function() {

    var viewport;
    var projMat;
    var viewMat;
    var frustum;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                projMat = viewMat = SceneJS._math_identityMat4();
                viewport = [0,0,1,1];
                frustum = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEWPORT_UPDATED,
            function(v) {
                viewport = [v.x, v.y, v.width, v.height];
                frustum = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PROJECTION_TRANSFORM_UPDATED,
            function(params) {
                projMat = params.matrix;
                frustum = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
                frustum = null;
            });

    /**
     * Tests the given axis-aligned box for intersection with the frustum
     * @private
     * @param box
     */
    this.testAxisBoxIntersection = function(box) {
        return getFrustum().textAxisBoxIntersection(box);
    };

    var getFrustum = function() {
        if (!frustum) {
            frustum = new SceneJS._math_Frustum(viewMat, projMat, viewport);
        }
        return frustum;
    };

    /**
     * Returns the projected size of the given axis-aligned box with respect to the frustum
     * @private
     * @param box
     */
    this.getProjectedSize = function(box) {
        return getFrustum().getProjectedSize(box);
    };


    this.getProjectedState = function(box) {
        return getFrustum().getProjectedState(box);
    };
})();