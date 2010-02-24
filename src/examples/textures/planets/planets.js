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
    with (SceneJS) {
        var exampleScene;
        var makeScene = function() {
            exampleScene = scene({}, // node always has a config object


                    renderer({ canvasId: 'theCanvas',    clear : { depth : true, color : true}},

                        /** The texture will only work within a shader
                         * that will perform the texture mapping, like this
                         * default one:
                         */
                            shader({
                                type: 'simple-shader'
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
                                                        eye : { x: 0.0, y: 0.0, z: -120},
                                                        look : { x : 0.0, y : 0.0, z : 0 },
                                                        up : { x: 0.0, y: 1.0, z: 0.0 }

                                                    },
                                                            translate({y:-9},
                                                                    asset({
                                                                        uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/mercury.js",
                                                                        proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                    ),

                                                            translate({y:-6},
                                                                    asset({
                                                                        uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/venus.js",
                                                                        proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                    ),

                                                            translate({y:-3},
                                                                    asset({
                                                                        uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/earth.js",
                                                                        proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                    ),

                                                            translate({y:-0},
                                                                    asset({
                                                                        uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/mars.js",
                                                                        proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                    ),

                                                            translate({y:3},

                                                                    asset({
                                                                        uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/jupiter.js",
                                                                        proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                    ),

                                                            translate({y:6},

                                                                    asset({
                                                                        uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/uranus.js",
                                                                        proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                    ),

                                                            translate({y:9},

                                                                    asset({
                                                                        uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/neptune.js",
                                                                        proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                    ))

                                                // ) // lookAt
                                                    ) // perspective
                                            ) // lights
                                    ) // shader
                            ) // renderer
                    ); // scene
        };

        makeScene();

        var pInterval;


        function handleError(e) {
            if (e.message) {
                alert(e.message);
            } else {
                alert(e);
            }
            throw e;
        }

        /* Our periodic render function. This will stop the render interval when the count of
         * scene processes is zero.
         */
        function doit() {

            if (exampleScene.getNumProcesses() == 0) {
                exampleScene.destroy();
                makeScene();

            }
            try {
                exampleScene.render();
            } catch (e) {
                handleError(e);
            }

        }

        pInterval = setInterval("doit()", 10);
    }
} catch (e) {
    alert(e.message || e);
    throw e;
}
