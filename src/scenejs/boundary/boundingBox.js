/**
 * @class SceneJS.boundingBox
 * @extends SceneJS.node
 * <p>A scene node that defines an axis-aligned box that encloses the spatial extents of its subgraph.</p> <p>You can accelerate
 * the rendering of your scenes by wrapping its most complex subgraphs with these, which causes SceneJS to only render them
 * when their boundingBoxes intersect the viewing frustum.</p><p>An example of a cube wrapped with a boundingBox:</p><pre><code>
 *  //...
 *
 *  SceneJS.boundingBox({
 *        xmin: -3.0, y: -3.0, zmin: -3.0, xmax: 3.0, ymax: 3.0, zmax: 3.0
 *      },
 *
 *     SceneJS.material({
 *            ambient: { r:0.2, g:0.2, b:0.5 },
 *            diffuse: { r:0.6, g:0.6, b:0.9 }
 *         },
 *
 *        SceneJS.scale({ x: 3, y: 3, z: 3 },
 *
 *            SceneJS.objects.cube()
 *        )
 *     )
 *  )
 *</code></pre>
 * @constructor
 * Create a new SceneJS.boundingBox
 * @param {Object} The config object, followed by zero or more child nodes
 */
(function() {

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

                            var modelTransform = SceneJS_modelTransformModule.getTransform();
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
                                    SceneJS_errorModule.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                                            ("SceneJS.boundingBox levels property should have a value for each child node"));
                                }

                                for (var i = 1; i < params.levels.length; i++) {
                                    if (params.levels[i - 1] >= params.levels[i]) {
                                        SceneJS_errorModule.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                                                ("SceneJS.boundingBox levels property should be an ascending list of unique values"));
                                    }
                                    states.push(STAGE_REMOTE);
                                }
                                levels = params.levels;
                            }
                        }

                        if (objectCoords) {
                            var modelTransform = SceneJS_modelTransformModule.getTransform();
                            box = new SceneJS_math_Box3().fromPoints(
                                    SceneJS_math_transformPoints3(
                                            modelTransform.matrix,
                                            objectCoords)
                                    );

                            if (modelTransform.fixed) {
                                objectCoords = null;    // Ensures we don't recreate axis box next time
                            }
                        }

                        if (SceneJS._localityModule.testAxisBoxIntersectOuterRadius(box)) {

                            if (SceneJS._localityModule.testAxisBoxIntersectInnerRadius(box)) {

                                var result = SceneJS_frustumModule.testAxisBoxIntersection(box);
                                window.countTeapots++;
                                switch (result) {
                                    case SceneJS_math_INTERSECT_FRUSTUM:  // TODO: GL clipping hints

                                    case SceneJS_math_INSIDE_FRUSTUM:

                                        if (levels) { // Level-of-detail mode

                                            var size = SceneJS_frustumModule.getProjectedSize(box);
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