/**
 * Bounding box node - provides view-frustum culling and level-of-detail selection
 */
(function() {

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
                function(data) {

                    if (!cfg.fixed || !(box || objectCoords)) {
                        var params = cfg.getParams(data);

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
                                states.push(STAGE_REMOTE);
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

                    var local = localityBackend.testAxisBoxIntersection(box);

                    if (local) {
                        var result = backend.testAxisBoxIntersection(box);

                        switch (result) {
                            case SceneJS._math.INTERSECT_FRUSTUM:  // TODO: GL clipping hints

                            case SceneJS._math.INSIDE_FRUSTUM:

                                if (levels) { // Level-of-detail mode

                                    var size = backend.getProjectedSize(box);
                                    for (var i = levels.length - 1; i >= 0; i--) {
                                        if (levels[i] <= size) {
                                            var state = states[i];
                                            SceneJS._utils.visitChild(cfg, i, data);
                                            return;
                                        }
                                    }
                                } else {
                                    SceneJS._utils.visitChildren(cfg, data);
                                }
                                break;

                            case SceneJS._math.OUTSIDE_FRUSTUM:
                                break;
                        }
                    }
                });
    };
})();