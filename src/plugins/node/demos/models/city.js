SceneJS.Types.addType("demos/models/city", {

    construct: function (params) {

        this.addNode(

            // Depth-of-field blur effect, implemented by plugin at:
            // http://scenejs.org/api/latest/plugins/node/postprocess/dof.js
            {
                type: "postprocess/dof",
                id: "myDOF",
                texelSize: 0.00022,    // Size of one texel (1 / width, 1 / height)
                blurCoeff: 0.0084,	   // Calculated from the blur equation, b = ( f * ms / N )
                focusDist: 100,	   // The distance to the subject in perfect focus (= Ds)
                ppm: 10000,            // Pixels per millimetre
                near: 0.1,
                far: 10000.0,

                nodes: [
                    {
                        type: "lights",
                        lights: [
                            {
                                mode: "ambient",
                                color: { r: 0.5, g: 0.5, b: 0.4 }
                            },
                            {
                                mode: "dir",
                                color: { r: 1.0, g: 1.0, b: 1.0 },
                                diffuse: true,
                                specular: true,
                                dir: { x: 0.5, y: 0.0, z: 1.0 },
                                space: "view"
                            },
                            {
                                mode: "dir",
                                color: { r: 1.0, g: 1.0, b: 1.0 },
                                diffuse: true,
                                specular: true,
                                dir: { x: -1.0, y: 0.0, z: 0.5 },
                                space: "view"
                            }
                        ],

                        nodes: [

                            // Clouds skybox, implemented by plugin at
                            // http://scenejs.org/api/latest/plugins/node/skybox/clouds.js
                            {
                                type: "skybox/clouds"
                            },

                            // Fog effect, implemented by plugin at
                            // http://scenejs.org/api/latest/plugins/node/shader/fog.js
                            {
                                type: "shader/fog",
                                mode: "exp", // Quadratic
                                density: 0.01, // Fog density
                                start: 30.0, // Near starting point
                                end: 5000.0, // Far ending point
                                color: { r: 0.7, g: 0.7, b: 0.8 }, // Fog color

                                nodes: [

                                    // Grid ground, implemented by plugin at
                                    // http://scenejs.org/api/latest/plugins/node/ground/grid.js
                                    {
                                        type: "models/ground/grid"
                                    },

                                    // The reflection cube map, implemented by plugin at
                                    // http://scenejs.org/api/latest/plugins/node/reflect/clouds.js
                                    {
                                        type: "reflect/clouds",
                                        intensity: 0.7, // A fairly subtle reflection

                                        nodes: [

                                            // Flags to switch off backfaces
                                            {
                                                type: "flags",
                                                flags: {
                                                    backfaces: false
                                                },

                                                nodes: [

                                                    // City, implemented by plugin at
                                                    // http://scenejs.org/api/latest/plugins/node/models/buildings/city.js
                                                    {
                                                        type: "models/buildings/city",
                                                        width: 600
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
    },

    destruct: function () {
        // Not used
    }
});
