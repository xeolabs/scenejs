/**
 * Animated texture example
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 */

/* Node references - there are a few ways to inject data into a scene graph,
 * but we'll just update node setters for this example.
 */
var texture;
var rotateX;
var rotateY;

var exampleScene = SceneJS.scene({

    /* Bind to a WebGL canvas:
     */
    canvasId: "theCanvas" },

        SceneJS.lookAt({
            eye : { x: 0.0, y: 0.0, z: -10},
            look : { x : 0.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 }

        },
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    }
                },
                        SceneJS.light({
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        }),
                        SceneJS.light({
                            mode:                 "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        }),
                        SceneJS.light({
                            mode:                 "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        }),

                        SceneJS.material({
                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.9,
                            shine:          6.0
                        },

                            /** Textures images are loaded asynchronously and won't render
                             * immediately. On first traversal, they start loading their image,
                             * which they collect on a subsequent traversal.
                             */
                                texture = SceneJS.texture({

                                    /* A texture can have multiple layers, each applying an
                                     * image to a different material reflection component.
                                     * This layer applies the Zod image to the diffuse
                                     * component, with animated scaling.
                                     */
                                    layers: [
                                        {
                                            uri:"general-zod.jpg",                                            
                                            minFilter: "linear",
                                            magFilter: "linear",
                                            wrapS: "repeat",
                                            wrapT: "repeat",
                                            isDepth: false,
                                            depthMode:"luminance",
                                            depthCompareMode: "compareRToTexture",
                                            depthCompareFunc: "lequal",
                                            flipY: false,
                                            width: 1,
                                            height: 1,
                                            internalFormat:"lequal",
                                            sourceFormat:"alpha",
                                            sourceType: "unsignedByte",
                                            applyTo:"baseColor",

                                            /* Texture rotation angle in degrees
                                             */
                                            rotate: 0.0,

                                            /* Texture translation offset
                                             */
                                            translate : {
                                                x: 0,
                                                y: 0
                                            },

                                            /* Texture scale factors
                                             */
                                            scale : {
                                                x: 1.0,
                                                y: 1.0
                                            }
                                        }
                                    ]
                                },
                                        rotateX = SceneJS.rotate({
                                            angle: 0.0, x : 1.0
                                        },
                                                rotateY = SceneJS.rotate({
                                                    angle: 0.0, y : 1.0
                                                },
                                                        SceneJS.cube()
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var yaw = -30;
var pitch = -30;
var lastX;
var lastY;
var dragging = false;

var texAngle = 0.0;
var texScale = 1.0;

/* For texture animation
 */
var timeLast = (new Date()).getTime();

/* Always get canvas from scene - it will try to bind to a default canvas
 * when it can't find the one specified
 */
var canvas = document.getElementById(exampleScene.getCanvasId());

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

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
    rotateX.setAngle(pitch);
    rotateY.setAngle(yaw);

    texture.setLayer({
        index: 0,
        cfg: {
            scale: {
                x: texScale,
                y: texScale
            },
            rotate: texAngle
        }
    });

    exampleScene.render();

    texAngle += 0.4;
    texScale = (texScale + 0.01) % 10.0;

};

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.render()", 10);