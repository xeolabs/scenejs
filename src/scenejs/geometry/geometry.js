/**
 @class SceneJS.geometry
 @extends SceneJS.node
 <p>A scene node that defines an element of geometry. These can </p>
 <p><b>Example 1:</b></p><p>Definition of a cube, with normals and UV texture coordinates, with coordinates shown here only for the first face:</b></p><pre><code>
 SceneJS.geometry({

    // Mandatory primitive type - "points", "lines", "line-loop", "line-strip", "triangles",
    // "triangle-strip" or "triangle-fan".

    primitive: "triangles",

    // Mandatory vertices - eight for our cube, each one spaining three array elements for X,Y and Z

    positions : [

        // Front cube face - vertices 0,1,2,3

         5, 5, 5,
        -5, 5, 5,
        -5,-5, 5,
        5,-5, 5,

        //...
    ],

    // Optional normal vectors, one for each vertex. If you omit these, then cube will not be shaded.

    normals : [

        // Vertices 0,1,2,3

        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        //...
    ],

    // Optional 2D texture coordinates corresponding to the 3D positions defined above -
    // eight for our cube, each one spanning two array elements for X and Y. If you omit these, then the cube
    // will never be textured.

    uv : [

        // Vertices 0,1,2,3

        5, 5,
        0, 5,
        0, 0,
        5, 0,

        // ...
    ],

    // Optional coordinates for a second UV layer - just to illustrate their availability

    uv2 : [

    ],

    // Mandatory indices - these organise the positions, normals and uv texture coordinates into geometric
    // primitives in accordance with the "primitive" parameter, in this case a set of three indices for each triangle.
    // Note that each triangle in this example is specified in counter-clockwise winding order. You can specify them in
    // clockwise order if you configure the SceneJS.renderer node's frontFace property as "cw", instead of the
    // default "ccw".

    indices : [

        // Vertices 0,1,2,3

        0, 1, 2,
        0, 2, 3,

        // ...
    ]
 })
 </pre></code>
 @constructor
 Create a new SceneJS.geometry
 @param {Object} config The config object, followed by zero or more child nodes
 */
SceneJS.geometry = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments);

    return SceneJS._utils.createNode(
            "geometry",
            cfg.children,

            new (function() {

                var params;
                var type;
                var create;
                var geo = {};

                this._render = function(traversalContext, data) {

                    /* Dynamic config only happens first time
                     */
                    if (!params) {
                        params = cfg.getParams(data);
                        if (params.create instanceof Function) {

                            /* Create must not be a dynamic config function!
                             */
                            create = params.create;
                        } else {
                            geo = {
                                positions : SceneJS._utils.getParam(params.positions, data) || [],
                                normals : SceneJS._utils.getParam(params.normals, data) || [],
                                colors : SceneJS._utils.getParam(params.colors, data) || [],
                                indices : SceneJS._utils.getParam(params.indices, data) || [],
                                uv : SceneJS._utils.getParam(params.uv, data) || [],
                                primitive : SceneJS._utils.getParam(params.primitive, data) || "triangles"
                            };
                        }
                    }

                    /* Check geometry not evicted
                     */
                    if (type) {
                        if (!SceneJS_geometryModule.testGeometryExists(type)) {
                            type = null;
                        }
                    }

                    /* type is null if geometry evicted or not yet defined
                     */
                    if (!type) {
                        if (create) {

                            /* Type generated if null
                             */
                            type = SceneJS_geometryModule.createGeometry(params.type, create()); // Lazy-create geometry through callback
                        } else {
                            type = SceneJS_geometryModule.createGeometry(params.type, geo);
                        }
                    }
                    SceneJS_geometryModule.drawGeometry(type);
                    this._renderChildren(traversalContext, data);
                };
            })());
};
