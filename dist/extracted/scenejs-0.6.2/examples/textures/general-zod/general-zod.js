/**
 * Introductory SceneJS Example - Cube Textured with Image of General Zod
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * Prior to the destruction of Krypton, the criminal General Zod was banished into
 * the Phantom Zone by the Kryptonian Council of Elders. Here is Zod, floating through
 * space, trapped within the dimensional constraints of the Phantom Zone.
 *
 * Actually, he is a JPEG file named general-zod.jpg, mapped onto a cube
 * by a texture node about half-way down this source code.
 *
 * The texture has been configured to not wait for the texture to load before
 * rendering its subtree, so the cube will appear naked and untextured while the JPEG file
 * loads.
 *
 * Now, kneel before Zod.
 */
try {
    with (SceneJS) {
        var exampleScene = scene({}, // node always has a config object

                renderer({ canvasId: 'theCanvas',    clear : { depth : true, color : true}},

                    /** The texture will only work within a shader
                     * that will perform the texture mapping, like this
                     * default one:
                     */
                        shader({
                            type: 'texture-shader'
                        },
                                lights({
                                    lights: [
                                        {
                                            pos: { x: -30.0, y: -1000.0, z: 300.0 }
                                        }
                                    ]},
                                        perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                        },
                                                lookAt({
                                                    eye : { x: 0.0, y: 0.0, z: -10},
                                                    look : { x : 0.0, y : 0.0, z : 0 },
                                                    up : { x: 0.0, y: 1.0, z: 0.0 }

                                                },


                                                        material({
                                                            ambient:  { r:0.3, g:0.3, b:0.3 },
                                                            diffuse:  { r:1.0, g:1.0, b:1.0 }
                                                        },

                                                            /** Texture is configured with the URI at which its
                                                             * image is stored. Textures are loaded asynchronously;
                                                             * by default they will cause scene traversal to bypass their
                                                             * child nodes until the texture image has loaded. However,
                                                             * you can configure them with wait: false if you want
                                                             * thier child geometries to appear all naked and shivering
                                                             * while the texture image loads.
                                                             */
                                                                texture({                                                               
                                                                    uri:"./general-zod.jpg",
                                                                    wait: false
                                                                },
                                                                        rotate(function(scope) {
                                                                            return { angle: scope.get("angle"), x : 1.0, y : 1.0}
                                                                        },
                                                                                SceneJS.objects.cube()
                                                                                )
                                                                        )
                                                                )
                                                        )
                                            // ) // lookAt
                                                ) // perspective
                                        ) // lights
                                ) // shader
                        ) // renderer
                ); // scene


        var pInterval;
        var angle = 0;
        /* Our periodic render function. This will stop the render interval when the count of
         * scene processes is zero.
         */
        function doit() {


            angle += 1;
            try {
                exampleScene.render({angle:angle});
            } catch (e) {
                clearInterval(pInterval);
                if (e.message) {
                    alert(e.message);
                    throw e.message;
                } else {
                    alert(e);
                    throw e;
                }

            }

        }

        /* This initial render will trigger the texture load, starting one scene process
         */
        try {
            exampleScene.render({angle:angle});
        } catch (e) {
            if (e.message) {
                alert(e.message);
                throw e.message;
            } else {
                alert(e);
                throw e;
            }

        }

        /* Keep rendering until texture loaded, ie. no scene processes running
         */
        pInterval = setInterval("doit()", 10);
    }

} catch (e) {
    alert(e.message || e);
}
