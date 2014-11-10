/**
 * Customizable skybox node type, which allows you to customize its texture
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "skyboxes/custom",
 *      texture: "foo/bar/mySkyboxTexture.jpg",
 *      size: 5000 // Box half-size on each axis - default is 5000
 *  });
 */
SceneJS.Types.addType("skyboxes/custom", {

    // TODO: expose node props to tweak the geometry coords to map to variations in texture UV mappings?

    construct: function (params) {

        var self = this;

        // Fall back on clouds texture by default
        var src = params.src || SceneJS.getConfigs("pluginPath") + "/node/skyboxes/textures/clouds.jpg";

        var image = new Image();
        image.onload = function () {
            buildNodes();
        };
        image.onerror = function () {
        };
        image.src = src;

        function buildNodes() {

            // Sky box dimensions on each axis
            var size = params.size || 5000.0;

            // Vertex shader which anchors the skybox translation
            self.addNode({

                // Special pick name so that we can ignore picks on sky boxes
                type: "name",
                name: "__SceneJS_dontPickMe",

                nodes: [
                    {
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
                        ],
                        nodes: [
                            // Disable lighting for the sky box
                            {
                                type: "flags",
                                flags: {
                                    specular: false,
                                    diffuse: false,
                                    ambient: false
                                },
                                nodes: [
                                    {
                                        type: "material",
                                        color: { r: 0, g: 0, b: 0  },
                                        emit: 0.0,
                                        nodes: [
                                            // Clouds texture
                                            {
                                                type: "texture",
                                                layers: [
                                                    {
                                                        src: src,
                                                        blendMode: "add"
                                                    }
                                                ],
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
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
        }
    }
});
