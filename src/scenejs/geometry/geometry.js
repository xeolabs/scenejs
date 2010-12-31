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
 *  </pre></code>
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
    this._create = null; // Callback to create geometry
    this._handle = null; // Handle to created geometry

    this._resource = params.resource;       // Optional - can be null
    if (params.create instanceof Function) {
        this._create = params.create;
    } else {
        this._attr.positions = params.positions || [];
        this._attr.normals = params.normals || [];
        this._attr.colors = params.colors || [];
        this._attr.indices = params.indices || [];
        this._attr.uv = params.uv || [];
        this._attr.uv2 = params.uv2 || [];
        this._attr.primitive = params.primitive || "triangles";
    }
};

/** Returns this Geometry's positions array
 * @return {[Number]} Flat array of position elements
 */
SceneJS.Geometry.prototype.getPositions = function() {
    return this._attr.positions;
};


/** Returns this Geometry's normals array
 * @return {[Number]} Flat array of normal elements
 */
SceneJS.Geometry.prototype.getNormals = function() {
    return this._attr.normals;
};

/** Returns this Geometry's colors array
 * @return {[Number]} Flat array of color elements
 */
SceneJS.Geometry.prototype.getColors = function() {
    return this._attr.colors;
};

/** Returns this Geometry's indices array
 * @return {[Number]} Flat array of index elements
 */
SceneJS.Geometry.prototype.getIndices = function() {
    return this._attr.indices;
};

/** Returns this Geometry's UV coordinates array
 * @return {[Number]} Flat array of UV coordinate elements
 */
SceneJS.Geometry.prototype.getUv = function() {
    return this._attr.uv;
};

/** Returns this Geometry's UV2 coordinates array
 * @return {[Number]} Flat array of UV2 coordinate elements
 */
SceneJS.Geometry.prototype.getUv2 = function() {
    return this._attr.uv2;
};

/** Returns this Geometry's primitive type
 * @return {String} Primitive type -  "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan"
 */
SceneJS.Geometry.prototype.getPrimitive = function() {
    return this._attr.primitive;
};

/** Returns the local-space boundary of this Geometry's positions
 * @return { xmin: Number, ymin: Number, zmin: Number, xmax: Number, ymax: Number, zmax: Number} The local-space boundary
 */
SceneJS.Geometry.prototype.getBoundary = function() {
    var boundary = {
        xmin : Number.MAX_VALUE,
        ymin : Number.MAX_VALUE,
        zmin : Number.MAX_VALUE,
        xmax : Number.MIN_VALUE,
        ymax : Number.MIN_VALUE,
        zmax : Number.MIN_VALUE
    };
    var x, y, z;
    for (var i = 0, len = this._attr.positions.length - 3; i < len; i += 3) {
        x = this._attr.positions[i];
        y = this._attr.positions[i + 1];
        z = this._attr.positions[i + 2];

        if (x < boundary.xmin) {
            boundary.xmin = x;
        }
        if (y < boundary.ymin) {
            boundary.ymin = y;
        }
        if (z < boundary.zmin) {
            boundary.zmin = z;
        }

        if (x > boundary.xmax) {
            boundary.xmax = x;
        }
        if (y > boundary.ymax) {
            boundary.ymax = y;
        }
        if (z > boundary.zmax) {
            boundary.zmax = z;
        }
    }
    return boundary;
};


// @private
SceneJS.Geometry.prototype._render = function(traversalContext) {
    if (this._handle) { // Was created before - test if not evicted since
        if (!SceneJS._geometryModule.testGeometryExists(this._handle)) {
            this._handle = null;
        }
    }
    if (!this._handle) { // Either not created yet or has been evicted
        if (this._create) { // Use callback to create

            var attr = this._create();

            this._attr.positions = attr.positions;
            this._attr.normals = attr.normals;
            this._attr.colors = attr.colors;
            this._attr.indices = attr.indices;
            this._attr.uv = attr.uv;
            this._attr.uv2 = attr.uv2;
            this._attr.primitive = attr.primitive;

            this._handle = SceneJS._geometryModule.createGeometry(this._resource, this._attr);
        } else { // Or supply arrays
            this._handle = SceneJS._geometryModule.createGeometry(this._resource, this._attr);
        }
    }

    if (!SceneJS._flagsModule.flags.visible) {

        /* This subgraph flagged as invisible - it still "renders",
         * but the geometry is not actually drawn. This is useful
         * for when we want to just create textures, geometries etc.
         * on the GPU.
         */
        this._renderNodes(traversalContext);

    } else {

        SceneJS._geometryModule.pushGeometry(this._handle);
        this._renderNodes(traversalContext);
        SceneJS._geometryModule.popGeometry();
    }
};


