/**
 * Introductory SceneJS Example - Interpolated rotation of a teapot
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

var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0.0, y: 5.0, z: -8},
            look : { x : 0.0, y : 1.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 }

        },

                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0  }
                },

                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        }),

                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        }),

                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        }),

                        SceneJS.material({
                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                            specular:       0.9,
                            shine:          6.0
                        },

                                SceneJS.rotate({                               // Interpolator target
                                    id: "spin",
                                    angle: 0.0,
                                    y : 1.0
                                },
                                        SceneJS.rotate({                      // Interpolator target
                                            id: "tip",
                                            angle: 0.0,
                                            z : 1.0
                                        },
                                                SceneJS.scale({              // Interpolator target
                                                    id: "stretch",
                                                    x: 1,
                                                    y: 1,
                                                    z: 1
                                                },
                                                        SceneJS.teapot())))),

                        SceneJS.interpolator({
                            type:"linear",
                            target: "spin",
                            targetProperty: "angle",
                            keys: [0.0, 0.4, 1, 1.4, 1.8, 2.0, 5],               // Seconds
                            values: [0.0, 100.0, 150.0, 150.0, 150.0, 0.0, 360]    // Values
                        }),

                        SceneJS.interpolator({
                            type:"linear",
                            target: "tip",
                            targetProperty: "angle",
                            keys: [0.0, 0.4, 1, 1.4, 1.8, 2.0],               // Seconds
                            values: [0.0, 0.0, -50.0, -50.0, 0.0, 0.0]        // Values
                        }),

                        SceneJS.interpolator({
                            type:"linear",
                            target: "stretch",
                            targetProperty: "y",
                            keys: [2.0, 3.0, 4.0, 5.0],                       // Seconds
                            values: [1.0, 2.0, .3, 1.0]                       // Values
                        }),

                        SceneJS.interpolator({
                            type:"linear",
                            target: "stretch",
                            targetProperty: "x",
                            keys: [2.5, 3.5, 4.5, 5.5],                       // Seconds
                            values: [1.0, 3.0, .1, 1.0]                       // Values
                        }))));

window.render = function() {
    exampleScene.render();
};

var pInterval;

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);



