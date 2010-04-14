/**
 * Backend for the axis-aligned boundary node, provides ability to instance the boundary extents into view space
 * and test for its intersection with the view volume.
 */

SceneJS._backends.installBackend(
        new (function() {

            this.type = 'axis-boundary';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

            };

            /** Transforms coordinates by the current modelling matrix
             */
            this.modelTransform = function(coords) {
                var tfunc = ctx.modelTransform.transformPoint3;
                var coords2 = [];
                for (var i = 0; i < coords.length; i++) {
                    coords2.push(tfunc(coords[i]));
                }
                return coords2;
            };

            this.viewAndProjectionTransform = function(coords) {
                var tfuncView = ctx.viewTransform.transformPoint3;
               // var tfuncProj = ctx.projection.transformPoint3;
                var coords2 = [];
                for (var i = 0; i < coords.length; i++) {
                    coords2.push(tfuncView(coords[i]));
                }
                return coords2;
            };

            /** Returns true if the coordinate space defined by the current view matrices is
             * fixed, ie. not animated, at this level of scene traversal. If not, then it is not safe
             * for the client node to memoize its boundary once it is are transformed, because the transformation
             * is therefore likely to vary, causing the boundary to move around.
             */
            this.getSafeToCache = function() {
                return ctx.modelTransform.isFixed();
            };

            this.getProjectedBoundary = function(coords) {
                var tfuncView = ctx.viewTransform.transformPoint3;
               // var tfuncProj = ctx.projection.transformPoint3;
                var pBound = {
                    xmin : 1000000000000,
                    ymin : 1000000000000,
                    xmax : -1000000000000,
                    ymax : -1000000000000
                };
                for (var i = 0; i < coords.length; i++) {
                    var p = tfuncView(coords[i]);
                    var x = p.x * p.w;
                    var y = p.y * p.w;
                    if (x < pBound.xmin) {
                        pBound.xmin = x;
                    }
                    if (y < pBound.ymin) {
                        pBound.ymin = y;
                    }
                    if (x > pBound.xmax) {
                        pBound.xmax = x;
                    }
                    if (y > pBound.ymax) {
                        pBound.ymax = y;
                    }
                }
                return pBound;
            };

            this.testViewVolumeCoordsIntersection = function(coords) {
                return ctx.viewTransform.getTransform().frustum.pointsIntersection(coords);
            };
        })());