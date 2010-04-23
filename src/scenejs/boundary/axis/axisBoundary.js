/** Axis-aligned bounding box
 *
 */
SceneJS.axisBoundary = function() {
    var cfg = SceneJS.utils.getNodeConfig(arguments);

    var errorBackend = SceneJS._error;
    var backend = SceneJS._backends.getBackend('axis-boundary');
    var objectCoords;
    var modelCoords;

    return function(scope) {

        if (!modelCoords || !cfg.fixed) {
            var params = cfg.getParams(scope);

            /* First version - mandatory manual configuration
             */
            if (!params.xmin || !params.ymin || !params.zmin || !params.xmax || !params.ymax || !params.zmax) {
               errorBackend.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                                    ("SceneJS.axisBoundary propertyr missing: one or more of xmin, ymin, zmin, xmax, ymax or zmax"));
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

                SceneJS.utils.visitChildren(cfg, scope);
                    SceneJS.numTeapots++;
                break;

            case SceneJS_math_OUTSIDE_FRUSTUM:
  
                break;
        }
    };
};


