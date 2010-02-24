/** Axis-aligned bounding box
 *
 */
SceneJS.axisBoundary = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var backend = SceneJS._backends.getBackend('view-volume');
    var objectCoords;
    var modelCoords;

    return SceneJS._utils.createNode(
            function(scope) {

                if (!modelCoords || !cfg.fixed) {
                    var params = cfg.getParams(scope);

                    /* First version - mandatory manual configuration
                     */
                    if (!params.xmin || !params.ymin || !params.zmin || !params.xmax || !params.ymax || !params.zmax) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Mandatory boundingBox parameter missing: one or more of xmin, ymin, zmin, xmax, ymax or zmax");
                    }

                    /* Create local object-space coordinates
                     */
                    objectCoords = [
                        [params.xmin, params.ymin, params.zmin],
                        [params.xmax, params.ymin, params.zmin],
                        [params.xmax, params.ymax, params.zmin],
                        [params.xmin, params.ymax, params.zmin],

                        [params.xmin, params.ymin, params.zmax],
                        [params.xmax, params.ymin, params.zmax],
                        [params.xmax, params.ymax, params.zmax],
                        [params.xmin, params.ymax, params.zmax]
                    ];
                }

                //   if (!modelCoords || !cfg.fixed || !backend.getSafeToCache()) {  // TODO: free the model coords if possible

                /* Transform boundary to model space
                 */
                modelCoords = backend.modelTransform(objectCoords);
                //  }

                /* Transform boundary to homogeneous view space
                 */
                var viewCoords = backend.viewAndProjectionTransform(modelCoords);

                switch (backend.testViewVolumeCoordsIntersection(viewCoords)) {
                    case SceneJS._math.INTERSECT_FRUSTUM:
                    case SceneJS._math.INSIDE_FRUSTUM:

                        SceneJS._utils.visitChildren(cfg, scope);
                        break;

                    case SceneJS._math.OUTSIDE_FRUSTUM:
                        break;
                }
            });
};


