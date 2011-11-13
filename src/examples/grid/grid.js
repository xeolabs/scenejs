/*


 */

function createLibrary() {
    return {
        type: "library",
        nodes: [
            {
                type: "geometry",
                coreId: "building-geometry",

                primitive: "triangles",
                positions : [
                    5, 5, 5,-5, 5, 5,-5,-5, 5,5, -5, 5, 5, 5, 5, 5,-5, 5, 5,-5,-5, 5, 5,-5,
                    5, 5, 5, 5, 5,-5,-5, 5,-5,-5, 5, 5, -5, 5, 5,-5, 5,-5,-5,-5,-5,-5,-5, 5,
                    -5,-5,-5, 5,-5,-5, 5,-5, 5,-5,-5, 5, 5,-5,-5,-5,-5,-5,-5, 5,-5, 5, 5,-5
                ],
                normals : [
                    0, 0, 1, 0, 0, 1,  0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0,  1, 0, 0, 1, 0, 0,
                    0, 1, 0, 0, 1, 0,  0, 1, 0, 0, 1, 0,-1, 0, 0, -1, 0, 0, -1, 0, 0,-1, 0, 0,
                    0,-1, 0, 0,-1, 0,0,-1, 0, 0,-1, 0, 0, 0,-1, 0, 0,-1, 0, 0,-1,0, 0,-1
                ],
                uv : [
                    5, 5, 0, 5, 0, 0, 5, 0, 0, 5, 0, 0, 5, 0,5, 5, 5, 0, 5, 5,0, 5,0, 0,
                    5, 5,0, 5, 0, 0,5, 0, 0, 0,5, 0, 5, 5, 0, 5, 0, 0,5, 0, 5, 5, 0, 5
                ],
                indices : [
                    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9,10, 8,10,11,
                    12,13,14,12,14,15,16,17,18, 16,18,19, 20,21,22, 20,22,23
                ]
            }
        ]
    };
}
function createCity() {

    var nodes = [];
    var width = 300.0;
    var blockWidth = 20;
    var height;
    var time = 0.0;
    for (var x = -width; x < width; x += blockWidth) {
        for (var z = -width; z < width; z += blockWidth) {
            nodes.push({
                type: "translate",
                x: x,
                y: 0,
                z: z,
                nodes: [
                    {
                        type: "scale",
                        x: 2.0,
                        y: 6.0,
                        z: 2.0,
                        nodes: [
                            {
                                type: "name",
                                name: "cube" + x + "," + z,

                                nodes: [
                                    {
                                        type: "shaderParams",
                                        params: {
                                            time2: ++time
                                        },

                                        nodes: [

                                            {
                                                type: "material",
                                                coreId: "material",
                                                emit: 0,
                                                baseColor:      { r: 0.5, g: 0.5, b: 0.6 },
                                                specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                specular:       1.0,
                                                shine:          70.0,

                                                nodes: [

                                                    {
                                                        type: "geometry",
                                                        coreId: "building-geometry"
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

        }
    }
    return {
        type: "node",
        nodes: nodes
    };
}


SceneJS.createScene({

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    nodes: [

        createLibrary(),

        /* Viewing transform
         */
        {
            type: "lookAt",
            eye : { x: 0.0, y: 50.0, z: 1600 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [

                /* Projection
                 */
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 3000.0
                    },

                    nodes: [

                        /* Point lights
                         */
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

                        /* Modelling transforms - note the IDs, "pitch" and "yaw"
                         */
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

                                        /* Ambient, diffuse and specular surface properties
                                         */
                                        {
                                            type: "material",
                                            emit: 0,
                                            baseColor:      { r: 0.5, g: 0.5, b: 0.6 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       1.0,
                                            shine:          70.0,

                                            nodes: [
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
                                                                "uniform float time;  ",
                                                                "uniform float time2;  ",

                                                                "vec4 myModelPosFunc(vec4 pos){",
                                                                "   float t = time + time2;",
                                                                //   "   pos.x+=sin(t *0.01) * 30.0;",
                                                                "   pos.y+=sin(t * 0.1) * 5.0;",
                                                                //  "   pos.z+=sin(t *0.01) * 30.0;",
                                                                "   return pos;",
                                                                "}"],

                                                            /* Bind our custom function to a SceneJS vertex shader hook
                                                             */
                                                            hooks: {
                                                                // modelPos: "myModelPosFunc"
                                                            }
                                                        },

                                                        /* Fragment shader
                                                         */
                                                        {
                                                            stage:  "fragment",

                                                            code:  [
                                                                "uniform float time;  ",
                                                                "uniform float time2;  ",

                                                                "vec4 myPixelColorFunc(vec4 color){",
                                                                "   float t = time + time2;",
                                                                "   color.r=color.r+sin(t)*0.3;",
                                                                "   color.g=color.g+sin(t+0.3)*0.3;",
                                                                "   color.b=color.b+sin(t+0.6)*0.3;",
                                                                "   color.a=color.a+sin(t);",
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
                                                        time: 0.0,
                                                        time2: 0.0
                                                    },

                                                    nodes: [

                                                        createCity()
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


/* Get handles to some nodes
 */
var scene = SceneJS.scene("theScene");
var yawNode = scene.findNode("yaw");
var pitchNode = scene.findNode("pitch");

/* As mouse drags, we'll update the rotate nodes
 */

var lastX;
var lastY;
var dragging = false;

var newInput = false;
var yaw = 0;
var pitch = 0;


var canvas = document.getElementById("theCanvas");

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
        pitch += (event.clientY - lastY) * 0.5;

        lastX = event.clientX;
        lastY = event.clientY;

        newInput = true;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

var time = 0;

/* Start the scene rendering
 */
scene.start({
    idleFunc: function() {
        scene.findNode("myShader").set("params", {time:time += 0.2});
        if (newInput) {
            yawNode.set("angle", yaw);
            pitchNode.set("angle", pitch);
            newInput = false;
        }
    }
});

