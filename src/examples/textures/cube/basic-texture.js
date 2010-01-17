/**
 * Introductory SceneJS Example - Textured Cube
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 *
 */
with (SceneJs) {
    var exampleScene = scene({}, // node always has a config object

            canvas({ canvasId: 'mycanvas'},

                    viewport({ x : 1, y : 1, width: 400, height: 400},

                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 30.0, y: 30.0, z: 30.0 }
                                            }
                                        ]},
                                            perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                            },
                                                    lookAt({
                                                        eye : { x: 0.0, y: 15.0, z: -60},
                                                        look : { x : 0.0, y : 0.0, z : 0 },
                                                        up : { x: 0.0, y: 1.0, z: 0.0 }

                                                    },

                                                        /** Texture is configured with the URI at which its
                                                         * image is stored. Textures are loaded asynchronously;
                                                         * by default they will cause scene traversal to bypass their
                                                         * child nodes until the texture image has loaded. However,
                                                         * you can configure them with waiting:false if you want
                                                         * thier child geometries to appear all naked and shivering
                                                         * while the texture image loads.
                                                         */
                                                            texture({
                                                                uri:"https://developer.mozilla.org/samples/webgl/sample6/cubetexture.png",
                                                                waiting: true
                                                            },
                                                                    rotate({ angle: 45, x : 1.0, y : 1.0},
                                                                            SceneJs.objects.cube()
                                                                            )
                                                                    )
                                                            ) // lookAt
                                                    ) // perspective
                                            ) // lights
                                    ) // shader
                            ) // viewport
                    ) // canvas
            ); // scene


    var pInterval;

    /* Our periodic render function. This will stop the render interval when the count of
     * scene processes is zero.
     */
    function doit() {
        if (exampleScene.getNumProcesses() == 0) {

            /* No processes running in scene, so texture is loaded and we'll stop. The previous
             * render will have drawn the texture.
             */
            exampleScene.destroy();
            clearInterval(pInterval);
        } else {

            /* Otherwise, a process is still running on the scene, so the texture
             * must still be loading. Note that just as scene processes are created
             * during a scene render, they are also destroyed during another
             * subsequent render. Scene processes don't magically stop between renders,
             * you have to do a render to given them the opportunity to stop.
             */
            try {
                exampleScene.render();
            } catch (e) {
                if (e.message) {
                    alert(e.message);
                } else {
                    alert(e);
                }
                throw e;
            }
        }
    }

    /* This initial render will trigger the texture load, starting one scene process
     */
    exampleScene.render();

    /* Keep rendering until texture loaded, ie. no scene processes running
     */
    pInterval = setInterval("doit()", 10);
}
