/*

 */

SceneJS.createScene({

    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",

    nodes: [
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
                                            type: "material",
                                            emit: 0,
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.6 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.7,
                                            shine:          10.0,
                                            alpha: 0.9,

                                            flags: {
                                                transparent: true
                                            },

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
                                                        {
                                                            stage:  "fragment",

                                                            code:  [],

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

                                                             code:  "uniform float time;  float time2 = time;\n\
                                                                    \n\
                                                                    float myMaterialAlphaFunc(float alpha){\n\
                                                                        return alpha+sin(time2);\n\
                                                                    }\n\
                                                                    void myWorldPosFunc(vec4 worldVertex){\n\
                                                                        if (worldVertex.x > 0.0) time2 = time2 * 3.0;\n\
                                                                    }\n\
                                                                    vec4 myPixelColorFunc(vec4 color){\n\
                                                                        color.r=color.r+sin(time2)*0.3;\n\
                                                                        color.g=color.g+sin(time2+0.3)*0.3;\n\
                                                                        color.b=color.b+sin(time2+0.6)*0.3;\n\
                                                                        color.a=color.a+sin(time2);\n\
                                                                        return color;\n\
                                                                    }\n\
                                                                    void myEyeVecFunc(vec3 eyeVec){\n\
                                                                    }\n\
                                                                    void myNormalFunc(vec3 normal){\n\
                                                                    }\n",

                                                            /* Bind our custom function to a SceneJS vertex shader hook
                                                             */
                                                            hooks: {
                                                                worldPos:       "myWorldPosFunc",
                                                                eyeVec:         "myEyeVecFunc",
                                                                normal:         "normalFunc",
                                                                materialAlpha:  "myMaterialAlphaFunc",
                                                                pixelColor:     "myPixelColorFunc"
                                                            }
                                                        }
                                                    ],

                                                    /* Optional initial values for uniforms within our GLSL:
                                                     */
                                                    vars: {
                                                        time: 0.5
                                                    },

                                                    /* This teapot will enjoy our custom shader injection:
                                                     */
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

var time = 0;

SceneJS.scene("theScene").start({
    idleFunc: function() {
        this.findNode("myShader").set("vars", {
            time: time ,
            time2: time
        });
        time += 0.1;
    }
});

