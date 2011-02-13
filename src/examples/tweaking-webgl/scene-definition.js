/*
 Although SceneJS manages WebGL state settings for you automatically, the SceneJS.Renderer node
 allows you to set them explicitly for portions of your scene graph, perhaps to optimise its performance
 or do some special rendering effect.

 Use it to explicitly set things for subgraphs, such as the current viewport extents, scissoring,
 enable/disable shading, backface culling, and so on.

 Normally you wouldn't need to use renderer nodes, but you can insert them throughout your
 scene when you want more control over WebGL, perhaps to optimise your scene graph.

 They can also be nested, where the inner renderers will override the effects of the outer ones.

 This example is taken from one of the other texture test examples, but with a renderer node inserted
 with all its properties set to defaults. When you omit a renderer node, SceneJS will effectively
 provide this renderer by default.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */


/* Node references - there are a few ways to inject data into a scene graph,
 * but we'll just update node setters for this example.
 */
SceneJS.createNode({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas" ,

    nodes: [

        /*==================================================================================
         * Our renderer node, with default values defined for all properties.
         * ================================================================================*/

        {
            type: "renderer",

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
                x : 0,
                y : 0,
                width: 1030,
                height: 700
            },

            /* Set the width of rasterised lines
             */
            lineWidth: 1,


            /*----------------------------------------
             Blending
             -----------------------------------------*/

            /* Enable or disable blending
             */
            enableBlend: false,

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
            blendFunc: {
                sfactor: "one",
                dfactor: 'one'
            },

            /* Set the RGB and alpha blend functions separately
             */
            blendFuncSeperate: {
                srcRGB: "one",
                dstRGB: "one",
                srcAlpha: "one",
                dstAlpha: "one"
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
                width: 1000,
                height:700
            },


            /*----------------------------------------
             Culling
             -----------------------------------------*/

            /* Enable/disable face culling
             */
            enableCullFace: true,

            /* Specify facet culling mode, accepted values are: front, back, front_and_back
             */
            cullFace: "back",

            /* Specify front/back-facing mode. Accepted values are cw or ccw
             */
            frontFace: "cw",

            nodes: [

                //----------------------------------------------------------
                // The rest of the scene is just copied from the COLLADA
                // Seymour Plane test example
                //----------------------------------------------------------

                {
                    type: "lookAt",
                    eye : { x: 0.0, y: 0.0, z: 5 },
                    look : { x: 0.0, y: 0, z: 0 },
                    up : { y: 1.0 },

                    nodes: [


                        /* Perspective camera
                         */
                        {
                            type: "camera",

                            optics: {
                                type: "perspective",
                                fovy : 55.0,
                                aspect : 1.47,
                                near : 0.10,
                                far : 5000.0
                            },
                            nodes: [
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 0.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 0.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: 1.0 }
                                },
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 0.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: 1.0 }
                                },


                                /** Textures images are loaded asynchronously and won't render
                                 * immediately. On first traversal, they start loading their image,
                                 * which they collect on a subsequent traversal.
                                 */
                                {
                                    type: "texture",

                                    /* A texture can have multiple layers, each applying an
                                     * image to a different material reflection component.
                                     * This layer applies the Zod image to the diffuse
                                     * component, with animated scaling.
                                     */
                                    layers: [
                                        {
                                            uri:"images/general-zod.jpg",
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
                                            blendMode: "multiply",

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
                                    ],

                                    nodes: [

                                        {
                                            type: "material",

                                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0,

                                            nodes: [
                                                {
                                                    type: "rotate",
                                                    id: "pitch",
                                                    angle: 0.0,
                                                    x : 1.0,

                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            id: "yaw",

                                                            angle: 0.0,
                                                            y : 1.0,

                                                            nodes: [
                                                                {
                                                                    type: "cube"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});


/*----------------------------------------------------------------------
 * Enable scene graph compilation (disabled by default in V0.8).
 *
 * This feature is alpha status and may break some scene graphs.
 *
 * It can speed your scene graph up by an order of magnitude - we'll
 * do it here just to show how it's done.
 *
 * http://scenejs.wikispaces.com/V0.8+Branch
 *---------------------------------------------------------------------*/

SceneJS.setDebugConfigs({
    compilation : {
        enabled : true
    }
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var yaw = -45;
var pitch = 25;
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
        pitch += (event.clientY - lastY) * 0.5;
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

window.render = function() {

    SceneJS.withNode("pitch").set({ angle: pitch });
    SceneJS.withNode("yaw").set({ angle: yaw });
    SceneJS.withNode("theScene").render();
};

/* Render loop until error or reset
 * (which IDE does whenever you hit that run again button)
 */
var pInterval;

SceneJS.bind("error", function(event) {
    alert(event.exception.message);
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = window.setInterval("window.render()", 10);

