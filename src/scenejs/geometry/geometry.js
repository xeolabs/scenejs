/**
 * @class A scene node that defines an element of geometry.
 *
 * <p><b>Example Usage</b></p><p>Definition of a cube, with normals and UV texture coordinates, with coordinates shown here only for the first face:</b></p><pre><code>
 * var g = new SceneJS.Geometry({
 *
 *        // Optional geometry type ID. If some other Geometry node with this type has previously
 *        // been rendered in the scene graph then this Geometry will just re-use the geometry
 *        // (IE. vertex buffers etc.) that were created by it.
 *
 *        type: "cube_5_5_5",   // Optional
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
 * @param {String} cfg.type Optional geometry type - Geometry nodes with same value of this will share the same vertex buffers
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
    this._nodeType = "geometry";
    this._geo = null;    // Holds geometry when configured as arrays
    this._create = null; // Callback to create geometry
    this._handle = null; // Handle to created geometry

    this._type = params.type;       // Optional - can be null
    if (params.create instanceof Function) {
        this._create = params.create;
    } else {
        this._geo = {
            positions : params.positions || [],
            normals : params.normals || [],
            colors : params.colors || [],
            indices : params.indices || [],
            uv : params.uv || [],
            primitive : params.primitive || "triangles"
        };
    }
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
            this._handle = SceneJS._geometryModule.createGeometry(this._type, this._create());
        } else { // Or supply arrays
            this._handle = SceneJS._geometryModule.createGeometry(this._type, this._geo);
        }
    }
    SceneJS._geometryModule.drawGeometry(this._handle);
    this._renderNodes(traversalContext);
};
