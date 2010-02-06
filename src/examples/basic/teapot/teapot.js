/**
 * Introductory SceneJS Example - The OpenGL Teapot
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * This is a simple scene to demonstrate the general SceneJS idea. A scene basically renders images to
 * one or more OpenGL canvas elements in the browser page. At the core of a scene is at least one shader
 * (which loads a set of vertex and fragment shader scripts written in the OpenGL Shader Language), while the rest
 * of the scene frontend is essentially for generating things like matrices, lightsources, material properties,
 * geometry etc. and loading them into the Shader.
 *
 * Each node is a function which modifies some bit of scene state on entry and undoes it again before returning. Each node
 * therefore only affects those in the subtree beneath it.
 *
 * This example activates a canvas, activates a (really basic) shader on that canvas, then renders a perspective
 * projection of a scaled and X-rotated instance of the venerable OpenGL teapot to that canvas.
 *
 * Lots of wicked scene features are not demonstrated here, such as animation, multiple canvases, advanced shaders
 * and so on. I'll show you those in later examples.
 */
with (SceneJs) {
    var introScene = scene({}, // node always has a config object

            renderer({
                canvasId: 'theCanvas',
                clear : { depth : true, color : true}
            },
                    shader({ type: 'simple-shader' },

                            lights({
                                lights: [
                                    {
                                        pos: { x: -30.0, y: 30.0, z: -30.0 }
                                    }
                                ]},
                                    perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                    },
                                            lookat({
                                                eye : { x: 0.0, y: 7.0, z: -15},
                                                look : { x : 0.0, y : 1.0, z : 0 },
                                                up : { x: 0.0, y: 1.0, z: 0.0 }

                                            },
                                                    material({
                                                        ambient:  { r:0.2, g:0.2, b:0.5 },
                                                        diffuse:  { r:0.6, g:0.6, b:0.9 }
                                                    },

                                                            rotate(function(scope) {
                                                                return { angle : scope.get("angle"), y: 1.0 };
                                                            },

                                                                /* Bounding box around teapot
                                                                 */
                                                                    axisBoundary({
                                                                        xmin: -4,
                                                                        ymin: -4,
                                                                        zmin: -4,
                                                                        xmax: 4,
                                                                        ymax: 4,
                                                                        zmax: 4 },

                                                                            objects.teapot()
                                                                            )
                                                                    )
                                                            )
                                                    ) // lookat
                                            ) // perspective
                                    ) // lights
                            ) // shader                      
                    ) // renderer
            ); // scene

    /* Lets do it - render one frame of the scene frontend. The teapot's X-rotation angle is fed into the scene here, to
     * be passed to the rotate node in the 'scope' as used in the rotate node config. Note that if your scene frontend
     * was interactive or animated, you would call this method in a loop.
     */
    try {
        introScene.render({angle: 45});
    } catch (e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e.message || e;
    }

    /* Finished with the scene, so we might as well tell SceneJS to free wharever resources it has allocated for the
     * scene, such as the shader scripts and the vertex buffer objects (VBOs) it created for the teapot geometry.
     */
    introScene.destroy();
}