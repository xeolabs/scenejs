/**
 * Bounding box node - provides view-frustum culling and level-of-detail selection
 */
(function() {

    var errorBackend = SceneJS._backends.getBackend("error");
    var backend = SceneJS._backends.getBackend("view-frustum");
    var localityBackend = SceneJS._backends.getBackend("view-locality");
    var modelTransformBackend = SceneJS._backends.getBackend("model-transform");

    SceneJS.boundingBox = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);      

        return SceneJS._utils.createNode(
                "boundingBox",
                cfg.children,
                
                new (function() {

                    const STAGE_REMOTE = 0;
                    const STAGE_SCENE = 1;
                    const STATE_BUFFERED = 2;

                   
                    var objectCoords;
                    var box;
                    var levels;
                    var states = [];

                    //                    this.setXMin = function(x) {
                    //                        box.xmin = x;
                    //                        _memoLevel = NO_MEMO;
                    //                        return this;
                    //                    };
                    //
                    //                    this.getXMin = function() {
                    //                        return box.xmin;
                    //                    };
                    //
                    //                    this.setYMin = function(y) {
                    //                        box.ymin = y;
                    //                        _memoLevel = NO_MEMO;
                    //                        return this;
                    //                    };
                    //
                    //                    this.getYMin = function() {
                    //                        return box.ymin;
                    //                    };
                    //
                    //                    this.setZMin = function(z) {
                    //                        box.zmin = z;
                    //                        _memoLevel = NO_MEMO;
                    //                        return this;
                    //                    };
                    //
                    //                    this.getZMin = function() {
                    //                        return box.zmin;
                    //                    };
                    //
                    //                    this.setZMax = function(x) {
                    //                        box.xmax = x;
                    //                        _memoLevel = NO_MEMO;
                    //                        return this;
                    //                    };
                    //
                    //                    this.getZMax = function() {
                    //                        return box.xmax;
                    //                    };
                    //
                    //                    this.setYMax = function(y) {
                    //                        box.ymax = y;
                    //                        _memoLevel = NO_MEMO;
                    //                        return this;
                    //                    };
                    //                    this.getYMax = function() {
                    //                        return box.ymax;
                    //                    };
                    //
                    //                    this.setZMax = function(z) {
                    //                        box.zmax = z;
                    //                        _memoLevel = NO_MEMO;
                    //                        return this;
                    //                    };
                    //
                    //                    this.getZMax = function() {
                    //                        return box.zmax;
                    //                    };

                    this._render = function(traversalContext, data) {
                        if (!cfg.fixed || !(box || objectCoords)) {
                            var params = cfg.getParams(data);

                            params.xmin = params.xmin || 0;
                            params.ymin = params.ymin || 0;
                            params.zmin = params.zmin || 0;
                            params.xmax = params.xmax || 0;
                            params.ymax = params.ymax || 0;
                            params.zmax = params.zmax || 0;

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

                        if (localityBackend.testAxisBoxIntersectOuterRadius(box)) {

                            if (localityBackend.testAxisBoxIntersectInnerRadius(box)) {

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
                                                    this._renderChild(i, traversalContext, data);
                                                    return;
                                                }
                                            }
                                        } else {
                                            this._renderChildren(traversalContext, data);
                                        }
                                        break;

                                    case SceneJS_math_OUTSIDE_FRUSTUM:
                                        break;
                                }

                            } else {

                                /* Allow content staging for subgraph
                                 */

                                // TODO:

                                this._renderChildren(traversalContext, data);
                            }
                        }
                    };
                })());
    };
})();