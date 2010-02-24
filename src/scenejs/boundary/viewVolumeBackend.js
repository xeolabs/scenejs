/**
 *
 */

SceneJS._backends.installBackend(

        "view-volume",

        function(ctx) {

            var projMat;
            var viewMat;
            var frustum;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        projMat = viewMat = SceneJS._math.identityMat4();
                        frustum = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED,
                    function(params) {
                        projMat = params.matrix;
                        frustum = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                        frustum = null;
                    });

            var getFrustum = function() {
                if (!frustum) {
                    frustum = new SceneJS._math.Frustum(SceneJS._math.mulMat4(projMat, viewMat));
                }
                return frustum;
            };

            ctx.viewVolume = {

                getFrustum: getFrustum,

                testViewVolumeCoordsIntersection : function(coords) {
                    return getFrustum().pointsIntersection(coords);
                }
            };


            //            this.modelTransform = function(coords) {
            //                var tfunc = ctx.modelTransform.transformPoint3;
            //                var coords2 = [];
            //                for (var i = 0; i < coords.length; i++) {
            //                    coords2.push(tfunc(coords[i]));
            //                }
            //                return coords2;
            //            };
            //
            //            this.viewAndProjectionTransform = function(coords) {
            //                var tfuncView = ctx.viewTransform.transformPoint3;
            //                var tfuncProj = ctx.projection.transformPoint3;
            //                var coords2 = [];
            //                for (var i = 0; i < coords.length; i++) {
            //                    coords2.push(tfuncProj(tfuncView(coords[i])));
            //                }
            //                return coords2;
            //            };
            //
            //            this.getProjectedBoundary = function(coords) {
            //                var tfuncView = ctx.viewTransform.transformPoint3;
            //                var tfuncProj = ctx.projection.transformPoint3;
            //                var pBound = {
            //                    xmin : 1000000000000,
            //                    ymin : 1000000000000,
            //                    xmax : -1000000000000,
            //                    ymax : -1000000000000
            //                };
            //                for (var i = 0; i < coords.length; i++) {
            //                    var p = tfuncProj(tfuncView(coords[i]));
            //                    var x = p.x * p.w;
            //                    var y = p.y * p.w;
            //                    if (x < pBound.xmin) {
            //                        pBound.xmin = x;
            //                    }
            //                    if (y < pBound.ymin) {
            //                        pBound.ymin = y;
            //                    }
            //                    if (x > pBound.xmax) {
            //                        pBound.xmax = x;
            //                    }
            //                    if (y > pBound.ymax) {
            //                        pBound.ymax = y;
            //                    }
            //                }
            //                return pBound;
            //            };

//            this.testViewVolumeCoordsIntersection = function(coords) {
//                return ctx.testViewVolumeCoordsIntersection(coords);
//            };
        });