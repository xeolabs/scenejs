SceneJS.geometry({

    // Optional unique type name; if another geometry already has this, then this geometry will not be created and the
    // other geometry will be instanced in place of this one

    type: "my-geometry",

    // Primitive type - "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan".

    primitive: "triangles",

    // The vertices - eight for our cube, each one spaining three array elements for X,Y and Z

    positions : [

        /* Front cube face
         */
        5, 5, 5,
        -5, 5, 5,
        -5,-5, 5,
        5,-5, 5,

        //...
    ],

    // Normal vectors, one for each vertex

    normals : [

        /* v0-v1-v2-v3 front
         */
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        //...
    ],

    // 2D texture coordinates corresponding to the 3D positions defined above - eight for our cube, each
    // one spaining two array elements for X and Y

    uv : [

        /* v0-v1-v2-v3 front
         */
        5, 5,
        0, 5,
        0, 0,
        5, 0,

        // ...
    ],

    // Indices - these organise the positions and uv texture coordinates into geometric primitives in accordance
    // with the "primitive" parameter, in this case a set of three indices for each triangle. Note that each
    // triangle is specified in counter-clockwise winding order. You can specify them in clockwise order if you
    // configure the SceneJS.renderer node's frontFace property as "cw", instead of the default "ccw".

    indices : [

        /* Front
         */
        0, 1, 2,
        0, 2, 3,

        // ...
    ]
})