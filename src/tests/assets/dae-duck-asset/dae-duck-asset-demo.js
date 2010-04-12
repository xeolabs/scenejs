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

    /* Proxy that will mediate cross-domain asset loads.
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    clearColor : { r:0, g:0, b:0.0 },
                    viewport:{ x : 1, y : 1, width: 800, height: 800}  ,
                    clear : { depth : true, color : true},
                    enableTexture2D: true
                },

                        SceneJS.perspective({ fovy : 45.0, aspect : 1.0, near : 0.10, far : 1000.0
                        },
                                SceneJS.lookAt({
                                    eye : { x: 0.0, y: 0, z: -.6},
                                    look : { x : 0.0, y : 0.0, z : 0 },
                                    up : { x: .0, y: 1.0, z: 0.0 }

                                },
                                        SceneJS.lights({
                                            sources: [
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: .8, g: 0.8, b: 0.8 },
                                                    diffuse:                true,
                                                    specular:               false,
                                                    pos:                    { x: 100.0, y: 4.0, z: -100.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                }
                                                ,
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                    diffuse:                true,
                                                    specular:               true,
                                                    pos:                    { x: 100.0, y: -100.0, z: -100.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                },
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                    diffuse:                true,
                                                    specular:               true,
                                                    pos:                    { x: -1000.0, y: -1000.0, z: 0.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                }
                                            ]},
                                                SceneJS.rotate(function(data) {
                                                    return {
                                                        angle: data.get('pitch'), x : 1.0
                                                    };
                                                },
                                                        SceneJS.rotate(function(data) {
                                                            return {
                                                                angle: data.get('yaw'), y : 1.0
                                                            };
                                                        },
                                                                   SceneJS.rotate({
                                                                    angle: 90, x : 1.0

                                                                },
                                                                SceneJS.rotate({
                                                                    angle: 180, y : 1.0

                                                                },
                                                                          SceneJS.scale({
                                                                    x: 0.005, y: 0.005, z: 0.005

                                                                },
                                                                                  SceneJS.translate({x:10 },
                                                                        SceneJS.material({
                                                                            baseColor:      { r: 1, g: 1, b: 1 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            emit:1.0,
                                                                            specular:       0.9,
                                                                            shine:          6.0
                                                                        },
                                                                            /** Load the asset
                                                                             */
                                                                                SceneJS.loadCollada({
                                                                                    uri: "http://www.scenejs.org/library/v0.7/assets/examples/seymourplane_triangulate/seymourplane_triangulate.dae",
                                                                                    //uri: "http://www.scenejs.org/library/v0.7/assets/examples/my-space/models/mySpace.dae",
                                                                                    // uri: "http://www.scenejs.org/library/v0.7/assets/examples/collada-duck/duck.dae"
                                                                                    // uri: "http://www.scenejs.org/library/v0.7/assets/examples/optick-house/optick-house.dae"

                                                                                    node: "plane"
                                                                                    //node: "Model"
                                                                                })
                                                                                ))))))))
                                        )
                                )
                        )
                )
        );

/*----------------------------------------------------------------------
 * Scene rendering loop and process query stuff follows
 *---------------------------------------------------------------------*/


var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;


/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = exampleScene.getCanvas();

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


window.render = function() {
    exampleScene.render({yaw: yaw, pitch: pitch});

};

var pInterval = setInterval("window.render()", 10);