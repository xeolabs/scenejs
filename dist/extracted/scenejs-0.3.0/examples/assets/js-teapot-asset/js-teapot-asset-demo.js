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
 * JSON, XML etc., and you can extend SceneJS with plugins to
 * parse various formats. Asset nodes are also able to make
 * cross-domain requests to get them.
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
 * The ultimate plan with assets is to somehow use them to pre-load
 * bits of scene just before they fall into view, then rely on
 * SceneJS to flush them when they haven't been rendered recently.
 *
 * SceneJS currently caches assets with a max-time-inactive
 * eviction policy.
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
                                                        eye : { x: 0.0, y: 15.0, z: -15},
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
                                                                proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"
                                                            })
                                                            ) // lookAt
                                                    ) // perspective
                                            ) // lights
                                    ) // shader
                            ) // viewport
                    ) // canvas
            ); // scene

    var nFrames = 0;

    var pInterval;

    function doit() {
        if (nFrames > 500) {
            exampleScene.destroy();
            clearInterval(pInterval);
        }

        nFrames++;
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

    /* Hack to get any scene definition exceptions up front.
     * Chrome seemed to absorb them in setInterval!
     */
    exampleScene.render();

    /* Continue animation
     */
    pInterval = setInterval("doit()", 10);
}