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

            var viewMat;
            var sphere;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        viewMat = SceneJS._math.identityMat4();
                        sphere = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                        sphere = null;
                    });

            var getSphere = function() {
                if (!sphere) {
                    //frustum = new SceneJS._math.Frustum(viewMat, projMat, viewport);
                }
                return sphere;
            };

            /** Node-facing API
             */
            return {

                testAxisBoxIntersection : function(box) {
                     return true;
                  //  return getFrustum().textAxisBoxIntersection(box);
                }
            };
        });