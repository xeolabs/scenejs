/**
 * Introductory SceneJS Example - Interpolated rotation of a teapot
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * This example crudely pours some tea from the OpenGL teapot, using
 * two linear scalarInterpolators that interpolate yaw and pitch rotations
 * from an alpha value fed in through a scene data scope.
 *
 * Other types of supported interpolation are: "cosine", "cubic"
 * and "constant".
 *
 * See how the scalarInpolators are configured with the names of the
 * incoming alpha value and the outgoing value. Each time they are visited,
 * they will interpolate within their key-vaue sequences by the alpha,
 * then write the output to a fresh child scope for their sub-nodes.
 */
with (SceneJS) {
    var exampleScene = scene({}, // node always has a config object

            loggingToPage({ elementId: "logging" },

                    renderer({
                        canvasId: 'theCanvas',
                        clearColor : { r:0, g:0, b:0.0, a: 1 },
                        viewport:{ x : 1, y : 1, width: 600, height: 600}  ,
                        clear : { depth : true, color : true}
                    },
                            lights({
                                lights: [
                                    {
                                        pos: { x: -30.0, y: 30.0, z: -30.0 }
                                    }
                                ]},
                                    perspective({ fovy : 55.0, aspect : 1.0, near : 0.10, far : 300.0
                                    },
                                            lookAt({
                                                eye : { x: 0.0, y: 5.0, z: -8},
                                                look : { x : 0.0, y : 1.0, z : 0 },
                                                up : { x: 0.0, y: 1.0, z: 0.0 }

                                            },
                                                    material({
                                                        ambient:  { r:0.2, g:0.2, b:0.5 },
                                                        diffuse:  { r:0.6, g:0.6, b:0.9 }
                                                    },
                                                            scalarInterpolator({
                                                                type:"linear",
                                                                input:"alpha",
                                                                output:"yaw",
                                                                keys: [0.0, 0.2, 0.5, 0.7, 0.9, 1.0],
                                                                values: [0.0, 100.0, 150.0, 150.0, 150.0, 0.0]
                                                            },
                                                                    scalarInterpolator({
                                                                        type:"linear",
                                                                        input:"alpha",
                                                                        output:"pitch",
                                                                        keys: [0.0, 0.2, 0.5, 0.7, 0.9, 1.0],
                                                                        values: [0.0, 0.0, -50.0, -50.0, 0.0, 0.0]
                                                                    },
                                                                            rotate(function(scope) {
                                                                                return { angle : scope.get("yaw"), y: 1.0 };
                                                                            },
                                                                                    rotate(function(scope) {
                                                                                        return { angle : scope.get("pitch"), z: 1.0 };
                                                                                    },
                                                                                            objects.teapot()
                                                                                            )
                                                                                    )
                                                                            )
                                                                    )
                                                            ) // lookAt
                                                    ) // perspective
                                            ) // lights
                                    )
                            )
                    )
            ); // scene

    var alpha = 0;
    var p;

    function handleError(e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e;
    }

    function doit() {
        if (alpha > 1) {
            exampleScene.destroy();
            clearInterval(p);
        }
        alpha += 0.01;
        try {
            exampleScene.render({"alpha":alpha});
        } catch (e) {
            clearInterval(p);
            handleError(e);
        }
    }

    /* Hack to get any scene definition exceptions up front.
     * Chrome seemed to absorb them in setInterval!
     */
    try {
        exampleScene.render({"alpha":alpha});

        /* Continue animation
         */
        pInterval = setInterval("doit()", 10);
    } catch (e) {
        handleError(e);
    }
}
