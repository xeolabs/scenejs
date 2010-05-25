/**
 * SceneJS Example - Importing a SceneJS teapot from the local file system
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * January 2010
 *
 * SceneJS is geared to composition of scenes from re-usable, parameterised
 * fragments. It can automatically manage a lean set of in-memory fragments by
 * loading them cross-domain on demand, while evicting them following a
 * least-recently-used policy to maintain the pool of free memory. Its terse
 * API means that fragments are compact, allowing them to propagate rapidly
 * across the network. Being JavaScript, they evaluate straight into the
 * browser with no expensive parsing.
 *
 * This example loads an orange teapot from the the local file system.
 *
 * When the scene is first rendered, the SceneJS.load node will load the
 * JavsScript file, which it will then evaluate into a subgraph of scene content.
 *
 * The SceneJS.load's request will always be asynchronous. This means
 * that when SceneJS renders the SceneJS.load, it's not going to wait
 * for the fragment to load before continuing to render the rest of the
 * scene. SceneJS will just trigger the request and move on. So if you're
 * rendering one frame, you wont see the new content in the
 * image. But if you keep rendering the scene for a few frames like
 * in this example, as you would when animating, it will magically appear
 * once loaded.
 */

var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0.0, y: 20.0, z: -20},
            look : { x : 0.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 }

        },
            /* Perspective camera
             */
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
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

                            /** Load the asset
                             */
                                SceneJS.load({
                                    uri:"orange-teapot.js"
                                })

                                )
                        )
                )
        );

/*----------------------------------------------------------------------
 * Scene rendering loop and process query stuff follows
 *---------------------------------------------------------------------*/

/* Our periodic render function.
 */
window.render = function() {
    exampleScene.render();
};

var pInterval;

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);

