/**
 * Introductory SceneJS Example - Interpolated rotation of a teapot
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 * This example crudely pours some tea from the OpenGL teapot, using
 * two linear Interpolators that interpolate yaw and pitch rotations
 * from an alpha value fed in through a scene data scope.
 *
 * Since V0.7.3, other types of supported interpolation are: "cosine", "cubic"
 * and "constant".
 *
 * See how the Inpolators are configured with the names of the
 * incoming alpha value and the outgoing value. Each time they are visited,
 * they will interpolate within their key-vaue sequences by the alpha,
 * then write the output to a fresh child scope for their sub-nodes.
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
                        aspect : 1.0,
                        near : 0.10,
                        far : 300.0  }
                },

                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                }
                            ]},
                                SceneJS.material({
                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:       0.9,
                                    shine:          6.0
                                },
                                        SceneJS.interpolator({
                                            type:"linear",
                                            input:"alpha",
                                            output:"yaw",
                                            keys: [0.0, 0.2, 0.5, 0.7, 0.9, 1.0],
                                            values: [0.0, 100.0, 150.0, 150.0, 150.0, 0.0]
                                        },
                                                SceneJS.interpolator({
                                                    type:"linear",
                                                    input:"alpha",
                                                    output:"pitch",
                                                    keys: [0.0, 0.2, 0.5, 0.7, 0.9, 1.0],
                                                    values: [0.0, 0.0, -50.0, -50.0, 0.0, 0.0]
                                                },
                                                        SceneJS.rotate(function(data) {
                                                            return { angle : data.get("yaw"), y: 1.0 };
                                                        },
                                                                SceneJS.rotate(function(data) {
                                                                    return { angle : data.get("pitch"), z: 1.0 };
                                                                },
                                                                        SceneJS.objects.teapot()
                                                                        )
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        ); // scene

var alpha = 0;

window.render = function() {
    if (alpha > 1) {
        clearInterval(pInterval);
        exampleScene.destroy();
    } else {
        alpha += 0.002;

        exampleScene
                .setData({"alpha":alpha})
                .render();
    }
};

var pInterval;

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);



