/** Axis-aligned bounding box
 *
 */
SceneJs.axisBoundary = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('axis-boundary');
    var objectCoords;
    var modelCoords;

    return function(scope) {

        if (!modelCoords || !cfg.fixed) {
            var params = cfg.getParams(scope);

            /* First version - mandatory manual configuration
             */
            if (!params.xmin || !params.ymin || !params.zmin || !params.xmax || !params.ymax || !params.zmax) {
                throw new SceneJs.exceptions.NodeConfigExpectedException
                        ("Mandatory boundingBox parameter missing: one or more of xmin, ymin, zmin, xmax, ymax or zmax");
            }

            /* Create local object-space coordinates
             */
            objectCoords = [
                {
                    x: params.xmin,
                    y: params.ymin,
                    z: params.zmin,
                    w: 1.0
                },
                {
                    x: params.xmax,
                    y: params.ymin,
                    z: params.zmin,
                    w: 1.0
                },
                {
                    x: params.xmax,
                    y: params.ymax,
                    z: params.zmin,
                    w: 1.0
                },
                {
                    x: params.xmin,
                    y: params.ymax,
                    z: params.zmin,
                    w: 1.0
                },
                {
                    x: params.xmin,
                    y: params.ymin,
                    z: params.zmax,
                    w: 1.0
                },
                {
                    x: params.xmax,
                    y: params.ymin,
                    z: params.zmax,
                    w: 1.0
                },
                {
                    x: params.xmax,
                    y: params.ymax,
                    z: params.zmax,
                    w: 1.0
                },
                {
                    x: params.xmin,
                    y: params.ymax,
                    z: params.zmax,
                    w: 1.0
                }
            ];
        }

        if (!modelCoords || !cfg.fixed || !backend.getSafeToCache()) {  // TODO: free the model coords if possible

            /* Transform boundary to model space
             */
            modelCoords = backend.modelTransform(objectCoords);
        }

        /* Transform boundary to homogeneous view space
         */
        var viewCoords = backend.viewAndProjectionTransform(modelCoords);
        
        var r = backend.testViewVolumeCoordsIntersection(viewCoords);

        if (r >= 0) {
            SceneJs.utils.visitChildren(cfg, scope);
        } else {
           var x;
        }
    };
};


