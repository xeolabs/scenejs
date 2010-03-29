/**
 * SceneJS Example - Importing a remote SceneJS teapot asset into a scene
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 * "Assets" are remotely-stored scene fragments which may be
 * dynamically loaded, cross-domain, into your scene using asset nodes.
 *
 * This example loads a spiral staircase from an asset repository
 * at SceneJS.com.
 *
 * When the scene is first rendered, the SceneJS.assets.scenejs node
 * will make a JSONP request of the repository, which will respond with
 * the asset data, which is in this case JSON. The node will
 * then convert the data into a subtree of scene graph content.
 *
 * What's extra-special about this example is how the
 * SceneJS.assets.scenejs node is wrapped with a SceneJS.withData node,
 * which parameterises the asset. Try tweaking some of the configurations
 * on the SceneJS.withData node and see how the staircase changes.
 *
 * The node's request will always be asynchronous. This means
 * that when SceneJS renders the asset node, it's not going to wait
 * for the asset to load before continuing to render the rest of the
 * scene. SceneJS will just trigger the asset request and move on.
 * So if you're rendering one frame, you wont see the asset in the
 * image. But if you keep rendering the scene for a few frames like
 * in this example, as you would when animating, the asset will
 * magically appear once loaded.
 *
 * SceneJS tracks these loads and tracks each one as a process that
 * is currently within on the scene - you can then tell if all assets
 * have loaded when the number of scene processes is zero.
 *
 * A nice way to use assets is to somehow have them pre-load
 * bits of scene just before they fall into view, then rely on
 * SceneJS to flush them when they haven't been rendered recently.
 *
 * SceneJS currently caches assets with a max-time-inactive
 * eviction policy.
 */

var exampleScene = SceneJS.scene({
    canvasId: "theCanvas",

    proxy:"http://scenejs.org/cgi-bin/jsonp_wrapper.pl" }, // Pull our asset through this proxy

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({

                    clearColor : { r:0, g:0, b:0.0, a: 1 },
                    viewport:{ x : 1, y : 1, width: 600, height: 600}  ,
                    clear : { depth : true, color : true}
                },
                        SceneJS.lights({
                            sources: [
                                {
                                    pos: { x: 500.0, y: -160.0, z: 50.0 }
                                }
                            ]},
                                SceneJS.perspective({ fovy : 45.0, aspect : 1.0, near : 0.10, far : 300.0
                                },
                                        SceneJS.lookAt({
                                            eye : { x: -50.0, y: 80.0, z: -100},
                                            look : { x : 0.0, y : 30.0, z : 0 },
                                            up : { x: 0.0, y: 1.0, z: 0.0 }
                                        },
                                                SceneJS.lights({
                                                    sources: [

                                                        /* Global ambient colour is taken from the canvas clear colour.
                                                         */
                                                        {
                                                            type:                   "point",
                                                            diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                            specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                            pos:                    { x: 100.0, y: 0.0, z: -100.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        },
                                                        {
                                                            type:                   "point",
                                                            diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                            specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                            pos:                    { x: -100.0, y: 200.0, z: 100.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        }
                                                    ]},

                                                    /**
                                                     * Asset is configured with the URI at which its
                                                     * definition is stored. The SceneJS.scene node specifies the
                                                     * the proxy that will mediate the cross-domain request and wrap
                                                     *  the response in JSONP.
                                                     *
                                                     * Being native SceneJS, we can provide any special configurations
                                                     * for it by wrapping the asset node in a withData node. What we
                                                     * effectively then have are parameterisable remote assets,
                                                     * pretty powerful stuff.
                                                     *
                                                     * Take a look at the asset definition to see how it uses the scope
                                                     * data.
                                                     */
                                                        SceneJS.withData({
                                                            stepTexture: "redstone", // Try changing this to "marble"
                                                            stepWidth:7,
                                                            stepHeight:0.6,
                                                            stepDepth:3,
                                                            stepSpacing:1.5,
                                                            innerRadius:10,
                                                            numSteps:50,
                                                            stepAngle:20 },

                                                                SceneJS.load({
                                                                    uri:"http://scenejs.org/app/data/assets/catalogue/assets/" +
                                                                        "v0.7.0/staircase-example/staircase.js"
                                                                })
                                                                )
                                                        ) // lights
                                                ) // lookAt
                                        ) // perspective
                                ) // lights
                        ) // renderer
                ) // logging
        ); // scene

var pInterval;

/* Our periodic render function. This will stop the render interval when the count of
 * scene processes is zero.
 */
window.doit = function() {
    if (exampleScene.getNumProcesses() == 0) {

        /* No processes running in scene, so asset is loaded and we'll stop. The previous
         * render will have drawn the asset.
         */
        exampleScene.destroy();
        clearInterval(pInterval);
    } else {

        /* Otherwise, a process is still running on the scene, so the asset
         * must still be loading. Note that just as scene processes are created
         * during a scene render, they are also destroyed during another
         * subsequent render. Scene processes don't magically stop between renders,
         * you have to do a render to given them the opportunity to stop.
         */
        try {
            exampleScene.render();
        } catch (e) {
            clearInterval(pInterval);
            throw e;
        }
    }
}

/* This initial render will trigger the asset load, starting one scene process
 */
exampleScene.render();

/* Keep rendering until asset loaded, ie. no scene processes running
 */
pInterval = setInterval("window.doit()", 10);
  