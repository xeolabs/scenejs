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
            var radii;
            var radii2;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        eye = { x: 0, y: 0, z: 0 };
                        radii = {
                            inner : 2000,
                            outer : 2500
                        };
                        radii2 = {
                            inner : radii.inner * radii.inner,
                            outer : radii.outer * radii.outer
                        };
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

            /** Node-facing API
             */
            return {

                setRadii : function(r) {
                    radii = {
                        outer : r.inner,
                        inner : r.outer
                    };
                    radii2 = {
                        inner : r.inner * r.inner,
                        outer : r.outer * r.outer
                    };
                },

                getRadii : function() {
                    return radii;
                },

                testAxisBoxIntersectOuterRadius : function(box) {
                    return intersects(radii2.outer, box);
                },

                testAxisBoxIntersectInnerRadius : function(box) {
                    return intersects(radii2.inner, box);
                }
            };
        });