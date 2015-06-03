/**

 Pre-made scene environment

 @author xeolabs / http://xeolabs.com

 */
SceneJS.Types.addType("environments/holodeck", {

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
                    //     type: "postprocess/dof",
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
                                    color: { r: 1.0, g: 0.8, b: 0.6 },
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

                                // Skybox with holodeck scene, implemented by plugin at:
                                // http://scenejs.org/api/latest/plugins/node/skybox/holodeck.js
                                {
                                    type: "skybox/holodeck",
                                    size: 5000 // Box half-size on each axis - default is 5000
                                },

                                // Reflection of holodeck scene, implemented by plugin at:
                                // http://scenejs.org/api/latest/plugins/node/reflect/holodeck.js
                                {
                                    type: "reflect/holodeck",
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