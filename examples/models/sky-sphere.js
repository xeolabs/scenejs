var skySphereJSON = {

    type: "shader",

    shaders: [

        /* Vertex shader with our custom function to intercept the matrix
         */
        {
            stage:  "vertex",
            code: [

                "mat4 myViewMatrix(mat4 m) {",
                "   m[3][0] =m[3][1] = m[3][2] = 0.0;" +
                    "   return m; ",
                "}"
            ],

            hooks: {
                viewMatrix: "myViewMatrix"  // Bind our custom function to hook
            }
        },

        {
            stage: "fragment",
            code: [
                "vec4 savedWorldPos;",

                "vec4 getWorldPos(vec4 pos) {",
                "   savedWorldPos = pos;" +
                    "   return pos; ",
                "}",

                "vec4 tweakPixelColor(vec4 color) {",
                "   color.rgb -= ((savedWorldPos.y-1.5) * 0.01);",
                "   return color; ",
                "}"
            ],

            hooks: {
                worldPos: "getWorldPos",
                pixelColor: "tweakPixelColor"
            }
        }
    ],

    nodes: [
        {
            type: "scale",

            x: 1000,
            y: 1000,
            z: 1000,

            nodes: [
                {
                    type: "material",

                    baseColor: { r: .7, g: .7, b: 1.0 },
                    emit: 0.3,

                    nodes: [
                        {
                            type: "geometry",
                            source: {
                                type: "sphere"
                            }
                        }
                    ]
                }
            ]
        }
    ]
};