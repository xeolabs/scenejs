/**
 * @class SceneJS.boundingBox
 * @extends SceneJS.node
 * <p>A scene node that defines an axis-aligned box that encloses the spatial extents of its subgraph.</p> <p>You can accelerate
 * the rendering of your scenes by wrapping its most complex subgraphs with these, which causes SceneJS to only render them
 * when their boundingBoxes intersect the viewing frustum.</p><p>An example of a cube wrapped with a boundingBox:</p><pre><code>
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
 * @param {Object} config Configuration object, followed by zero or more child nodes
 */
SceneJS.boundingBox = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {
        var _xmin;
        var _ymin;
        var _zmin;
        var _xmax;
        var _ymax;
        var _zmax;
        var levels;
        var states = [];

        var objectCoords;   // Six object-space vertices for memo level 1
        var viewBox;        // Axis-aligned view-space box for memo level 2

        /**
         * Sets the minimum X extent
         *
         * @function {SceneJS.boundingBox} setXMin
         * @param {Double} xmin Minimum X extent
         * @returns {SceneJS.boundingBox} This node
         */
        $.setXMin = function(xmin) {
            _xmin = xmin;
            $._memoLevel = 0;
            return $;
        };

        /**
         * Gets the minimum X extent
         *
         * @function {Double} getXMin
         * @returns {Double} Minimum X extent
         */
        $.getXMin = function() {
            return _xmin;
        };

        /**
         * Sets the minimum Y extent
         *
         * @function {SceneJS.boundingBox} setYMin
         * @param {Double} ymin Minimum Y extent
         * @returns {SceneJS.boundingBox} This node
         */
        $.setYMin = function(ymin) {
            _ymin = ymin;
            $._memoLevel = 0;
            return $;
        };

        /**
         * Gets the minimum Y extent
         * @function {Double} getYMin
         * @returns {Double} Minimum Y extent
         */
        $.getYMin = function() {
            return _ymin;
        };

        /**
         * Sets the minimum Z extent
         *
         * @function {SceneJS.boundingBox} setZMin
         * @param {Double} zmin Minimum Z extent
         * @returns {SceneJS.boundingBox} This node
         */
        $.setZMin = function(zmin) {
            _zmin = zmin;
            $._memoLevel = 0;
            return $;
        };

        /**
         * Gets the minimum Z extent
         * @function {Double} getZMin
         * @returns {Double} Minimum Z extent
         */
        $.getZMin = function() {
            return _zmin;
        };

        /**
         * Sets the maximum X extent
         *
         * @function {SceneJS.boundingBox} setXMax
         * @param {Double} xmax Maximum X extent
         * @returns {SceneJS.boundingBox} This node
         */
        $.setXMax = function(xmax) {
            _xmax = xmax;
            $._memoLevel = 0;
            return $;
        };

        /**
         * Gets the maximum X extent
         * @function setXMax
         * @returns {Double} Maximum X extent
         */
        $.getXMax = function() {
            return _xmax;
        };

        /**
         * Sets the maximum Y extent
         *
         * @function {SceneJS.boundingBox} setYMax
         * @param {Double} ymax Maximum Y extent
         * @returns {SceneJS.boundingBox} This node
         */
        $.setYMax = function(ymax) {
            _ymax = ymax;
            $._memoLevel = 0;
            return $;
        };

        /**
         * Gets the maximum Y extent
         * @function {Double} getYMax
         * @return {Double} Maximum Y extent
         */
        $.getYMax = function() {
            return _ymax;
        };

        /**
         * Sets the maximum Z extent
         *
         * @function {SceneJS.boundingBox} setZMax
         * @param {Double} zmax Maximum Z extent
         * @returns {SceneJS.boundingBox} This node
         */
        $.setZMax = function(zmax) {
            _zmax = zmax;
            $._memoLevel = 0;
            return $;
        };

        /**
         * Gets the maximum Z extent
         * @function {Double} getZMax
         * @returns {Double} Maximum Z extent
         */
        $.getZMax = function() {
            return _zmax;
        };

        /**
         * Sets all extents
         * @function {SceneJS.boundingBox} setBoundary
         * @param {Object} boundary All extents, Eg. { xmin: -1.0, ymin: -1.0, zmin: -1.0, xmax: 1.0, ymax: 1.0, zmax: 1.0}
         */
        $._setBoundary = function(boundary) {
            _xmin = boundary.xmin || 0;
            _ymin = boundary.ymin || 0;
            _zmin = boundary.zmin || 0;
            _xmax = boundary.xmax || 0;
            _ymax = boundary.ymax || 0;
            _zmax = boundary.zmax || 0;
            $._memoLevel = 0;
            return $;
        };

        /**
         * Gets all extents
         * @function {Object} getBoundary
         * @returns {Object} All extents, Eg. { xmin: -1.0, ymin: -1.0, zmin: -1.0, xmax: 1.0, ymax: 1.0, zmax: 1.0}
         */
        $.getBoundary = function() {
            return {
                xmin: _xmin,
                ymin: _ymin,
                zmin: _zmin,
                xmax: _xmax,
                ymax: _ymax,
                zmax: _zmax
            };
        };

        var init = function(params) {
            _xmin = params.xmin || 0;
            _ymin = params.ymin || 0;
            _zmin = params.zmin || 0;
            _xmax = params.xmax || 0;
            _ymax = params.ymax || 0;
            _zmax = params.zmax || 0;

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
                }
                levels = params.levels;
            }
        };

        if (cfg.fixed) {
            init(cfg.getParams());
        }

        this._render = function(traversalContext, data) {
            if ($._memoLevel == 0) {
                if (!cfg.fixed) {
                    $._init(cfg.getParams(data));
                } else {
                    $._memoLevel = 1;
                }
                var modelTransform = SceneJS_modelTransformModule.getTransform();
                if (!modelTransform.identity) {

                    /* Model transform exists
                     */
                    objectCoords = [
                        [_xmin, _ymin, _zmin],
                        [_xmax, _ymin, _zmin],
                        [_xmax, _ymax, _zmin],
                        [_xmin, _ymax, _zmin],
                        [_xmin, _ymin, _zmax],
                        [_xmax, _ymin, _zmax],
                        [_xmax, _ymax, _zmax],
                        [_xmin, _ymax, _zmax]
                    ];
                } else {

                    /* No model transform
                     */
                    viewBox = {
                        min: [_xmin, _ymin, _zmin],
                        max: [_xmax, _ymax, _zmax]
                    };
                    $._memoLevel = 2;
                }
            }

            if ($._memoLevel < 2) {
                var modelTransform = SceneJS_modelTransformModule.getTransform();
                viewBox = new SceneJS_math_Box3().fromPoints(
                        SceneJS_math_transformPoints3(
                                modelTransform.matrix,
                                objectCoords)
                        );
                if (modelTransform.fixed && $._memoLevel == 1) {
                    objectCoords = null;
                    $._memoLevel = 2;
                }
            }
            if ($._memoLevel < 2) {
                alert("memoLevel < 2");
            }
            if (SceneJS._localityModule.testAxisBoxIntersectOuterRadius(viewBox)) {
                if (SceneJS._localityModule.testAxisBoxIntersectInnerRadius(viewBox)) {
                    var result = SceneJS_frustumModule.testAxisBoxIntersection(viewBox);
                    switch (result) {
                        case SceneJS_math_INTERSECT_FRUSTUM:  // TODO: GL clipping hints
                        case SceneJS_math_INSIDE_FRUSTUM:
                            if (levels) { // Level-of-detail mode
                                var size = SceneJS_frustumModule.getProjectedSize(viewBox);
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

        return $;
    })(SceneJS.node.apply(this, arguments));
};
                