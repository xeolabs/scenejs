/**
 * Introductory SceneJS Example - The OpenGL Teapot
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * This is a simple scene to demonstrate the general SceneJS idea. A scene basically renders images to
 * one or more WebGL canvas elements in the browser page. Each node is a function which modifies some bit of
 * scene state on entry and undoes it again before returning. Each node therefore only affects those in the
 * subtree beneath it.
 *
 * This example activates a WebGL canvas, to which it then renders a perspective projection of a scaled and X-rotated
 * instance of the venerable OpenGL teapot.
 *
 * Lots of wicked scene features are not demonstrated here, such as animation, multiple canvases, custom shaders
 * and so on. I'll show you those in later examples.
 */
with (SceneJS) {
    var introScene = scene(

            loggingToPage({ elementId: "logging" },
                    
                    renderer({
                        canvasId: 'theCanvas',
                        clear : { depth : true, color : true }

                    },
                            lights({
                                lights: [
                                    {
                                        pos: { x: -30.0, y: 30.0, z: -36.0 }
                                    }
                                ]},
                                    perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                    },
                                            lookAt({
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

                                                                    objects.teapot()
                                                                    )
                                                            )
                                                    ) // lookAt
                                            ) // perspective
                                    ) // lights
                            ) // renderer
                    )
            ); // scene

    /* Lets do it - render one frame of the scene frontend. The teapot's X-rotation angle is fed into the scene here, to
     * be passed to the rotate node in the 'scope' as used in the rotate node config. Note that if your scene frontend
     * was interactive or animated, you would call this method in a loop.
     */
    //try {
    introScene.render({angle: 45});
    //    } catch (e) {
    //        if (e.message) {
    //            alert(e.message);
    //        } else {
    //            alert(e);
    //        }
    //        throw e.message || e;
    //    }

    /* Finished with the scene, so we might as well tell SceneJS to free wharever resources it has allocated for the
     * scene, such as the shader scripts and the vertex buffer objects (VBOs) it created for the teapot geometry.
     */
    introScene.destroy();
}