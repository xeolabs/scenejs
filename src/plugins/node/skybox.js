/**

 Customizable skybox node type, which allows you to customize its texture

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>
 someNode.addNode({
       type: "skybox",
       texture: "foo/bar/mySkyboxTexture.jpg",
       size: 5000 // Box half-size on each axis - default is 5000
   });
 </pre>
 */
SceneJS.Types.addType("skybox", {

    // TODO: expose node props to tweak the geometry coords to map to variations in texture UV mappings?

    construct: function (params) {

        var self = this;

        var src = params.src;

        // Sky box dimensions on each axis
        var size = params.size || 5000.0;

        var srcIsArray = SceneJS._isArray(src);

        // Reflection
//        if (params.reflect && srcIsArray) {
//            this.addNode({
//                type: "reflect",
//                intensity: params.intensity,
//                src: params.src,
//                nodes: params.nodes
//            });
//        } else {
//            if (params.nodes) {
//                this.addNodes(params.nodes);
//            }
//        }

        // Vertex shader which anchors the skybox translation
        var shader = self.addNode({
            type: "shader",
            shaders: [
                {
                    stage: "vertex",
                    code: [
                        "mat4 myViewMatrix(mat4 m) {",
                        "   m[3][0] =m[3][1] = m[3][2] = 0.0;",
                        "return m;",
                        "}"
                    ],
                    // Bind our injected functions to SceneJS hook points
                    hooks: {
                        viewMatrix: "myViewMatrix"
                    }
                }
            ]
        });

        // Disable lighting and picking for the sky box
        var flags = shader.addNode({
            type: "flags",
            flags: {
                specular: false,
                diffuse: false,
                ambient: false,
                picking: false
            }});

        var material = flags.addNode({
            type: "material",
            color: { r: 0, g: 0, b: 0  },
            emit: 0.0
        });

        var scale = material.addNode({
            type: "scale",
            x: size, y: size, z: size
        });

        if (srcIsArray) {

            // Array of textures given, one for each face

            scale.addNodes([

                // Front
                {
                    type: "texture",
                    src: src[0],
                    blendMode: "add",
                    nodes: [
                        {
                            type: "geometry",
                            positions: [ 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1 ], // v0-v1-v2-v3 front
                            uv: [ 1, 0, 0, 0, 0, 1, 1, 1 ],
                            indices: [ 2, 1, 0, 3, 2, 0 ]
                        }
                    ]
                },

                // Right
                {
                    type: "texture",
                    src: src[1],
                    blendMode: "add",
                    nodes: [
                        {
                            type: "geometry",
                            positions: [ 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1 ], // v0-v3-v4-v5 right
                            uv: [ 1, 0, 0, 0, 0, 1, 1, 1 ],
                            indices: [ 2, 1, 0, 3, 2, 0 ]
                        }
                    ]
                },

                // Top
                {
                    type: "texture",
                    src: src[2],
                    blendMode: "add",
                    nodes: [
                        {
                            type: "geometry",
                            positions: [ 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1 ], // v0-v5-v6-v1 top
                            uv: [ 1, 0, 0, 0, 0, 1, 1, 1 ],
                            indices: [ 2, 1, 0, 3, 2, 0 ]
                        }
                    ]
                },

                // Left
                {
                    type: "texture",
                    src: src[3],
                    blendMode: "add",
                    nodes: [
                        {
                            type: "geometry",
                            positions: [ -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1 ], // v1-v6-v7-v2 left
                            uv: [ 1, 0, 0, 0, 0, 1, 1, 1 ],
                            indices: [ 0, 1, 2, 0, 2, 3]
                        }
                    ]
                },

                // Bottom
                {
                    type: "texture",
                    src: src[4],
                    blendMode: "add",
                    nodes: [
                        {
                            type: "geometry",
                            positions: [ -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1  ], // v7-v4-v3-v2 bottom
                            uv: [ 1, 0, 0, 0, 0, 1, 1, 1 ],
                            indices: [ 2, 1, 0, 3, 2, 0 ]
                        }
                    ]
                },

                // Back
                {
                    type: "texture",
                    src: src[5],
                    blendMode: "add",
                    nodes: [
                        {
                            type: "geometry",
                            positions: [ 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1 ], // v4-v7-v6-v5 back
                            uv: [ 1, 0, 0, 0, 0, 1, 1, 1 ],
                            indices: [ 0, 1, 2, 0, 2, 3]
                        }
                    ]
                }
            ]);

        } else {

            // Single texture given

            material.addNode({
                type: "texture",
                src: src,
                blendMode: "add",

                nodes: [
                    {
                        type: "scale",
                        x: size, y: size, z: size,
                        nodes: [
                            // Sky box geometry
                            {
                                type: "geometry",
                                positions: [
                                    1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, // v0-v1-v2-v3 front
                                    1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, // v0-v3-v4-v5 right
                                    1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1, // v0-v5-v6-v1 top
                                    -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, // v1-v6-v7-v2 left
                                    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // v7-v4-v3-v2 bottom
                                    1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1 // v4-v7-v6-v5 back
                                ],
                                uv: [
                                    0.5, 0.6666,
                                    0.25, 0.6666,
                                    0.25, 0.3333,
                                    0.5, 0.3333,

                                    0.5, 0.6666,
                                    0.5, 0.3333,
                                    0.75, 0.3333,
                                    0.75, 0.6666,

                                    0.5, 0.6666,
                                    0.5, 1,
                                    0.25, 1,
                                    0.25, 0.6666,

                                    0.25, 0.6666,
                                    0.0, 0.6666,
                                    0.0, 0.3333,
                                    0.25, 0.3333,

                                    0.25, 0,
                                    0.50, 0,
                                    0.50, 0.3333,
                                    0.25, 0.3333,

                                    0.75, 0.3333,
                                    1.0, 0.3333,
                                    1.0, 0.6666,
                                    0.75, 0.6666
                                ],
                                indices: [
                                    0, 1, 2,
                                    0, 2, 3,
                                    4, 5, 6,
                                    4, 6, 7,
                                    8, 9, 10,
                                    8, 10, 11,
                                    12, 13, 14,
                                    12, 14, 15,

                                    16, 17, 18,
                                    16, 18, 19,

                                    20, 21, 22,
                                    20, 22, 23
                                ]
                            }
                        ]
                    }
                ]
            });
        }
    }
});
