/*
 * Using a custom shader to maintain the stationary position of a sky sphere.
 *
 * In this example we inject a custom function into the vertex shader for a textured sphere; the function
 * intercepts the view transform matrix and zeroes the translation elements, causing the sphere to
 * remain centered at [0,0,0] regardless of viewpoint movements.
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 *  http://scenejs.wikispaces.com/shader
 */

SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv",

    nodes: [

        /*--------------------------------------------------------------
         * View transform - we've given it a globally-unique ID
         * so we can look it up and update it's properties from
         * mouse input.
         *------------------------------------------------------------*/
        {
            type: "lookAt",
            id: "theLookAt",
            eye : { x: 0, y: 0, z: -30 },
            look :  { x: 0, y: 0, z: 0 },
            up : { x: 0, y: 1, z: .0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 40.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 7000.0
                    },

                    nodes: [

                        /*-------------------------------------------------------------------------------
                         *  Light sources
                         *-----------------------------------------------------------------------------*/

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: -1, z: -1.0 }
                        },
                        {
                            type:"light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -.5, z: -1.0  }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: -.5, z: 1.0  }
                        },

                        /*-------------------------------------------------------------------------------
                         * Custom shader to intercept the view matrix and remove translations from it
                         *-----------------------------------------------------------------------------*/

                        {

                            type: "shader",

                            coreId: "stationary-shader",

                            shaders: [

                                /* Vertex shader with our custom function to intercept the matrix
                                 */
                                {
                                    stage:  "vertex",
                                    code: [

                                        "mat4 myViewMatrix(mat4 m) {",
                                        "   m[3][0] =m[3][1] = m[3][2] = 0.0;" +
                                        "   return m; ",
                                        "}"
                                    ],

                                    hooks: {
                                        viewMatrix: "myViewMatrix"  // Bind our custom function to hook
                                    }
                                }
                            ],

                            nodes: [

                                /*---------------------------------------------------------------------
                                 * Milky Way texture
                                 *--------------------------------------------------------------------*/

                                {
                                    type: "texture",
                                    layers: [
                                        {
                                            uri: "../web/images/gigapixel-milky-way.gif",
                                            applyTo:"baseColor",
                                            blendMode: "multiply"
                                        }
                                    ],

                                    nodes: [

                                        /*---------------------------------------------------------------------
                                         * Material properties for the sky sphere
                                         *--------------------------------------------------------------------*/
                                        {
                                            type: "material",
                                            baseColor: { r: .95, g: .95, b: .95 },
                                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                            emit:           0.2,
                                            specular:       0.9,
                                            shine:          3.0,

                                            nodes: [

                                                /*-------------------------------------------------------------
                                                 * A large sphere geometry which gets the milky way texture
                                                 *------------------------------------------------------------*/

                                                {
                                                    type:"scale",
                                                    x: 100,
                                                    y: 100,
                                                    z: 100,

                                                    nodes: [
                                                        {
                                                            type: "sphere"
                                                        }
                                                    ]
                                                }
                                            ]

                                        }
                                    ]
                                }
                            ]
                        },

                        /*--------------------------------------------------------------
                         * A blue teapot in the middle - these nodes are not
                         * within the subtree of our custom shader, so the teapot
                         * is free to move around on the Z-axis as we zoom the camera.
                         *--------------------------------------------------------------*/

                        {
                            type:"material",
                            baseColor:      { r: 0.3, g: 0.3, b: 1.0 },
                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                            specular:       10.9,
                            shine:          20.0,

                            nodes: [
                                {
                                    type: "teapot"
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

var updated = false;

var eye = { x: 0, y: 10, z: -400 };
var dist = -30;

var lastX;
var lastX2;
var lastY2;
var lastY;
var dragging = false;

var yaw = 0;
var pitch = 0;

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function touchStart(event) {
    lastX = event.targetTouches[0].clientX;
    lastY = event.targetTouches[0].clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

function touchEnd() {
    dragging = false;
}

function mouseMove(event) {
    var posX = event.clientX;
    var posY = event.clientY;
    actionMove(posX,posY);
}

function touchMove(event) {
    var posX = event.targetTouches[0].clientX;
    var posY = event.targetTouches[0].clientY;
    actionMove(posX,posY);
}

/* On a mouse/touch drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function actionMove(posX, posY) {
    if (dragging) {
        yaw += (posX - lastX) * -.1;
        pitch += (lastY - posY) * -.1;
        lastX = posX;
        lastY = posY;
        updated = true;
    }
}

function mouseWheel(event) {
    var delta = 0;
    if (!event) event = window.event;
    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }
    if (delta) {
        if (delta < 0) {
            dist -= 2.0;
        } else {
            dist += 2.0;
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
    updated = true;
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('touchstart', touchStart, true);
canvas.addEventListener('touchmove', touchMove, true);
canvas.addEventListener('touchend', touchEnd, true);
canvas.addEventListener('mousewheel', mouseWheel, true);
canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

SceneJS.bind("error", function(e) {
    alert(e.exception.message);
});

SceneJS.scene("theScene").start({

    idleFunc: function() {

        if (!updated) {
            return;
        }
        updated = false;

        var eyeVec = [0,0,dist];

        var pitchMat = Matrix.Rotation(pitch * 0.0174532925, $V([1,0,0]));
        var yawMat = Matrix.Rotation(yaw * 0.0174532925, $V([0,1,0]));

        eyeVec = pitchMat.multiply($V(eyeVec)).elements;
        eyeVec = yawMat.multiply($V(eyeVec)).elements;

        this.findNode("theLookAt").set({
            eye: {x: eyeVec[0], y: eyeVec[1], z: eyeVec[2] }
        });
    }
});


