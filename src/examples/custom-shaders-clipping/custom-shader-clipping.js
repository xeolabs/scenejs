/*
 Custom fragment shader: a user-defined world-space clip plane

 More info on custom shaders:

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
                                            baseColor:      { r: 0.3, g: 0.3, b: 1.0 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.7,
                                            shine:          10.0,

                                            nodes: [

                                                /*----------------------------------------------------------------------
                                                 * Custom shader which creates a user-defined world-space clipping plane
                                                 *--------------------------------------------------------------------*/

                                                {
                                                    type: "shader",
                                                    id: "myShader",

                                                    shaders: [

                                                        /* Fragment shader
                                                         */
                                                        {
                                                            stage:  "fragment",

                                                            code:  [

                                                                "uniform bool clipEnabled;",
                                                                "uniform bool clipInside;",
                                                                "uniform vec4 clipNormalAndDist;",

                                                                "vec4 myWorldPosFunc(vec4 pos){",
                                                                "   if (clipEnabled) {",
                                                                "        float dist = dot(pos.xyz, clipNormalAndDist.xyz) - clipNormalAndDist.w;",
                                                                "        if (clipInside) {",
                                                                "            if (dist < 0.0) { discard; }",
                                                                "        } else {",
                                                                "            if (dist > 0.0) { discard; }",
                                                                "        }",
                                                                "   }",
                                                                "   return pos;",
                                                                "}"],

                                                            /* Bind our custom function to a SceneJS fragment shader hook
                                                             */
                                                            hooks: {
                                                                worldPos: "myWorldPosFunc"
                                                            }
                                                        }
                                                    ],

                                                    /* Default shader params - can also be overridden with a
                                                     * shaderParams node - see other examples
                                                     */
                                                    params: {
                                                        clipEnabled: true,
                                                        clipInside: false,
                                                        clipNormalAndDist: [0.8, 0.0, 0.1, 0.0]
                                                    },

                                                    nodes: [

                                                        /*----------------------------------------------------------------------
                                                         * Teapot which will be clipped
                                                         *--------------------------------------------------------------------*/
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
var pitchRotate =  scene.findNode("pitch");
var yawRotate = scene.findNode("yaw");

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

        yawRotate.set("angle", yaw);
        pitchRotate.set("angle", pitch);

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

scene.start();

