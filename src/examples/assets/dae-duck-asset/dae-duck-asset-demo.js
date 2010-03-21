/**
 * SceneJS Example - Importing a simple COLLADA asset into a scene
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * February 2010
 *
 * "Assets" are remotely-stored scene fragments which may be
 * dynamically imported into your scene using asset nodes.
 *
 * They can potentially be stored in any format, such as COLLADA,
 * JSON etc., and you can extend SceneJS with plugins to parse
 * various formats. Asset nodes are able to make cross-domain
 * requests to get them.
 *
 * This example imports a COLLADA asset from the asset repository
 * at SceneJS.com.
 *
 * When the scene is first rendered, the asset node will make a
 * JSONP request of the repository, which will respond with the
 * asset data. The asset node will then convert the data into a
 * subtree of scene graph content.
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
 * SceneJS currently caches assets with a max-time-inactive
 * eviction policy.
 */

var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    clearColor : { r:0, g:0, b:0.0, a: 1 },
                    viewport:{ x : 1, y : 1, width: 600, height: 600}  ,
                    clear : { depth : true, color : true},
                    enableTexture2D: true
                },
                        SceneJS.lights({
                            lights: [
                                {
                                    pos: { x: -600.0, y: 40.0, z: 50.0 }
                                }
                            ]},
                                SceneJS.perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 5000.0
                                },
                                        SceneJS.lookAt({
                                            eye : { x: 0.0, y: 5.0, z: -50},
                                            look : { x : 0.0, y : 0.0, z : 0 },
                                            up : { x: 0.0, y: 1.0, z: 0.0 }

                                        },
                                                SceneJS.rotate(function(data) {
                                                    return {  angle: data.get('angle'), y : 1.0};
                                                },

                                                    /**
                                                     * COLLADA importer requires us to feed two bits of data down to it:
                                                     * the URL of the COLLADA file and the name of the target node it
                                                     * is to parse within the file:
                                                     */
                                                        SceneJS.withData({

                                                            uri: "http://www.scenejs.org/app/data/assets/catalogue/assets/" +
                                                                 "v0.7.0/seymourplane_triangulate/seymourplane_triangulate.dae",

                                                            node: "plane"
                                                        },
                                                                /* The COLLADA importation
                                                                 */
                                                                SceneJS.import({
                                                                    uri: "http://www.scenejs.org/app/data/assets/" +
                                                                         "catalogue/assets/v0.7.0/collada-import/colladaImport.js"
                                                                }))
                                                        )
                                                ) // lookAt
                                        ) // perspective
                                ) // lights
                        ) // renderer
                ) // logging
        ); // scene


var pInterval;
var angle = 0;

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
    if (exampleScene.getNumProcesses() == 0 && angle > 72000.0) {

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

        exampleScene.render({angle:angle});
        angle += 1;
    }
}

/* This initial render will trigger the asset load, starting one scene process
 */

exampleScene.render({angle:angle});


/* Keep rendering until asset loaded, ie. no scene processes running
 */
pInterval = setInterval("doit()", 10);