/**
 * SceneJS Example - Importing a remote SceneJS teapot asset into a scene
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * "Assets" are remotely-stored scene fragments which may be
 * dynamically imported into your scene using asset nodes.
 *
 * They can potentially be stored in any format, such as COLLADA,
 * JSON etc., and you can extend SceneJS with plugins to parse
 * various formats. Asset nodes are able to make cross-domain
 * requests to get them.
 *
 * This example imports an orange teapot from the asset repository
 * at SceneJS.com.
 *
 * When the scene is first rendered, the asset node will make a
 * JSONP request of the repository, which will respond with the
 * asset data, which is in this case JSON. The asset node will
 * then convert the data into a subtree of scene graph content.
 *
 * The asset node's request will always be asynchronous. This means
 * that when SceneJS renders the asset node, it's not going to wait
 * for the asset to load before continuing to render the rest of the
 * scene. SceneJS will just trigger the asset's request and move on.
 * So if you're rendering one frame, you wont see the asset in the
 * image. But if you keep rendering the scene for a few frames like
 * in this example, as you would when animating, the asset will
 * magically appear once loaded.
 *
 * SceneJS tracks these loads and tracks each one as a process that
 * is currently within on the scene. So you can tell if all assets
 * have loaded when the number of scene processes is zero.
 *
 * The ultimate plan with assets is to somehow use them to pre-load
 * bits of scene just before they fall into view, then rely on
 * SceneJS to flush them when they haven't been rendered recently.
 *
 * SceneJS currently caches assets with a max-time-inactive
 * eviction policy.
 */
with (SceneJs) {
    var exampleScene = scene({}, // node always has a config object

            logger({
                error: function(msg) {
                    alert(msg);
                },
                warn: function(msg) {
                    alert(msg);
                }
            }),

            renderer({
                canvasId: 'theCanvas',
                clearColor : { r:0, g:0, b:0.0, a: 1 },
                viewport:{ x : 1, y : 1, width: 600, height: 600}  ,
                clear : { depth : true, color : true}
            },

                    shader({ type: 'simple-shader' },

                            lights({
                                lights: [
                                    {
                                        pos: { x: -600.0, y: 40.0, z: 50.0 }
                                    }
                                ]},
                                    perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                    },
                                            lookat({
                                                eye : { x: 0.0, y: 20.0, z: -20},
                                                look : { x : 0.0, y : 0.0, z : 0 },
                                                up : { x: 0.0, y: 1.0, z: 0.0 }

                                            },

                                                /** Asset is configured with the URI at which its
                                                 * definition is stored, and a proxy that will mediate
                                                 * the cross-domain request and wrap the response in JSONP.
                                                 *
                                                 * This asset is in native SceneJS JavaScript, and the proxy
                                                 * is at SceneJS.com.
                                                 */
                                                    asset({
                                                        uri:"http://www.scenejs.com/app/data/assets/catalogue/assets/orangeteapot.js",
                                                        proxy:"http://scenejs.com/cgi-bin/jsonp_proxy.pl"
                                                    })
                                                    ) // lookat
                                            ) // perspective
                                    ) // lights
                            ) // shader                             
                    ) // renderer
            ); // scene


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
                handleError(e);
            }
        }
    }

    /* This initial render will trigger the asset load, starting one scene process
     */
    try {
        exampleScene.render();
    } catch (e) {
        handleError(e);
    }

    /* Keep rendering until asset loaded, ie. no scene processes running
     */
    pInterval = setInterval("doit()", 10);
}