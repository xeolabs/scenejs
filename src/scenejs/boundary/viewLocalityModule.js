/**
 * Backend that maintains a model-space sphere centered about the current eye position, computed from the
 * current view transform matrix.
 *
 * Services queries on it from scene nodes (ie. intersections etc.).
 *
 * Tracks the matrix through incoming VIEW_TRANSFORM_UPDATED events.
 *
 * Lazy-computes the sphere on demand, caching it until the matrix is updated.
 *
 * Provides an interface through which scene nodes can test axis-aligned bounding boxes for intersection
 * with the sphere.
 *
 * @private
 */
SceneJS._localityModule = new (function() {

    var radiiStack = new Array(255);
    var stackLen = 0;
    
    var eye;
    var radii2;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                eye = { x: 0, y: 0, z: 0 };
                var radii = {
                    inner : 100000,
                    outer : 200000
                };
                radii2 = {
                    inner : radii.inner * radii.inner,
                    outer : radii.outer * radii.outer
                };
                radiiStack[0] = radii2;
                stackLen = 1;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_UPDATED,
            function(transform) {
                if (transform.lookAt) {
                    var e = transform.lookAt.eye;
                    eye = [e.x, e.y, e.z];
                } else {
                    eye = [0,0,0];
                }
            });

    /**
     * @private
     */
    function intersects(radius2, box) { // Simple Arvo method - TODO: Larsson-Arkenine-Moller-Lengyel method
        var dmin = 0;
        var e;
        for (var i = 0; i < 3; i++) {
            if (eye[i] < box.min[i]) {
                e = eye[i] - box.min[i];
                dmin += (e * e);
            } else {
                if (eye[i] > box.max[i]) {
                    e = eye[i] - box.max[i];
                    dmin += (e * e);
                }
            }
        }
        return (dmin <= radius2);
    }

    this.pushRadii = function(r) {
        radii2 = {
            inner : r.inner * r.inner,
            outer : r.outer * r.outer
        };
        radiiStack[stackLen++] = radii2;
    };

    this.popRadii = function() {
        radii2 = radiiStack[--stackLen];
    };

    /** Tests the given axis-aligned bounding box for intersection with the outer locality sphere
     *
     * @param box
     * @private
     */
    this.testAxisBoxIntersectOuterRadius = function(box) {
        return intersects(radii2.outer, box);
    };

    /** Tests the given axis-aligned bounding box for intersection with the inner locality sphere
     *
     * @param box
     * @private
     */
    this.testAxisBoxIntersectInnerRadius = function(box) {
        return intersects(radii2.inner, box);
    };
})();