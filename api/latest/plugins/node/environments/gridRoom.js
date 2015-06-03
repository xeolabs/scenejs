/**

 Pre-made scene environment

 @author xeolabs / http://xeolabs.com

 */
SceneJS.Types.addType("environments/gridRoom", {

    construct: function (params) {

        var scale = params.scale || 1.0;

        this.addNode({
            type: "cameras/orbit",
            yaw: 40,
            pitch: -20,
            zoom: 30,
            zoomSensitivity: 2.0,
            eye: { x: 0, y: 0, z: 10 },
            look: { x: 0, y: 0, z: 0 },

            nodes: [

                // Depth-of-field blur effect, implemented by plugin at:
                // http://scenejs.org/api/latest/plugins/node/postprocess/dof.js
                {
                 //   type: "postprocess/dof",
                    texelSize: 0.00022,    // Size of one texel (1 / width, 1 / height)
                    blurCoeff: 0.0084,	   // Calculated from the blur equation, b = ( f * ms / N )
                    focusDist: 30.0,	   // The distance to the subject in perfect focus (= Ds)
                    ppm: 10000,            // Pixels per millimetre
                    near: 0.1,
                    far: 10000.0,

                    nodes: [
                        {
                            type: "lights",
                            lights: [
                                {
                                    mode: "ambient",
                                    color: { r: 0.5, g: 0.5, b: 0.5 },
                                    diffuse: false,
                                    specular: false
                                },
                                {
                                    mode: "dir",
                                    color: { r: 0.8, g: 0.8, b: 0.8 },
                                    diffuse: true,
                                    specular: true,
                                    dir: { x: 1.0, y: -0.9, z: -0.7 },
                                    space: "world"
                                },
                                {
                                    mode: "dir",
                                    color: { r: 0.8, g: 0.8, b: 0.8 },
                                    diffuse: true,
                                    specular: true,
                                    dir: { x: -1.0, y: -0.9, z: 0.7 },
                                    space: "world"
                                }
                            ],

                            nodes: [

                                // Skybox with grid pattern, implemented by plugin at:
                                // http://scenejs.org/api/latest/plugins/node/skybox/numberedGrid.js
                                {
                                    type: "skybox/numberedGrid",
                                    size: 5000 // Box half-size on each axis - default is 5000
                                },

                                // Reflection of grid skybox, implemented by plugin at:
                                // http://scenejs.org/api/latest/plugins/node/reflect/numberedGrid.js
                                {
                                    type: "reflect/numberedGrid",
                                    intensity: 0.8,

                                    // Child nodes
                                    nodes: [
                                        {
                                            type: "scale",
                                            x: scale,
                                            y: scale,
                                            z: scale,
                                            nodes: params.nodes
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
});