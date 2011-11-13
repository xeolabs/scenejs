/*
 Custom vertex displacement shader example

 Read through the comments inline for more information.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 http://scenejs.wikispaces.com/shader

 */

SceneJS.createScene({

    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [

        /*----------------------------------------------------------------------
         * View and projection transforms
         *--------------------------------------------------------------------*/
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 15 },
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
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.6 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.7,
                                            shine:          10.0,

                                            nodes: [

                                                /*----------------------------------------------------------------------
                                                 * Our shader node defines a GLSL fragment containing a "time" uniform
                                                 * and a function that wobbles a 3D position as a function of that.
                                                 *
                                                 * Then then binds the function to the "modelPos" hook that SceneJS
                                                 * provides within its automatically-generated vertex shader.
                                                 *
                                                 * Within the "idleFunc" callback on our scene render loop (down below),
                                                 * we'll then update the "time" uniform to drive the wobbling.
                                                 *--------------------------------------------------------------------*/

                                                {
                                                    type: "shader",
                                                    id: "myShader",

                                                    shaders: [

                                                        /* Vertex shader
                                                         */
                                                        {
                                                            stage:  "vertex",

                                                            /* A GLSL snippet containing a custom function.
                                                             *
                                                             * The snippet can be given as either a string or an array
                                                             * of strings.
                                                             */
                                                            code: [
                                                                "uniform float time;",

                                                                "vec4 myModelPosFunc(vec4 pos){",
                                                                "   pos.x+=sin(pos.x*5.0+time+10.0)*0.1;",
                                                                "   pos.y+=sin(pos.y*5.0+time+10.0)*0.1;",
                                                                "   pos.z+=sin(pos.z*5.0+time+10.0)*0.1;",
                                                                "   return pos;",
                                                                "}"],

                                                            /* Bind our custom function to a SceneJS vertex shader hook
                                                             */
                                                            hooks: {
                                                                modelPos: "myModelPosFunc"
                                                            }
                                                        },

                                                        /* Fragment shader
                                                         */
                                                        {
                                                            stage:  "fragment",

                                                            code:  [
                                                                "uniform float time;  ",

                                                                "vec4 myPixelColorFunc(vec4 color){",
                                                                "   color.r=color.r+sin(time)*0.3;",
                                                                "   color.g=color.g+sin(time+0.3)*0.3;",
                                                                "   color.b=color.b+sin(time+0.6)*0.3;",
                                                                "   color.a=color.a+sin(time);",
                                                                "   return color;",
                                                                "}"],

                                                            /* Bind our custom function to a SceneJS vertex shader hook
                                                             */
                                                            hooks: {
                                                                pixelColor:     "myPixelColorFunc"
                                                            }
                                                        }
                                                    ],

                                                    /* Expose the time uniform as a parameter which we'll set
                                                     * on this shader node within the render loop.
                                                     *
                                                     * We can also set shader parameters using a child shaderParams
                                                     * node - see other custom shader examples for how.
                                                     *
                                                     */
                                                    params: {
                                                        time: 0.0
                                                    },

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
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var scene = SceneJS.scene("theScene");
var pitchRotate = scene.findNode("pitch");
var yawRotate = scene.findNode("yaw");
var shader = scene.findNode("myShader");

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

        yawRotate.set("angle", yaw);
        pitchRotate.set("angle", pitch);

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

var time = 0;

scene.start({
    idleFunc: function() {
        shader.set("params", {
            time: time 
        });
        time += 0.1;
    }
});

