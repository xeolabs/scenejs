/**
 * @class A scene node that specifies the spatial boundaries of scene graph subtrees to support visibility and
 * level-of-detail culling.
 *
 * <p>The subgraphs of these are only traversed when the boundary intersects the current view frustum. When this node
 * is defined within the subgraph of a {@link SceneJS.Locality} node, then the boundary must also intersect the inner
 * and outer radii of the Locality in order for its sub-nodes to be rendered.</p>
 *
 * <p>When configured with a projected size threshold for each child, a {@link SceneJS.BoundingBox} can also function
 * as level-of-detail (LOD) selectors.</p>
 *
 *  <p><b>Example 1.</b></p><p>This BoundingBox is configured to work as a level-of-detail selector. The 'levels'
 * property specifies thresholds for the boundary's projected size, each corresponding to one of the node's children,
 * such that the child corresponding to the threshold imediately below the boundary's current projected size is the only
 * one that is currently rendered.</p><p>This boundingBox will select exactly one of its child nodes to render for its
 * current projected size, where the levels parameter specifies for each child the size threshold above which the child
 * becomes selected. No child is selected (ie. nothing is rendered) when the projected size is below the lowest level.</p>
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
 *     new SceneJS.Cube(),
 *
 *     // When size > 200px,  draw a low-detail sphere
 *
 *     new SceneJS.Sphere({
 *         radius: 1,
 *         slices:10,
 *         rings:10
 *     }),
 *
 *     // When size > 400px, draw a medium-detail sphere
 *
 *     new SceneJS.Sphere({
 *         radius: 1,
 *         slices:20,
 *         rings:20
 *     }),
 *
 *     // When size > 600px, draw a high-detail sphere
 *
 *     new SceneJS.Sphere({
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
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.BoundingBox = SceneJS.createNodeType("boundingBox");

// @private
SceneJS.BoundingBox.prototype._init = function(params) {

    /* Local extents
     */
    this._xmin = params.xmin || 0;
    this._ymin = params.ymin || 0;
    this._zmin = params.zmin || 0;
    this._xmax = params.xmax || 0;
    this._ymax = params.ymax || 0;
    this._zmax = params.zmax || 0;

    this._levels = null; // LOD levels
    this._level = -1; // Current LOD level
    this._states = [];
    this._state = SceneJS.BoundingBox.STATE_INITIAL;

    this._localCoords = null;       // Six local-space vertices for memo level 1
    this._modelBox = null;          // Axis-aligned model-space box for memo level 2
    this._viewBox = null;           // Axis-aligned view-space box for memo level 2
    this._canvasBox = null;         // Axis-aligned canvas-space box for memo level 2

    if (params.levels) {
        this._levels = params.levels;
    }

    this._validated = false;        // true when params validated
};

/**
 * State of the BoundingBox when not rendered yet
 */
SceneJS.BoundingBox.STATE_INITIAL = "init";

/**
 * State of the BoundingBox when it is completely outside the outer locality radius,
 * which which may be either that defined explicitly by a higher {@link SceneJS.Locality} node, or the
 * default value (see {@link SceneJS.Locality}). In this state it is therefore also completely
 * outside the inner radius and the view frustum.
 */
SceneJS.BoundingBox.STATE_OUTSIDE_OUTER_LOCALITY = "outside";

/**
 * State of the BoundingBox when it intersects the outer locality radius, but does not
 * intersect the inner radius
 */
SceneJS.BoundingBox.STATE_INTERSECTING_OUTER_LOCALITY = "far";

/**
 * State of the BoundingBox when it intersects the inner locality radius, while therefore also intersecting
 * the outer locality radius
 */
SceneJS.BoundingBox.STATE_INTERSECTING_INNER_LOCALITY = "near";

/**
 * State of the BoundingBox when it is intersecting the view frustum, while therefore also intersecting
 * the inner and outer locality radius
 */
SceneJS.BoundingBox.STATE_INTERSECTING_FRUSTUM = "visible";

// @private
SceneJS.BoundingBox.prototype._changeState = function(newState, params) {
    var oldState = this._state;
    this._state = newState;
    if (this._listeners["state-changed"]) {
        params = params || {};
        params.oldState = oldState;
        params.newState = newState;
        this._fireEvent("state-changed", params);
    }
};

/**
 * Sets the minimum X extent
 * @function {SceneJS.BoundingBox} setXMin
 * @param {double} xmin Minimum X extent
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setXMin = function(xmin) {
    this._xmin = xmin;
    this._memoLevel = 0;
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
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setYMin = function(ymin) {
    this._ymin = ymin;
    this._memoLevel = 0;
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
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setZMin = function(zmin) {
    this._zmin = zmin;
    this._memoLevel = 0;
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
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setXMax = function(xmax) {
    this._xmax = xmax;
    this._memoLevel = 0;
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
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setYMax = function(ymax) {
    this._ymax = ymax;
    this._memoLevel = 0;
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
 * @since Version 0.7.4
 */
SceneJS.BoundingBox.prototype.setZMax = function(zmax) {
    this._zmax = zmax;
    this._memoLevel = 0;
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
SceneJS.BoundingBox.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.BoundingBox.prototype._preCompile = function(traversalContext) {

    this._compileNodeAtIndex = undefined;
    this._nodesToCompile = undefined;

    if (!this._validated) {
        if (this._levels) {
            if (this._levels.length != this._children.length) {
                throw SceneJS._errorModule.fatalError(new SceneJS.errors.NodeConfigExpectedException
                        ("boundingBox levels property should have a value for each child node"));
            }
            for (var i = 1; i < this._levels.length; i++) {
                if (this._levels[i - 1] >= this._levels[i]) {
                    throw SceneJS._errorModule.fatalError(new SceneJS.errors.NodeConfigExpectedException
                            ("boundingBox levels property should be an ascending list of unique values"));
                }
            }
        }
        this._validated = true;
    }

    var origLevel = this._level; // We'll fire a "lod-changed" if LOD level changes
    var origState = this._state; // We'll fire "state-changed" if state changes from this during render
    var newState;
    var modelTransform = SceneJS._modelTransformModule.getTransform();

    if (this._memoLevel == 0) {
        this._state = SceneJS.BoundingBox.STATE_INITIAL;
        this._memoLevel = 1;
        if (!modelTransform.identity) {

            /* Model transform exists - prepare model coords from AABB
             */
            this._localCoords = [
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

            /* Create model boundary directly from local boundary - no model transform
             */
            this._modelBox = {
                min: [this._xmin, this._ymin, this._zmin],
                max: [this._xmax, this._ymax, this._zmax]
            };
            this._modelCoords = null;
            this._memoLevel = 2;
        }
    }

    if (this._memoLevel < 2) {

        /* Create model boundary by transforming local boundary by model transform
         */
        modelTransform = SceneJS._modelTransformModule.getTransform();
        this._modelBox = new SceneJS._math_Box3().fromPoints(
                SceneJS._math_transformPoints3(
                        modelTransform.matrix,
                        this._localCoords)
                );
        this._modelCoords = null;
        if (modelTransform.fixed && this._memoLevel == 1 && (!SceneJS._instancingModule.instancing())) {
            this._localCoords = null;
            this._memoLevel = 2;
        }
    }

    newState = SceneJS.BoundingBox.STATE_OUTSIDE_OUTER_LOCALITY;

    if (SceneJS._localityModule.testAxisBoxIntersectOuterRadius(this._modelBox)) {
        newState = SceneJS.BoundingBox.STATE_INTERSECTING_OUTER_LOCALITY;

        if (SceneJS._localityModule.testAxisBoxIntersectInnerRadius(this._modelBox)) {
            newState = SceneJS.BoundingBox.STATE_INTERSECTING_INNER_LOCALITY;

            /* Fast model-space boundary test
             */
            var result = SceneJS._frustumModule.testAxisBoxIntersection(this._modelBox);
            switch (result) {
                case SceneJS._math_INTERSECT_FRUSTUM:
                case SceneJS._math_INSIDE_FRUSTUM:

                    newState = SceneJS.BoundingBox.STATE_INTERSECTING_FRUSTUM;

                    /* Intersects view - now create view and canvas boundaries
                     */
                    if (!this._modelCoords) {
                        this._modelCoords = [
                            [this._modelBox.min[0], this._modelBox.min[1], this._modelBox.min[2]],
                            [this._modelBox.max[0], this._modelBox.min[1], this._modelBox.min[2]],
                            [this._modelBox.max[0], this._modelBox.max[1], this._modelBox.min[2]],
                            [this._modelBox.min[0], this._modelBox.max[1], this._modelBox.min[2]],
                            [this._modelBox.min[0], this._modelBox.min[1], this._modelBox.max[2]],
                            [this._modelBox.max[0], this._modelBox.min[1], this._modelBox.max[2]],
                            [this._modelBox.max[0], this._modelBox.max[1], this._modelBox.max[2]],
                            [this._modelBox.min[0], this._modelBox.max[1], this._modelBox.max[2]]
                        ];
                    }

                    /* Create view boundary
                     */
                    this._viewBox = new SceneJS._math_Box3()
                            .fromPoints(SceneJS._math_transformPoints3(
                            SceneJS._viewTransformModule.getTransform().matrix, this._modelCoords));
                    //

                    //                    var pState = SceneJS._frustumModule.getProjectedState(this._modelCoords);
                    //                    this._canvasBox = pState.canvasBox;

                    this._canvasSize = SceneJS._frustumModule.getProjectedSize(this._modelBox);

                    if (newState != origState) {
                        this._changeState(newState);
                    }

                    /* Export model-space boundary
                     */
                    var isectListeners = this._listeners["intersect"];

                    SceneJS._boundaryModule.pushBoundary(
                            this._modelBox,
                            this._viewBox,
                            this._attr.id,
                            this._state = newState,
                            (isectListeners != undefined && isectListeners != null)); // Observed

                    if (this._levels) { // Level-of-detail mode
                        //var size = SceneJS._frustumModule.getProjectedSize(this._modelBox);

                        for (var i = this._levels.length - 1; i >= 0; i--) {
                            if (this._levels[i] <= this._canvasSize) {
                                this._level = i;

                                if (origLevel != this._level) {
                                    if (this._listeners["lod-selected"]) {
                                        this._fireEvent("lod-selected", { oldLevel : origLevel, newLevel : this._level });
                                    }
                                }

                                var state = this._states[i];
                                if (this._children.length > 0) {

                                    /* Child provided for each LOD - select one
                                     * for the projected boundary canvas size
                                     */
                                    this._compileNodeAtIndex = i;
                                    //this._compileNodeAtIndex(i, traversalContext);
                                } else {

                                    /* Zero or one child provided for all LOD -
                                     * just render it if there is one
                                     */
                                    this._nodesToCompile = true;
                                    //this._compileNodes(traversalContext);
                                }
                                return;
                            }
                        }
                    } else {

                        this._nodesToCompile = true;
                        //this._compileNodes(traversalContext);
                    }

                    //      SceneJS._boundaryModule.popBoundary();

                    break;

                case SceneJS._math_OUTSIDE_FRUSTUM:

                    if (newState != origState) {
                        this._changeState(newState);
                    }
                    break;
            }
        } else {

            if (newState != origState) {
                this._changeState(newState);
            }

            /* Allow content staging for subgraph
             */

            // TODO:

            this._nodesToCompile = true;
            //this._compileNodes(traversalContext);
        }
    } else {
        if (newState != origState) {
            this._changeState(newState);
        }
    }
};

SceneJS.BoundingBox.prototype._compileNodes = function(traversalContext) {

    if (this._compileNodeAtIndex && this._compileNodeAtIndex >= 0) { // LOD selection

        SceneJS.Node.prototype._compileNodeAtIndex.call(this, this._compileNodeAtIndex, traversalContext);
        SceneJS._boundaryModule.popBoundary();

    } else if (this._nodesToCompile) { // Visibility cull

        SceneJS.Node.prototype._compileNodes.call(this, traversalContext);
        SceneJS._boundaryModule.popBoundary();
    }
};

SceneJS.BoundingBox.prototype._postCompile = function(traversalContext) {
};


/* Returns a JSon representation of this node
 */
SceneJS.BoundingBox.prototype.getJSON = function() {
    return {
        xmin: this._xmin,
        ymin: this._ymin,
        zmin: this._zmin,
        xmax: this._xmax,
        ymax: this._ymax,
        zmax: this._zmax
    };
};

/*---------------------------------------------------------------------
 * Query methods - calls to these only legal while node is rendering
 *-------------------------------------------------------------------*/

/**
 * Queries the BoundingBox's current render-time state.
 * This will update after each "state-changed" event.
 * @returns {String} The state
 */
SceneJS.BoundingBox.prototype.queryState = function() {
    return this._state;
};

/**
 * Queries the BoundingBox's current canvas-space diagonal size.
 * This will update after each "state-changed" event.
 * @returns {Number}  The canvas boundary diagonal size
 */
SceneJS.BoundingBox.prototype.queryCanvasSize = function() {
    return this._canvasSize;
};

/**
 * Queries the BoundingBox's current selected level of detail.
 * This will update after each "lod-selected" event.
 * @returns {Number}  Index of the current level of detail
 */
SceneJS.BoundingBox.prototype.queryLevel = function() {
    return this._level;
};

///**
// * Gets current model-space extents
// * @function {Object} getModelBoundary
// * @returns {Object}  The model boundary extents - {xmin: float, ymin: float, zmin: float, xmax: float, ymax: float, zmax: float}
// * @since Version 0.7.8
// */
//SceneJS.BoundingBox.prototype.getModelBoundary = function() {
//    return {
//        xmin: this._modelBox.min[0],
//        ymin: this._modelBox.min[1],
//        zmin: this._modelBox.min[2],
//        xmax: this._modelBox.max[0],
//        ymax: this._modelBox.max[1],
//        zmax: this._modelBox.max[2]
//    };
//};
//
///**
// * Gets current view-space extents
// * @function {Object} getViewBoundary
// * @returns {Object}  The view boundary extents - {xmin: float, ymin: float, zmin: float, xmax: float, ymax: float, zmax: float}
// * @since Version 0.7.8
// */
//SceneJS.BoundingBox.prototype.getViewBoundary = function() {
//    return {
//        xmin: this._viewBox.min[0],
//        ymin: this._viewBox.min[1],
//        zmin: this._viewBox.min[2],
//        xmax: this._viewBox.max[0],
//        ymax: this._viewBox.max[1],
//        zmax: this._viewBox.max[2]
//    };
//};
//
///**
// * Gets current canvas-space extents
// * @function {Object} getCanvasBoundary
// * @returns {Object}  The canvas boundary extents - {xmin: float, ymin: float, xmax: float, ymax: float }
// * @since Version 0.7.8
// */
//SceneJS.BoundingBox.prototype.getCanvasBoundary = function() {
//    return {
//        xmin: this._canvasBox.min[0],
//        ymin: this._canvasBox.min[1],
//        xmax: this._canvasBox.max[0],
//        ymax: this._canvasBox.max[1]
//    };
//};

