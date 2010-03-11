/**
 * Introductory SceneJS Example - Cube Textured with Image of General Zod
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
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
var exampleScene = SceneJS.scene(

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    canvasId: 'theCanvas',
                    clear : { depth : true, color : true },
                    enableTexture2D: true
                },

                        SceneJS.lights({
                            lights: [
                                {
                                    pos: { x: -30.0, y: -1000.0, z: 300.0 }
                                }
                            ]},
                                SceneJS.perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                },
                                        SceneJS.lookAt({
                                            eye : { x: 0.0, y: 0.0, z: -10},
                                            look : { x : 0.0, y : 0.0, z : 0 },
                                            up : { x: 0.0, y: 1.0, z: 0.0 }

                                        },
                                                SceneJS.material({
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
                                                        SceneJS.texture({
                                                            uri:"general-zod.jpg",
                                                            wait: false
                                                        },
                                                                SceneJS.rotate({ angle: 45, x : 1.0, y : 1.0},

                                                                        SceneJS.objects.cube()
                                                                        )
                                                                )
                                                        )
                                                )
                                    // ) // lookAt
                                        ) // perspective
                                ) // lights
                        ) // renderer
                ) // loggingToPage
        ); // scene

var pInterval;

/* First render starts loading the texture and renders an untextured box
 */
exampleScene.render();

/* Now we'll continuously render the scene until the count of running
 * processes is zero (ie. at which point the texture load process will have
 * completed and the texture has been applied and rendered). Processes
 * are only started and killed within scene traversals, so as not to cause
 * confusion (ie. race conditions) when we query them in the "idle"
 * interval inbetween.
 */
function doit() {
    if (exampleScene.getNumProcesses() > 0) {
        exampleScene.render();
    } else {
        clearInterval(pInterval);
        exampleScene.destroy();
    }
}
pInterval = setInterval("window.doit()", 10);


