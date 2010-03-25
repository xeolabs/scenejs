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
var exampleScene = SceneJS.scene({ canvasId: "theCanvas" },

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    clearColor: { r:0.5, g:0.5, b:0.5 },
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
                                                    ambient:  { r:0.5, g:0.5, b:0.5 },
                                                    diffuse:  { r:0.6, g:0.6, b:0.6 }
                                                    //                                                    ,
                                                    //                                                    emission:  { r:.5, g:0.3, b:0.3 }
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
                                                            layers: [
                                                                {
                                                                    uri:"general-zod.jpg",
                                                                    minFilter: "linear",
                                                                    magFilter: "linear",
                                                                    wrapS: "clampToEdge",
                                                                    wrapT: "clampToEdge",
                                                                    isDepth: false,
                                                                    depthMode:"luminance",
                                                                    depthCompareMode: "compareRToTexture",
                                                                    depthCompareFunc: "lequal",
                                                                    flipY: true,
                                                                    width: 1,
                                                                    height: 1,
                                                                    internalFormat:"lequal",
                                                                    sourceFormat:"alpha",
                                                                    sourceType: "unsignedByte",
                                                                    applyTo:"diffuse"
                                                                }
                                                                //                                                                ,
                                                                //                                                                {
                                                                //                                                                    uri:"earth.jpg",
                                                                //                                                                    minFilter: "linear",
                                                                //                                                                    magFilter: "linear",
                                                                //                                                                    wrapS: "clampToEdge",
                                                                //                                                                    wrapT: "clampToEdge",
                                                                //                                                                    isDepth: false,
                                                                //                                                                    depthMode:"luminance",
                                                                //                                                                    depthCompareMode: "compareRToTexture",
                                                                //                                                                    depthCompareFunc: "lequal",
                                                                //                                                                    flipY: false,
                                                                //                                                                    width: 1,
                                                                //                                                                    height: 1,
                                                                //                                                                    internalFormat:"lequal",
                                                                //                                                                    sourceFormat:"alpha",
                                                                //                                                                    sourceType: "unsignedByte",
                                                                //                                                                    applyTo:"ambient"
                                                                //                                                                }
                                                            ]
                                                        },
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
                                                                                SceneJS.objects.cube()
                                                                                )
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

var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;


var canvas = document.getElementById("theCanvas");

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
        exampleScene.render({yaw: yaw, pitch: pitch});
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


window.render = function() {
    /* Throw the switch, Igor!
     * We render the scene, injecting the initial angles for the rotate nodes.
     */
    exampleScene.render({yaw: yaw, pitch: pitch});
};

var pInterval = setInterval("window.render()", 10);
