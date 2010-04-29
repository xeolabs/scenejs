SceneJS.onEvent("error", function(e) {
    alert(e.exception.message ? e.exception.message : e.exception);
});

var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },
        SceneJS.renderer({ viewport: { xmin: 0, ymin: 0 }}),
        SceneJS.fog(
        { start: 100,  end: 200 },
                SceneJS.perspective({
                    fovy: 20
                },
                        SceneJS.boundingBox({
                            xmin: -3, ymin:-3,zmin:-3,
                            xmax: 3, ymax: 3, zmax:3
                        }))
                ),
        new SceneJS.Geometry({

            // Mandatory primitive type - "points", "lines", "line-loop", "line-strip", "triangles",
            // "triangle-strip" or "triangle-fan".

            primitive: "triangles",

            // Mandatory vertices - eight for our cube, each one spaining three array elements for X,Y and Z

            positions : [

                // Front cube face - vertices 0,1,2,3

                5, 5, 5,
                -5, 5, 5,
                -5,-5, 5,
                5,-5, 5

                //...
            ],

            // Optional normal vectors, one for each vertex. If you omit these, then cube will not be shaded.

            normals : [

                // Vertices 0,1,2,3

                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, -1

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
                5, 0

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
                0, 2, 3

                // ...
            ]
        }));

exampleScene.render({});



