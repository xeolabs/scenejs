/**
 * Introductory SceneJS Example - Cube Textured with Image of General Zod
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 *
 */
try {
    with (SceneJs) {
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
                                                        asset({ uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/jupiter.js",
                                                            proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
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
