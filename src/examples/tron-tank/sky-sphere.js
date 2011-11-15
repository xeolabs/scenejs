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
        }
    ],

    nodes: [
        {
            type: "scale",

            x: 100,
            y: 100,
            z: 100,

            nodes: [
                {
                    type: "material",

                    baseColor: { r: .4, g: .4, b: .9 },
                    emit: 0.3,

                    nodes: [
                        {
                            type: "sphere"
                        }
                    ]
                }
            ]
        }
    ]
};
