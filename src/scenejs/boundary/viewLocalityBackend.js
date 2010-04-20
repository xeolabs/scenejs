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
 */
SceneJS._backends.installBackend(

        "view-locality",

        function(ctx) {
            var eye;
            var radius = 2000;
            var radius2 = radius * radius;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        eye = { x: 0, y: 0, z: 0 };
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(transform) {
                        if (transform.lookAt) {
                            var e = transform.lookAt.eye;
                            eye = [e.x, e.y, e.z];
                        } else {
                            eye = [0,0,0];
                        }
                    });

            /** Node-facing API
             */
            return {

                testAxisBoxIntersection : function(box) { // Simple Arvo method - TODO: Larsson-Arkenine-Moller-Lengyel method
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
                    if (dmin <= radius2) {
                        return true;
                    }
                    return false;
                }
            };
        });