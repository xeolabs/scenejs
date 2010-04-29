/**
 * Animated texture example
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 * This example demonstrates a single-layered texture that uses a dynamic
 * config function to animate its scale. The animation is driven by system time,
 * which the render loop injects into the scene data context on each traversal.
 *
 * Also demonstrates mouse interaction, where handlers bound to the canvas inject
 * yaw and pitch angles into the scene through the data context, to be used by
 * modelling rotations.
 */

SceneJS.onEvent("error", function(e) {
    alert(e.exception.message ? e.exception.message : e.exception);
});
var exampleScene = SceneJS.scene({ canvasId: "theCanvas" },

        SceneJS.perspective({
            fovy : 25.0,
            aspect : 1.0,
            near : 0.10,
            far : 300.0
        },
                SceneJS.lookAt({
                    eye : { x: 0.0, y: 0.0, z: -10},
                    look : { x : 0.0, y : 0.0, z : 0 },
                    up : { x: 0.0, y: 1.0, z: 0.0 }

                },
                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                }          ,
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
                                        SceneJS.texture({

                                            /* A texture can have multiple layers, each applying an
                                             * image to a different material reflection component.
                                             * This layer applies the Zod image to the diffuse
                                             * component, with animated scaling.
                                             */
                                            layers: [
                                                {
                                                    uri:"http://scenejs.org/library/textures/misc/general-zod.jpg",
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

                                                    /* The rotate, translate and scale properties
                                                     * can be functions that pull properties (if required)
                                                     * from the current data context
                                                     */
                                                    rotate: (function() {
                                                        var factor = 0;
                                                        return function(data) {
                                                            if (factor > 90.0) {
                                                                factor = 0;
                                                            }
                                                            factor += data.get("time") * 0.01;
                                                            return {
                                                                z: factor
                                                            };
                                                        };
                                                    })(),

                                                    translate : {
                                                        x: 0,
                                                        y: 0,
                                                        z: 0
                                                    },

                                                    /* Animate the scaling  with a function that is
                                                     * called on each visit - creates that strange
                                                     * multi-Zod effect. This function is a higher-order
                                                     * one that tracks the factor in a closure.
                                                     */
                                                    scale : (function() {
                                                        var factor = 0;
                                                        return function(data) {
                                                            if (factor > 10.0) {
                                                                factor = 0;
                                                            }
                                                            factor += data.get("time") * 0.001;
                                                            return {
                                                                x: factor,
                                                                y: factor
                                                            };
                                                        };
                                                    })()
                                                }
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

/* For texture animation
 */
var timeLast = (new Date()).getTime();

/* Always get canvas from scene - it will try to bind to a default canvas
 * when it can't find the one specified
 */
var canvas = document.getElementById(exampleScene.getCanvasId());;

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
    var timeNow = (new Date()).getTime();
         // try {
    exampleScene.render({
        yaw: yaw,
        pitch: pitch,
        time : timeNow - timeLast
    });
          //} catch (e) { alert (e.exception || e.message || e); }

    timeLast = timeNow;
};

var pInterval = setInterval("window.render()", 10);
