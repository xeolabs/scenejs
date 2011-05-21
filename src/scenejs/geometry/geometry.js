/**
 * @class A scene node that defines an element of geometry.
 *
 * <p><b>Example Usage</b></p><p>Definition of a cube, with normals and UV texture coordinates, with coordinates shown here only for the first face:</b></p><pre><code>
 * var g = new SceneJS.Geometry({
 *
 *        // Optional geometry resource ID. If some other Geometry node with this resource has previously
 *        // been rendered in the scene graph then this Geometry will just re-use the geometry
 *        // (IE. vertex buffers etc.) that were created by it.
 *
 *        resource: "cube_5_5_5",   // Optional
 *
 *        // Mandatory primitive type - "points", "lines", "line-loop", "line-strip", "triangles",
 *        // "triangle-strip" or "triangle-fan".
 *
 *        primitive: "triangles",
 *
 *        // Mandatory 3D positions - eight for our cube, each one spaining three array elements for X,Y and Z
 *
 *        positions : [
 *
 *            // Front cube face - vertices 0,1,2,3
 *
 *            5, 5, 5,
 *            -5, 5, 5,
 *            -5,-5, 5,
 *            5,-5, 5,
 *
 *            //...
 *        ],
 *
 *        // Optional normal vectors, one for each vertex. If you omit these, then cube will not be shaded.
 *
 *        normals : [
 *
 *            // Vertices 0,1,2,3
 *
 *            0, 0, -1,
 *            0, 0, -1,
 *            0, 0, -1,
 *            0, 0, -1,
 *
 *            //...
 *        ],
 *
 *        // Optional 2D texture coordinates corresponding to the 3D positions defined above -
 *        // eight for our cube, each one spanning two array elements for X and Y. If you omit these, then the cube
 *        // will never be textured.
 *
 *        uv : [
 *
 *            // Vertices 0,1,2,3
 *
 *            5, 5,
 *            0, 5,
 *            0, 0,
 *            5, 0,
 *
 *            // ...
 *        ],
 *
 *        // Optional coordinates for a second UV layer - just to illustrate their availability
 *
 *        uv2 : [
 *
 *        ],
 *
 *        // Optional colours for vertices
 *
 *        colors : [
 *
 *            // Vertices 0,1,2,3
 *
 *            1.0, 0.0, 0.0, 1.0,
 *            0.0, 1.0, 0.0, 1.0,
 *            0.0, 0.0, 1.0, 1.0,
 *            1.0, 1.0, 1.0  1.0,
 *
 *            // ...
 *        ],
 *
 *        // Mandatory indices - these organise the positions, normals and uv texture coordinates into geometric
 *        // primitives in accordance with the "primitive" parameter, in this case a set of three indices for each triangle.
 *        // Note that each triangle in this example is specified in counter-clockwise winding order. You can specify them in
 *        // clockwise order if you configure the SceneJS.renderer node's frontFace property as "cw", instead of the
 *        // default "ccw".
 *
 *        indices : [
 *
 *            // Vertices 0,1,2,3
 *
 *            0, 1, 2,
 *            0, 2, 3,
 *
 *            // ...
 *        ]
 * });
 <p><b>Example Usage</b></p><p>Definition of geometry that loads through a stream provided by a
 <a href="http://scenejs.wikispaces.com/GeoStreamService" target="_other">GeoStreamService</a> implementation:</b></p><pre><code>
 * var g = new SceneJS.Geometry({
 *     stream: "my-stream"
 * });
 * <pre><code>
 * </pre></code>
 * @extends SceneJS.Node
 * @since Version 0.7.4
 * @constructor
 * Create a new SceneJS.Geometry
 * @param {Object} [cfg] Static configuration object
 * @param {String} cfg.resource Optional geometry resource - Geometry nodes with same value of this will share the same vertex buffers
 * @param {String} cfg.primitive The primitive type - "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan"
 * @param {double[]} cfg.positions Flattened array of 3D coordinates, three elements each
 * @param {double[]} [cfg.normals = []] Flattened array of 3D vertex normal vectors, three elements each
 * @param {double[]} [cfg.uv = []] Flattened array of 2D UV-space coordinates for the first texture layer, two elements each
 * @param {double[]} [cfg.uv2 = []] Flattened array of 2D UV-space coordinates for the second texture layer, two elements each
 * @param {int[]} cfg.indices Flattened array of indices to index the other arrays per the specified primitive type
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @since Version 0.7.3
 */
SceneJS.Geometry = SceneJS.createNodeType("geometry");

SceneJS.Geometry.prototype._init = function(params) {

    this._state = SceneJS.Geometry.STATE_INITIAL;
    this._create = null; // Callback to create geometry
    this._handle = null; // Handle to created geometry
    this._resource = params.resource;       // Optional - can be null

    if (params.create instanceof Function) {

        /* Factory function
         */
        this._create = params.create;
    } else if (params.stream) {

        /* Binary Stream
         */
        this._stream = params.stream;
    } else {

        /* Explicit arrays
         */
        this._attr.positions = params.positions || [];
        this._attr.normals = params.normals || [];
        this._attr.colors = params.colors || [];
        this._attr.indices = params.indices || [];
        this._attr.uv = params.uv || [];
        this._attr.uv2 = params.uv2 || [];
        this._attr.primitive = params.primitive || "triangles";
    }
};

/** Ready to create geometry
 */
SceneJS.Geometry.STATE_INITIAL = "init";

/** Geometry in the process of loading
 */
SceneJS.Geometry.STATE_LOADING = "loading";

/** Geometry loaded - geometry initailised from JSON arrays is immediately in this state and stays here
 */
SceneJS.Geometry.STATE_LOADED = "loaded";

/**
 * Returns the node's current state. Possible states are {@link #STATE_INITIAL},
 * {@link #STATE_LOADING}, {@link #STATE_LOADED}.
 * @returns {int} The state
 */
SceneJS.Geometry.prototype.getState = function() {
    return this._state;
};

// @private
SceneJS.Geometry.prototype._changeState = function(newState, params) {
    params = params || {};
    params.oldState = this._state;
    params.newState = newState;
    this._state = newState;
    if (this._listeners["state-changed"]) {
        this._fireEvent("state-changed", params);
    }
};

/** Returns this Geometry's stream ID, if any
 * @return {String} ID of stream
 */
SceneJS.Geometry.prototype.getStream = function() {
    return this._stream;
};

/** Returns this Geometry's positions array
 * @return {[Number]} Flat array of position elements
 */
SceneJS.Geometry.prototype.getPositions = function() {
    return this._getArrays().positions;
};


/** Returns this Geometry's normals array
 * @return {[Number]} Flat array of normal elements
 */
SceneJS.Geometry.prototype.getNormals = function() {
    return this._getArrays().normals;
};

/** Returns this Geometry's colors array
 * @return {[Number]} Flat array of color elements
 */
SceneJS.Geometry.prototype.getColors = function() {
    return this._getArrays().colors;
};

/** Returns this Geometry's indices array
 * @return {[Number]} Flat array of index elements
 */
SceneJS.Geometry.prototype.getIndices = function() {
    return this._getArrays().indices;
};

/** Returns this Geometry's UV coordinates array
 * @return {[Number]} Flat array of UV coordinate elements
 */
SceneJS.Geometry.prototype.getUv = function() {
    return this._getArrays().uv;
};

/** Returns this Geometry's UV2 coordinates array
 * @return {[Number]} Flat array of UV2 coordinate elements
 */
SceneJS.Geometry.prototype.getUv2 = function() {
    return this._getArrays().uv2;
};

/** Returns this Geometry's primitive type
 * @return {String} Primitive type -  "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan"
 */
SceneJS.Geometry.prototype.getPrimitive = function() {
    return this._attr.primitive;
};

SceneJS.Geometry.prototype._getArrays = function() {
    if (this._attr.positions) {
        return this._attr;
    } else {
        if (!this._handle) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.NODE_ILLEGAL_STATE,
                    "Invalid node state exception: geometry stream not loaded yet - can't query geometry data yet");
        }
        return this._handle.arrays;
    }
};

/** Returns the local-space boundary of this Geometry's positions. When the geometry is loaded from a stream,
 * you can only do this once it has been in {@link #STATE_LOADED} at least once.
 * @return { xmin: Number, ymin: Number, zmin: Number, xmax: Number, ymax: Number, zmax: Number} The local-space boundary
 */
SceneJS.Geometry.prototype.getBoundary = function() {

    if (this._boundary) {
        return this._boundary;
    }

    var positions = this._getArrays().positions;

    this._boundary = {
        xmin : SceneJS_math_MAX_DOUBLE,
        ymin : SceneJS_math_MAX_DOUBLE,
        zmin : SceneJS_math_MAX_DOUBLE,
        xmax : SceneJS_math_MIN_DOUBLE,
        ymax : SceneJS_math_MIN_DOUBLE,
        zmax : SceneJS_math_MIN_DOUBLE
    };

    var x, y, z;
    for (var i = 0, len = positions.length - 2; i < len; i += 3) {
        x = positions[i];
        y = positions[i + 1];
        z = positions[i + 2];

        if (x < this._boundary.xmin) {
            this._boundary.xmin = x;
        }
        if (y < this._boundary.ymin) {
            this._boundary.ymin = y;
        }
        if (z < this._boundary.zmin) {
            this._boundary.zmin = z;
        }

        if (x > this._boundary.xmax) {
            this._boundary.xmax = x;
        }
        if (y > this._boundary.ymax) {
            this._boundary.ymax = y;
        }
        if (z > this._boundary.zmax) {
            this._boundary.zmax = z;
        }
    }

    return this._boundary;
};


// @private
SceneJS.Geometry.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.Geometry.prototype._preCompile = function(traversalContext) {
    if (!this._handle) { // Geometry VBOs not created yet

        if (this._create) { // Factory function

            var attr = this._create();

            this._attr.positions = attr.positions;
            this._attr.normals = attr.normals;
            this._attr.colors = attr.colors;
            this._attr.indices = attr.indices;
            this._attr.uv = attr.uv;
            this._attr.uv2 = attr.uv2;
            this._attr.primitive = attr.primitive;

            this._handle = SceneJS_geometryModule.createGeometry(this._resource, this._attr);

            this._changeState(SceneJS.Geometry.STATE_LOADED);

        } else if (this._stream) { // Stream

            this._changeState(SceneJS.Geometry.STATE_LOADING);

            var self = this;

            SceneJS_geometryModule.createGeometry(
                    this._resource,
                    this._stream,
                    function(handle) {

                        self._handle = handle;

                        self._changeState(SceneJS.Geometry.STATE_LOADED);

                        /**
                         * Need another compilation to apply freshly-loaded geometry
                         */
                        SceneJS_compileModule.nodeUpdated(self, "loaded");
                    });

        } else { // Arrays

            this._handle = SceneJS_geometryModule.createGeometry(this._resource, this._attr);

            this._changeState(SceneJS.Geometry.STATE_LOADED);
        }
    }
    if (this._handle) {

        /* Apply geometry
         */
        SceneJS_geometryModule.pushGeometry(this._attr.id, this._handle);
    }
};

// @private
SceneJS.Geometry.prototype._postCompile = function(traversalContext) {
    if (this._handle) {
        SceneJS_geometryModule.popGeometry();
    }
};

// @private
SceneJS.Geometry.prototype._destroy = function() {
    if (this._handle) { // Not created yet
        SceneJS_geometryModule.destroyGeometry(this._handle);
    }
    this._handle= null;
};

