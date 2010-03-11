/**
 * Bounding box node - provides view-frustum culling and level-of-detail selection
 */
(function() {

    var backend = SceneJS._backends.getBackend("view-frustum");
    var modelTransformBackend = SceneJS._backends.getBackend("model-transform");

    SceneJS.boundingBox = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var objectCoords;
        var box;
        var levels;

        return SceneJS._utils.createNode(
                function(scope) {

                    if (!cfg.fixed || !(box || objectCoords)) {
                        var params = cfg.getParams(scope);

                        if (!params.xmin || !params.ymin || !params.zmin || !params.xmax || !params.ymax || !params.zmax) {
                            throw new SceneJS.exceptions.NodeConfigExpectedException
                                    ("Mandatory boundingBox parameter missing: one or more of xmin, ymin, zmin, xmax, ymax or zmax");
                        }

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
                                throw new SceneJS.exceptions.NodeConfigExpectedException
                                        ("boundingBox levels parameter should have a value for each child node");
                            }

                            for (var i = 1; i < params.levels.length; i++) {
                                if (params.levels[i - 1] >= params.levels[i]) {
                                    throw new SceneJS.exceptions.NodeConfigExpectedException
                                            ("boundingBox levels parameter should be an ascending list of unique values");
                                }
                            }
                            levels = params.levels;
                        }
                    }

                    if (objectCoords) {
                        var modelTransform = modelTransformBackend.getTransform();
                        box = new SceneJS._math.Box3().fromPoints(
                                SceneJS._math.transformPoints3(
                                        modelTransform.matrix,
                                        objectCoords)
                                );

                        if (modelTransform.fixed) {
                            objectCoords = null;
                        }
                    }

                    var result = backend.testAxisBoxIntersection(box);

                    switch (result) {
                        case SceneJS._math.INTERSECT_FRUSTUM:  // TODO: GL clipping hints

                        case SceneJS._math.INSIDE_FRUSTUM:

                            if (levels) { // Level-of-detail mode

                                var size = backend.getProjectedSize(box);
                                for (var i = levels.length - 1; i >= 0; i--) {
                                    if (levels[i] <= size) {
                                        SceneJS._utils.visitChild(cfg, i, scope);
                                        return;
                                    }
                                }
                            } else {
                                SceneJS._utils.visitChildren(cfg, scope);
                            }
                            break;

                        case SceneJS._math.OUTSIDE_FRUSTUM:
                            break;
                    }
                });
    };
})();