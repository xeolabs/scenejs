/**
 * Bounding box node - provides view-frustum culling and level-of-detail selection
 */
(function() {

    var errorBackend = SceneJS._backends.getBackend("error");
    var backend = SceneJS._backends.getBackend("view-frustum");
    var localityBackend = SceneJS._backends.getBackend("view-locality");
    var modelTransformBackend = SceneJS._backends.getBackend("model-transform");

    const STAGE_REMOTE = 0;
    const STAGE_SCENE = 1;
    const STATE_BUFFERED = 2;

    SceneJS.boundingBox = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var objectCoords;
        var box;
        var levels;
        var states = [];

        return SceneJS._utils.createNode(
                function(traversalContext, data) {

                    if (!cfg.fixed || !(box || objectCoords)) {
                        var params = cfg.getParams(data);

                        params.xmin = params.xmin || 0;
                        params.ymin = params.ymin || 0;
                        params.zmin = params.zmin || 0;
                        params.xmax = params.xmax || 0;
                        params.ymax = params.ymax || 0;
                        params.zmax = params.zmax || 0;
//                        if (!params.xmin || !params.ymin || !params.zmin || !params.xmax || !params.ymax || !params.zmax) {
//                            errorBackend.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
//                                    ("SceneJS.boundingBox mandatory property missing: one or more of xmin, ymin, zmin, xmax, ymax or zmax"));
//                        }

                        var modelTransform = modelTransformBackend.getTransform();
                        if (modelTransform.identity) {  // No model transform
                            box = {
                                min: [params.xmin, params.ymin, params.zmin],
                                max: [params.xmax, params.ymax, params.zmax]
                            };
                        } else {                        // Model transform either fixed or dynamic
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
                        if (params.levels) {
                            if (params.levels.length != cfg.children.length) {
                                errorBackend.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                                        ("SceneJS.boundingBox levels property should have a value for each child node"));
                            }

                            for (var i = 1; i < params.levels.length; i++) {
                                if (params.levels[i - 1] >= params.levels[i]) {
                                    errorBackend.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                                            ("SceneJS.boundingBox levels property should be an ascending list of unique values"));
                                }
                                states.push(STAGE_REMOTE);
                            }
                            levels = params.levels;
                        }
                    }

                    if (objectCoords) {
                        var modelTransform = modelTransformBackend.getTransform();
                        box = new SceneJS_math_Box3().fromPoints(
                                SceneJS_math_transformPoints3(
                                        modelTransform.matrix,
                                        objectCoords)
                                );

                        if (modelTransform.fixed) {
                            objectCoords = null;    // Ensures we don't recreate axis box next time
                        }
                    }

                    var local = localityBackend.testAxisBoxIntersection(box);

                    if (local) {
                        var result = backend.testAxisBoxIntersection(box);
                           window.countTeapots++;
                        switch (result) {
                            case SceneJS_math_INTERSECT_FRUSTUM:  // TODO: GL clipping hints

                            case SceneJS_math_INSIDE_FRUSTUM:

                                if (levels) { // Level-of-detail mode

                                    var size = backend.getProjectedSize(box);
                                    for (var i = levels.length - 1; i >= 0; i--) {
                                        if (levels[i] <= size) {
                                            var state = states[i];
                                            SceneJS._utils.visitChild(cfg, i, traversalContext, data);
                                            return;
                                        }
                                    }
                                } else {
                                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                                }
                                break;

                            case SceneJS_math_OUTSIDE_FRUSTUM:
                                break;
                        }
                    }
                });
    };
})();