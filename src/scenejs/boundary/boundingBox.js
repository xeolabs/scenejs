/**
 * @class A scene node that specifies the spatial boundaries of scene graph subtrees to support visibility and
 * level-of-detail culling.
 *
 * <p>The subgraphs of these are only traversed when the boundary intersect the current view frustum. When this node
 * is within the subgraph of a {@link SceneJS.Locality} node, it the boundary must also intersect the inner radius of the Locality.
 * the outer radius of the Locality is used internally by SceneJS to support content staging strategies.</p>
 *
 * <p>When configured with a projected size threshold for each child, they can also function as level-of-detail (LOD) selectors.</p>
 * <p><b>Live Demo</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-lod-boundingbox-example">Level of Detail Example</a></li></ul>
 *  <p><b>Example 1.</b></p><p>This BoundingBox is configured to work as a level-of-detail selector. The 'levels'
 * property specifies thresholds for the boundary's projected size, each corresponding to one of the node's children,
 * such that the child corresponding to the threshold imediately below the boundary's current projected size is only one
 * currently traversable.</p><p>This boundingBox will select exactly one of its child nodes to render for its current projected size, where the
 * levels parameter specifies for each child the size threshold above which the child becomes selected. No child is
 * selected (nothing is drawn) when the projected size is below the lowest level.</p>
 * <pre><code>
 * var bb = new SceneJS.BoundingBox({
 *          xmin: -2,
 *          ymin: -2,
 *          zmin: -2,
 *          xmax:  2,
 *          ymax:  2,
 *          zmax:  2,
 *
 *           // Levels are optional - acts as regular
 *          // frustum-culling bounding box when not specified
 *
 *          levels: [
 *             10,
 *             200,
 *             400,
 *             600
 *         ]
 *     },
 *
 *     // When size > 10px, draw a cube
 *
 *     new SceneJS.objects.Cube(),
 *
 *     // When size > 200px,  draw a low-detail sphere
 *
 *     new SceneJS.objects.Sphere({
 *         radius: 1,
 *         slices:10,
 *         rings:10
 *     }),
 *
 *     // When size > 400px, draw a medium-detail sphere
 *
 *     new SceneJS.objects.Sphere({
 *         radius: 1,
 *         slices:20,
 *         rings:20
 *     }),
 *
 *     // When size > 600px, draw a high-detail sphere
 *
 *     new SceneJS.objects.Sphere({
 *         radius: 1,
 *         slices:120,
 *         rings:120
 *     })
 * )
 * </code></pre>
 * @extends SceneJS.Node
 * @since Version 0.7.4
 * @constructor
 * Creates a new SceneJS.BoundingBox
 * @param {Object} [cfg] Static configuration object
 * @param {double} [cfg.xmin = -1.0] Minimum X-axis extent
 * @param {double} [cfg.ymin = -1.0] Minimum Y-axis extent
 * @param {double} [cfg.zmin = -1.0] Minimum Z-axis extent
 * @param {double} [cfg.xmax = 1.0] Maximum X-axis extent
 * @param {double} [cfg.ymax = 1.0] Maximum Y-axis extent
 * @param {double} [cfg.zmax = 1.0] Maximum Z-axis extent
 * @param {double[]} [cfg.levels] Projected size thresholds for level-of-detail culling
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.BoundingBox = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "bounding-box";
    this._xmin = 0;
    this._ymin = 0;
    this._zmin = 0;
    this._xmax = 0;
    this._ymax = 0;
    this._zmax = 0;
    this._levels = null;
    this._states = [];
    this._objectsCoords = null;  // Six object-space vertices for memo level 1
    this._viewBox = null;         // Axis-aligned view-space box for memo level 2
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.BoundingBox, SceneJS.Node);

/**
 * Sets the minimum X extent
 * @function {SceneJS.BoundingBox} setXMin
 * @param {double} xmin Minimum X extent
 * @returns {SceneJS.BoundingBox} this
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setXMin = function(xmin) {
    this._xmin = xmin;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum X extent
 * @function {double} getXMin
 * @returns {double} Minimum X extent
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.getXMin = function() {
    return this._xmin;
};

/**
 * Sets the minimum Y extent
 *
 * @function  {SceneJS.BoundingBox} setYMin
 * @param {double} ymin Minimum Y extent
 * @returns {SceneJS.BoundingBox} this
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setYMin = function(ymin) {
    this._ymin = ymin;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum Y extent
 * @function {double} getYMin
 * @returns {double} Minimum Y extent
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.getYMin = function() {
    return this._ymin;
};

/**
 * Sets the minimum Z extent
 *
 * @function {SceneJS.BoundingBox} setZMin
 * @param {double} zmin Minimum Z extent
 * @returns {SceneJS.BoundingBox} this
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setZMin = function(zmin) {
    this._zmin = zmin;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum Z extent
 * @function {double} getZMin
 * @returns {double} Minimum Z extent
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.getZMin = function() {
    return this._zmin;
};

/**
 * Sets the maximum X extent
 *
 * @function  {SceneJS.BoundingBox} setXMax
 * @param {double} xmax Maximum X extent
 * @returns {SceneJS.BoundingBox} this
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setXMax = function(xmax) {
    this._xmax = xmax;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum X extent
 * @function  {SceneJS.BoundingBox} setXMax
 * @returns {double} Maximum X extent
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.getXMax = function() {
    return this._xmax;
};

/**
 * Sets the maximum Y extent
 *
 * @function {SceneJS.BoundingBox} setYMax
 * @param {double} ymax Maximum Y extent
 * @returns {SceneJS.BoundingBox} this
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setYMax = function(ymax) {
    this._ymax = ymax;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum Y extent
 * @function {double} getYMax
 * @return {double} Maximum Y extent
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.getYMax = function() {
    return this._ymax;
};

/**
 * Sets the maximum Z extent
 *
 * @function {SceneJS.BoundingBox} setZMax
 * @param {double} zmax Maximum Z extent
 * @returns {SceneJS.BoundingBox} this
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setZMax = function(zmax) {
    this._zmax = zmax;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum Z extent
 * @function {double} getZMax
 * @returns {double} Maximum Z extent
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.getZMax = function() {
    return this._zmax;
};

/**
 * Sets all extents
 * @function {SceneJS.BoundingBox} setBoundary
 * @param {Object} [boundary] Boundary extents
 * @param {double} [boundary.xmin = -1.0] Minimum X-axis extent
 * @param {double} [boundary.ymin = -1.0] Minimum Y-axis extent
 * @param {double} [boundary.zmin = -1.0] Minimum Z-axis extent
 * @param {double} [boundary.xmax = 1.0] Maximum X-axis extent
 * @param {double} [boundary.ymax = 1.0] Maximum Y-axis extent
 * @param {double} [boundary.zmax = 1.0] Maximum Z-axis extent
 * @returns {SceneJS.BoundingBox} this
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setBoundary = function(boundary) {
    this._xmin = boundary.xmin || 0;
    this._ymin = boundary.ymin || 0;
    this._zmin = boundary.zmin || 0;
    this._xmax = boundary.xmax || 0;
    this._ymax = boundary.ymax || 0;
    this._zmax = boundary.zmax || 0;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets all extents
 * @function {Object} getBoundary
 * @returns {Object}  The boundary extents - {xmin: float, ymin: float, zmin: float, xmax: float, ymax: float, zmax: float}
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.getBoundary = function() {
    return {
        xmin: this._xmin,
        ymin: this._ymin,
        zmin: this._zmin,
        xmax: this._xmax,
        ymax: this._ymax,
        zmax: this._zmax
    };
};

// @private
SceneJS.BoundingBox.prototype._init = function(params) {
    this._xmin = params.xmin || 0;
    this._ymin = params.ymin || 0;
    this._zmin = params.zmin || 0;
    this._xmax = params.xmax || 0;
    this._ymax = params.ymax || 0;
    this._zmax = params.zmax || 0;
    if (params.levels) {
        if (params.levels.length != this._children.length) {
          throw SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                    ("SceneJS.boundingBox levels property should have a value for each child node"));
        }

        for (var i = 1; i < params.levels.length; i++) {
            if (params.levels[i - 1] >= params.levels[i]) {
                throw SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                        ("SceneJS.boundingBox levels property should be an ascending list of unique values"));
            }
        }
        this._levels = params.levels;
    }
};

// @private
SceneJS.BoundingBox.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        var modelTransform = SceneJS_modelTransformModule.getTransform();
        if (!modelTransform.identity) {

            /* Model transform exists
             */
            this._objectCoords = [
                [this._xmin, this._ymin, this._zmin],
                [this._xmax, this._ymin, this._zmin],
                [this._xmax, this._ymax, this._zmin],
                [this._xmin, this._ymax, this._zmin],
                [this._xmin, this._ymin, this._zmax],
                [this._xmax, this._ymin, this._zmax],
                [this._xmax, this._ymax, this._zmax],
                [this._xmin, this._ymax, this._zmax]
            ];
        } else {

            /* No model transform
             */
            this._viewBox = {
                min: [this._xmin, this._ymin, this._zmin],
                max: [this._xmax, this._ymax, this._zmax]
            };
            this._memoLevel = 2;
        }
    }

    if (this._memoLevel < 2) {
        var modelTransform = SceneJS_modelTransformModule.getTransform();
        this._viewBox = new SceneJS_math_Box3().fromPoints(
                SceneJS_math_transformPoints3(
                        modelTransform.matrix,
                        this._objectCoords)
                );
        if (modelTransform.fixed && this._memoLevel == 1 && (!SceneJS_instancingModule.instancing())) {
            this._objectCoords = null;
            this._memoLevel = 2;
        }
    }
    if (SceneJS_localityModule.testAxisBoxIntersectOuterRadius(this._viewBox)) {
        if (SceneJS_localityModule.testAxisBoxIntersectInnerRadius(this._viewBox)) {
            var result = SceneJS_frustumModule.testAxisBoxIntersection(this._viewBox);
            switch (result) {
                case SceneJS_math_INTERSECT_FRUSTUM:  // TODO: GL clipping hints
                case SceneJS_math_INSIDE_FRUSTUM:
                    if (this._levels) { // Level-of-detail mode
                        var size = SceneJS_frustumModule.getProjectedSize(this._viewBox);
                        for (var i = this._levels.length - 1; i >= 0; i--) {
                            if (this._levels[i] <= size) {
                                var state = this._states[i];
                                this._renderNode(i, traversalContext, data);
                                return;
                            }
                        }
                    } else {
                        this._renderNodes(traversalContext, data);
                    }
                    break;

                case SceneJS_math_OUTSIDE_FRUSTUM:
                    break;
            }
        } else {

            /* Allow content staging for subgraph
             */

            // TODO:

            this._renderNodes(traversalContext, data);
        }
    }
};

/** Returns a new SceneJS.BoundingBox instance
 * @param {Object} [cfg] Static configuration object
 * @param {double} [cfg.xmin = -1.0] Minimum X-axis extent
 * @param {double} [cfg.ymin = -1.0] Minimum Y-axis extent
 * @param {double} [cfg.zmin = -1.0] Minimum Z-axis extent
 * @param {double} [cfg.xmax = 1.0] Maximum X-axis extent
 * @param {double} [cfg.ymax = 1.0] Maximum Y-axis extent
 * @param {double} [cfg.zmax = 1.0] Maximum Z-axis extent
 * @param {float[]} [cfg.levels] Projected size thresholds for level-of-detail culling
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.BoundingBox}
 * @since Version 0.7.3
 */
SceneJS.boundingBox = function() {
    var n = new SceneJS.BoundingBox();
    SceneJS.BoundingBox.prototype.constructor.apply(n, arguments);
    return n;
};
