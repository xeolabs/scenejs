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
 *
 */
var SceneJS_frustumModule = new (function() {

    var viewport;
    var projMat;
    var viewMat;
    var frustum;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                projMat = viewMat = SceneJS_math_identityMat4();
                viewport = [0,0,1,1];
                frustum = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEWPORT_UPDATED,
            function(v) {
                viewport = [v.x, v.y, v.width, v.height];
                frustum = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED,
            function(params) {
                projMat = params.matrix;
                frustum = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
                frustum = null;
            });

    var getFrustum = function() {
        if (!frustum) {
            frustum = new SceneJS_math_Frustum(viewMat, projMat, viewport);
        }
        return frustum;
    };

    /**
     * Tests the given axis-aligned box for intersection with the frustum
     *
     * @param box
     */
    this.testAxisBoxIntersection = function(box) {
        return getFrustum().textAxisBoxIntersection(box);
    };

    /**
     * Returns the projected size of the given axis-aligned box with respect to the frustum
     *
     * @param box
     */
    this.getProjectedSize = function(box) {
        return getFrustum().getProjectedSize(box);
    };
})();