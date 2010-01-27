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

            renderer({ canvasId: 'theCanvas',    clear : { depth : true, color : true}},
                    shader({
                        type: 'texture-shader' ,

                        enableTexture2D: true
                    },

                            lights({
                                lights: [
                                    {
                                        pos: { x: 30.0, y: 30.0, z: 30.0 }
                                    }
                                ]},
                                    perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                    },
                                            lookAt({
                                                eye : { x: 0.0, y: 15.0, z: -5},
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
                                                        waiting: false
                                                    },
                                                            rotate(function(scope) {
                                                                return { angle: scope.get("angle"), x : 1.0, y : 1.0}
                                                            },
                                                                    SceneJs.objects.cube()
                                                                    )
                                                            )
                                                    ) // lookAt
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
            } else {
                alert(e);
            }
            throw e;
        }

    }

    /* This initial render will trigger the texture load, starting one scene process
     */
    try {
        exampleScene.render({angle:angle});
    } catch (e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e;
    }

    /* Keep rendering until texture loaded, ie. no scene processes running
     */
    pInterval = setInterval("doit()", 10);
}
