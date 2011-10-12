/*
 Custom fragment color transform shader example

 Demonstrates the parameterised reuse of a custom shader via a shared node core.

 Read through the comments inline for more information.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */

SceneJS.createScene({

    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [

        /*----------------------------------------------------------------------
         * Library section containing a shader node which transforms outgoing
         * fragment colour.
         *
         * The shader binds a custom functions into the SceneJS fragment shader
         * to apply saturation, scale and addition operations to the outgoing
         * fragment colour.
         *
         * The fog effect is configured by a set of uniforms, which the shader
         * node exposes as parameters with default values.
         *
         * The shader is "instantiated" later in the scene by another shader
         * which shares its node core.
         *--------------------------------------------------------------------*/

        {
            type: "library",
            nodes: [
                {
                    type: "shader",
                    coreId: "colorTransShader",

                    shaders: [

                        /*----------------------------------------------------------------------
                         * Custom colour transform fragment shader
                         *--------------------------------------------------------------------*/

                        {
                            stage:  "fragment",

                            code:  [

                                /* Parameter uniforms
                                 */
                                "uniform bool   colorTransEnabled;",
                                "uniform float  colorTransSaturation;",
                                "uniform vec4   colorTransScale;",
                                "uniform vec4   colorTransAdd;",

                                /* Modifies fragment colour
                                 */
                                "vec4 colorTransPixelColorFunc(vec4 color) {",
                                "   if (colorTransEnabled) {",
                                "        if (colorTransSaturation < 0.0) {",
                                "            float intensity = 0.3 * color.r + 0.59 * color.g + 0.11 * color.b;",
                                "            color = vec4((intensity * -colorTransSaturation) + color.rgb * (1.0 + colorTransSaturation), 1.0);",
                                "        }",
                                "        color = (color * colorTransScale) + colorTransAdd;",
                                "   }",
                                "   return color;",
                                "}"
                            ],

                            /* Bind our functions to hooks
                             */
                            hooks: {
                                pixelColor: "colorTransPixelColorFunc"
                            }
                        }
                    ],

                    /* Declare parameters and set default values
                     */
                    params: {
                        colorTransEnabled: false,               // Shader enabled/disabled
                        colorTransSaturation: 1.0,              // Saturation in range of [0.0..1.0]
                        colorTransScale: [1.0, 1.0, 1.0, 1.0],  // Scale factor [0.0..1.0] for each colour component
                        colorTransAdd: [0.0, 0.0, 0.0, 0.0]     // Addition offset [-1.0..1.0] for each colour component
                    }
                }
            ]
        },

        /*----------------------------------------------------------------------
         * View and projection transforms
         *--------------------------------------------------------------------*/

        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 25 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [

                        /*----------------------------------------------------------------------
                         * Lighting
                         *--------------------------------------------------------------------*/

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 0.8 },
                            diffuse:                true,
                            specular:               false,
                            dir:                    { x: 0.0, y: -0.5, z: -1.0 }
                        },


                        /*----------------------------------------------------------------------
                         * Modelling transforms
                         *--------------------------------------------------------------------*/

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

                                        /*----------------------------------------------------------------------
                                         * Material properties
                                         *--------------------------------------------------------------------*/

                                        {
                                            type: "material",
                                            emit: 0,
                                            baseColor:      { r: 0.5, g: 0.5, b: 0.5 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.7,
                                            shine:          10.0,
                                            alpha:          0.9,

                                            nodes: [

                                                /*----------------------------------------------------------------------
                                                 * Three teapots share the shader by instancing its node core, wrapping
                                                 * each teapot in a shaderParams node to set different parameters for
                                                 * the uniforms that are exposed by the shader as parameters.
                                                 *--------------------------------------------------------------------*/

                                                // Instance the custom shader
                                                {
                                                    type: "shader",
                                                    coreId: "colorTransShader",

                                                    nodes: [

                                                        // Set the shader's params
                                                        {
                                                            type: "shaderParams",

                                                            params: {
                                                                colorTransEnabled: true,                // Shader enabled
                                                                colorTransSaturation: 1.0,
                                                                colorTransScale: [0.0, 1.0, 1.0, 1.0],  // Cyan
                                                                colorTransAdd: [0.0, 0.0, 0.0, 0.0]
                                                            },

                                                            nodes: [
                                                                {
                                                                    type: "translate",
                                                                    x: -7.0,

                                                                    nodes: [
                                                                        {
                                                                            type : "teapot"
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                /*----------------------------------------------------------------------
                                                 * Second teapot, wrapped in an instance of the shader, which is
                                                 * parameterised to make the teapot green
                                                 *--------------------------------------------------------------------*/

                                                // Instance the custom shader
                                                {
                                                    type: "shader",
                                                    coreId: "colorTransShader",

                                                    nodes: [

                                                        // Set the shader's params
                                                        {
                                                            type: "shaderParams",

                                                            params: {
                                                                colorTransEnabled: true,               // Shader enabled
                                                                colorTransSaturation: 1.0,
                                                                colorTransScale: [1.0, 0.0, 1.0, 1.0],  // Purple
                                                                colorTransAdd: [0.0, 0.0, 0.0, 0.0]
                                                            },

                                                            nodes: [
                                                                {
                                                                    type: "translate",
                                                                    x: 0.0,

                                                                    nodes: [
                                                                        {
                                                                            type : "teapot"
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                /*----------------------------------------------------------------------
                                                 * First teapot, wrapped in an instance of the shader, which is
                                                 * parameterised to make the teapot blue
                                                 *--------------------------------------------------------------------*/

                                                // Instance the custom shader
                                                {
                                                    type: "shader",
                                                    coreId: "colorTransShader",

                                                    nodes: [

                                                        // Set the shader's params
                                                        {
                                                            type: "shaderParams",

                                                            params: {
                                                                colorTransEnabled: true,                // Shader enabled
                                                                colorTransSaturation: 1.0,
                                                                colorTransScale: [1.0, 1.0, 0.0, 1.0],  // Yellow
                                                                colorTransAdd: [0.0, 0.0, 0.0, 0.0]
                                                            },

                                                            nodes: [
                                                                {
                                                                    type: "translate",
                                                                    x: 7.0,

                                                                    nodes: [
                                                                        {
                                                                            type : "teapot"
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
        }
    ]
});


SceneJS.setDebugConfigs({
    shading : {
        logScripts : false,
        validate: true
    }
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

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
        pitch += (event.clientY - lastY) * 0.5;

        var scene = SceneJS.scene("theScene");

        scene.findNode("yaw").set("angle", yaw);
        scene.findNode("pitch").set("angle", pitch);

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

SceneJS.scene("theScene").start();

