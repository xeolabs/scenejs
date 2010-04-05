SceneJS.geometry({

    /* Mandatory type name, must be unique among all
     * geometries - if another geometry has already
     * been defined with this type, then that
     * geometry will be instanced here in place of
     * this one, and this geometry definition will be
     * ignored. This supports dynamic instancing,
     * where we may reuse the same geometry in
     * many places to save memory. Make sure that
     * you give your geometries very unique names,
     * because they may end up alongside all sorts
     * of other geometries from other developers!
     */
    type: "my-geometry",

    /* The primitive type - allowed values are
     * "points", "lines", "line-loop", "line-strip",
     * "triangles", "triangle-strip" and "triangle-fan".
     *
     * See the OpenGL/WebGL specification docs for
     * how arrays are laid out for those.
     */
    primitive: "triangles",

    /* The vertices - eight for our cube, each
     * one spaining three array elements for X,Y and Z
     */
    positions : [

        /* v0-v1-v2-v3 front
         */
        5, 5, 5,
        -5, 5, 5,
        -5,-5, 5,
        5,-5, 5,

        /* v0-v3-v4-v5 right
         */
        5, 5, 5,
        5,-5, 5,
        5,-5,-5,
        5, 5,-5,

        /* v0-v5-v6-v1 top
         */
        5, 5, 5,
        5, 5,-5,
        -5, 5,-5,
        -5, 5, 5,

        /* v1-v6-v7-v2 left
         */
        -5, 5, 5,
        -5, 5,-5,
        -5,-5,-5,
        -5,-5, 5,

        /* v7-v4-v3-v2 bottom
         */
        -5,-5,-5,
        5,-5,-5,
        5,-5, 5,
        -5,-5, 5,

        /* v4-v7-v6-v5 back
         */
        5,-5,-5,
        -5,-5,-5,
        -5, 5,-5,
        5, 5,-5
    ],

    /* Normal vectors, one for each vertex
     */
    normals : [

        /* v0-v1-v2-v3 front
         */
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        /* v0-v3-v4-v5 right
         */
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        /* v0-v5-v6-v1 top
         */
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        /* v1-v6-v7-v2 left
         */
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        /* v7-v4-v3-v2 bottom
         */
        0,1, 0,
        0,1, 0,
        0,1, 0,
        0,1, 0,

        /* v4-v7-v6-v5 back
         */
        0, 0,1,
        0, 0,1,
        0, 0,1,
        0, 0,1
    ],

    /* 2D texture coordinates corresponding to the
     * 3D positions defined above - eight for our cube, each
     * one spaining two array elements for X and Y
     */
    uv : [

        /* v0-v1-v2-v3 front
         */
        5, 5,
        0, 5,
        0, 0,
        5, 0,

        /* v0-v3-v4-v5 right
         */
        0, 5,
        0, 0,
        5, 0,
        5, 5,

        /* v0-v5-v6-v1 top
         */
        5, 0,
        5, 5,
        0, 5,
        0, 0,

        /* v1-v6-v7-v2 left
         */
        5, 5,
        0, 5,
        0, 0,
        5, 0,

        /* v7-v4-v3-v2 bottom
         */
        0, 0,
        5, 0,
        5, 5,
        0, 5,

        /* v4-v7-v6-v5 back
         */
        0, 0,
        5, 0,
        5, 5,
        0, 5
    ],

    /* Indices - these organise the
     * positions and uv texture coordinates
     * into geometric primitives in accordance
     * with the "primitive" parameter,
     * in this case a set of three indices
     * for each triangle.
     *
     * Note that each triangle is specified
     * in counter-clockwise winding order.
     *
     * You can specify them in clockwise
     * order if you configure the SceneJS.renderer
     * node's frontFace property as "cw", instead of
     * the default "ccw".
     */
    indices : [

        /* Front
         */
        0, 1, 2,
        0, 2, 3,

        /* Right
         */
        4, 5, 6,
        4, 6, 7,

        /* Top
         */
        8, 9,10,
        8,10,11,

        /* Left
         */
        12,13,14,
        12,14,15,

        /* Bottom
         */
        16,17,18,
        16,18,19,

        /* Back
         */
        20,21,22,
        20,22,23
    ]
})