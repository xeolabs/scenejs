/**
 * JSON Scene Graph with Interpolated Transformation of a Teapot
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 * This example crudely pours some tea from the Newell Teapot, using
 * two linear Interpolators that interpolate yaw and pitch rotations
 * from the elapsed time.
 *
 * Since V0.7.3, other types of supported interpolation are: "cosine", "cubic"
 * and "constant".
 *
 */

SceneJS.createNode({
    type: "scene",
    id: "the-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 5.0, z: -8},
            look : { x : 0.0, y : 1.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",

                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                            specular:       0.9,
                            shine:          6.0,

                            nodes: [
                                {
                                    // Interpolator target
                                    type: "rotate",
                                    id: "spin",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [
                                        {
                                            // Interpolator target
                                            type: "rotate",
                                            id: "tip",
                                            angle: 0.0,
                                            z : 1.0,

                                            nodes: [
                                                {
                                                    // Interpolator target
                                                    type: "scale",
                                                    id: "stretch",
                                                    x: 1,
                                                    y: 1,
                                                    z: 1,

                                                    nodes:[
                                                        {
                                                            type: "teapot"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },

                        /* Interpolator nodes - these can be placed anywhere in the scene graph as long as they
                         * will be visited during traversal.
                         *
                         * Notice their "once" attribute, which indicates that once they have completed their
                         * interpolation sequences they are to be removed from the scene and destroyed. This is
                         * handy for injecting fire-and-forget animations into a scene graph.
                         */
                        {
                            type: "interpolator",
                            mode:"linear",
                            target: "spin",
                            targetProperty: "angle",

                            // Seconds and values
                            keys: [0.0, 0.4, 1, 1.4, 1.8, 2.0, 5],
                            values: [0.0, 100.0, 150.0, 150.0, 150.0, 0.0, 360],
                            once: true  // Destroy this node when interpolation finished
                        },
                        {
                            type: "interpolator",
                            mode:"linear",
                            target: "tip",
                            targetProperty: "angle",
                            keys: [0.0, 0.4, 1, 1.4, 1.8, 2.0],
                            values: [0.0, 0.0, -50.0, -50.0, 0.0, 0.0],
                            once: true
                        },
                        {
                            type: "interpolator",
                            mode:"linear",
                            target: "stretch",
                            targetProperty: "y",
                            keys: [2.0, 3.0, 4.0, 5.0],
                            values: [1.0, 2.0, .3, 1.0],
                            once: true
                        },
                        {
                            type: "interpolator",
                            mode:"linear",
                            target: "stretch",
                            targetProperty: "x",
                            keys: [2.5, 3.5, 4.5, 5.5],
                            values: [1.0, 3.0, .1, 1.0],
                            once: true
                        }
                    ]
                }
            ]
        }
    ]
});


SceneJS.withNode("the-scene").start({ fps: 60 });


