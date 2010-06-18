/*
 Although SceneJS manages WebGL state settings for you automatically, the SceneJS.Renderer node
 allows you to set them explicitly for portions of your scene graph, perhaps to optimise its performance
 or do some special rendering effect.

 Use it to explicitly set things for subgraphs, such as the current viewport extents, scissoring,
 enable/disable shading, backface culling, and so on.

 Normally you wouldn't need to use renderer nodes, but you can insert them throughout your
 scene when you want more control over WebGL, perhaps to optimise your scene graph.

 They can also be nested, where the inner renderers will override the effects of the outer ones.

 This example is taken from one of the COLLADA test examples, but with a renderer node inserted
 with all its properties set to defaults. When you omit a renderer node, SceneJS will effectively
 provide this renderer by default.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv",

    /* URL of the proxy server which will mediate the
     * cross-domain load of our airplane COLLADA model
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

    /*==================================================================================
     * Our renderer node, with default values defined for all properties.
     * ================================================================================*/

        SceneJS.renderer({

            /*----------------------------------------
             Miscelleneous settings
             -----------------------------------------*/

            /* Specifies which buffers are cleared for each frame
             */
            clear: {
                depth : true,
                color : true,
                stencil: false
            },

            /* Specify clear values for the colour buffers
             */
            clearColor: {
                r: 0,
                g : 0,
                b : 0
            },

            /* Viewport defaults to canvas extents - but I'll set some
             * values to show what the properties are
             */
            viewport: {
                x : 1,
                y : 1,
                width: 600,
                height: 600
            },

            /* Set the width of rasterised lines
             */
            lineWidth: 1,


            /*----------------------------------------
             Blending
             -----------------------------------------*/

            /* Enable or disable blending
             */
            enableBlend: true,

            /* Set the blend color
             */
            blendColor: {
                r: 0.0,
                g: 0.0,
                b: 0.0,
                a: 1.0
            },

            /* Specify the equation used for both the RGB blend equation and the Alpha blend equation.
             * Accepted values are: func_add, func_subtract, func_reverse_subtract
             */
            blendEquation: "funcAdd",

            /* Set the RGB and alpha blend equations separately
             */
            blendEquationSeperate: {
                rgb: "funcAdd",
                alpha: "funcAdd"
            },

            /* Specify pixel arithmetic. Accepted values for sfactor and dfactor are:
             * zero, one, src_color, src_alpha, constant_color, one_minus_src_alpha,
             * one_minus_src_color, one_minus_constant_color, one_minus_constant_alpha,
             * dts_color, dst_alpha, one_minus_dst_alpha, one_minus_dst_color
             */
            blendFuc: {
                sfactor: "one",
                dfactor: 'zero'
            },

            /* Set the RGB and alpha blend functions separately
             */
            blendFuncSeperate: {
                srcRGB: "zero",
                dstRGB: "zero",
                srcAlpha: "zero",
                dstAlpha: "zero"
            },


            /*----------------------------------------
             Depth buffer
             -----------------------------------------*/

            /* Enable/disable depth testing
             */
            enableDepthTest:true,

            /* Specify the value used for depth buffer comparisons. Accepted values are: never, less, equal,
             * lequal, greater, notequal, gequal, always
             */
            depthFunc: "lequal",

            /* Enable/disable writing into the depth buffer
             */
            depthMask: true,

            /* Specify mapping of depth values from normalised device coordinates to window coordinates
             */
            depthRange: {
                zNear: 0,
                zFar: 1
            },

            /* Specify the clear value for the depth buffer
             */
            clearDepth: 1.0,


            /*----------------------------------------
             Scissoring
             -----------------------------------------*/

            /* Enable/disable scissoring
             */
            enableScissorTest: false,

            /* Define the scissor box
             */
            scissor: {
                x: 0,
                y: 0,
                width: 600,
                height: 600
            },


            /*----------------------------------------
             Culling
             -----------------------------------------*/

            /* Enable/disable face culling
             */
            enableCullFace: false,

            /* Specify facet culling mode, accepted values are: front, back, front_and_back
             */
            cullFace: "back",

            /* Specify front/back-facing mode. Accepted values are cw or ccw
             */
            frontFace: "ccw",

            /*----------------------------------------
             Textures
             -----------------------------------------*/

            /* Enable/disable texturing
             */
            enableTexture2D: true
        },

            /*==================================================================================
             * And just to show how you can nest them, here's an inner render that
             * redefines the viewport
             ==================================================================================*/

                SceneJS.renderer({
                    viewport: {
                        x : 1,
                        y : 1,
                        width: 600,
                        height: 600
                    }
                },


                    //----------------------------------------------------------
                    // The rest of the scene is just copied from the COLLADA
                    // Seymour Plane test example
                    //----------------------------------------------------------

                        SceneJS.lookAt({
                            eye : { x: -1.0, y: 0.0, z: 15 },
                            look : { x: -1.0, y: 0, z: 0 },
                            up : { y: 1.0 }
                        },

                            /* Perspective camera
                             */
                                SceneJS.camera({
                                    optics: {
                                        type: "perspective",
                                        fovy : 55.0,
                                        aspect : 1.0,
                                        near : 0.10,
                                        far : 5000.0  }
                                },

                                        SceneJS.lights({
                                            sources: [
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                    dir:                    { x: 1.0, y: -1.0, z: 1.0 },
                                                    diffuse:                true,
                                                    specular:               true
                                                },
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                    dir:                    { x: -1.0, y: -1.0, z: -3.0 },
                                                    diffuse:                true,
                                                    specular:               true
                                                }
                                            ]},
                                                SceneJS.rotate(function(data) {
                                                    return {
                                                        angle: data.get('yaw'), y : 1.0
                                                    };
                                                },
                                                        SceneJS.rotate(function(data) {
                                                            return {
                                                                angle: data.get('pitch'), x : 1.0
                                                            };
                                                        },
                                                                SceneJS.instance({
                                                                    uri: "http://www.scenejs.org/library/v0.7/assets/" +
                                                                         "examples/seymourplane_triangulate/" +
                                                                         "seymourplane_triangulate.dae"
                                                                }))
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

var yaw = -45;
var pitch = 25;
var lastX;
var lastY;
var dragging = false;

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
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

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * 0.5;
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

/* Render loop until error or reset
 * (which IDE does whenever you hit that run again button)
 */
var pInterval;

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);

