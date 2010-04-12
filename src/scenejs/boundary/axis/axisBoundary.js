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

        var r = backend.testViewVolumeCoordsIntersection(viewCoords);
        var x = r;
        switch (r) {
            case SceneJS_math_INTERSECT_FRUSTUM:

            case SceneJS_math_INSIDE_FRUSTUM:

                SceneJs.utils.visitChildren(cfg, scope);
                    SceneJs.numTeapots++;
                break;

            case SceneJS_math_OUTSIDE_FRUSTUM:
  
                break;
        }
    };
};


