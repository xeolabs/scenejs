require([

    // This prefix routes to the 3rd-party libs directory containing resources used by plugins
    "scenejsPluginDeps/dat.gui.min"
],
    function () {

        /**
         Scene template
         */
        SceneJS.Types.addType("environments/newton", {

            construct: function (params) {

                var self = this;

                this.addNode({
                    type: "cameras/pickFlyOrbit",
                    yaw: -40,
                    pitch: -20,
                    maxPitch: -10,
                    minPitch: -80,
                    zoom: 800,
                    eye: { x: 0, y: 150, z: -1000 },
                    look: { x: 0, y: 150, z: 0 },
                    zoomSensitivity: 20.0,
                    showPick: true,

                    nodes: [
                        {
                            type: "postprocess/dof",
                            texelSize: 0.00022,    // Size of one texel (1 / width, 1 / height)
                            blurCoeff: 0.0084,	   // Calculated from the blur equation, b = ( f * ms / N )
                            focusDist: 500.0,	   // The distance to the subject in perfect focus (= Ds)
                            ppm: 10000,            // Pixels per millimetre
                            near: 0.1,
                            far: 10000.0,

                            nodes: [
                                {
                                    type: "lights",
                                    lights: [
                                        {
                                            mode: "ambient",
                                            color: { r: 0.7, g: 0.7, b: 0.9 },
                                            diffuse: false,
                                            specular: false
                                        },
                                        {
                                            mode: "dir",
                                            color: { r: 1.0, g: 1.0, b: 1.0 },
                                            diffuse: true,
                                            specular: false,
                                            dir: { x: 1.0, y: -0.9, z: -0.7 },
                                            space: "world"
                                        },
                                        {
                                            mode: "dir",
                                            color: { r: 1.0, g: 1.0, b: 1.0 },
                                            diffuse: true,
                                            specular: false,
                                            dir: { x: -1.0, y: -0.9, z: 0.7 },
                                            space: "world"
                                        }
                                    ],

                                    nodes: [

                                        // Skybox with clouds
                                        // implemented by plugin at http://scenejs.org/api/latest/plugins/node/skybox/clouds.js
                                        {
                                            type: "skybox/clouds",
                                            size: 5000 // Box half-size on each axis - default is 5000
                                        },


                                        {
                                            type: "material",
                                            color: { r: 0.5, g: 1.0, b: 0.5 },
                                            emit: 0.1,
                                            nodes: [

                                                // Grid ground, implemented by plugin at
                                                // http://scenejs.org/api/latest/plugins/node/models/ground/grid.js
                                                {
                                                    type: "geometry/grid",
                                                    size: { x: 10000, z: 10000 },
                                                    width: 10000,
                                                    height: 10000,
                                                    widthSegments: 100,
                                                    heightSegments: 100
                                                }
                                            ]
                                        },

                                        {
                                            type: "translate",
                                            y: -3,
                                            nodes: [
                                                {
                                                    type: "material",
                                                    color: { r: 0.5, g: 1.0, b: 0.5 },
                                                    emit: 0.01,
                                                    nodes: [

                                                        // Solid green surface under the grid, implemented by plugin at
                                                        // http://scenejs.org/api/latest/plugins/node/models/ground/grid.js
                                                        {
                                                            type: "geometry/grid",
                                                            size: { x: 10000, z: 10000 },
                                                            width: 10000,
                                                            height: 10000,
                                                            widthSegments: 10,
                                                            heightSegments: 10,
                                                            wire: false
                                                        }
                                                    ]
                                                }
                                            ]
                                        },

                                        // Reflection of clouds
                                        // implemented by plugin at http://scenejs.org/api/latest/plugins/node/reflect/clouds.js
                                        {
                                            type: "reflect/clouds",
                                            intensity: 0.4,

                                            // Child nodes
                                            nodes: params.nodes
                                        },

                                    ]
                                }
                            ]
                        }
                    ]
                });
            }
        });
    });