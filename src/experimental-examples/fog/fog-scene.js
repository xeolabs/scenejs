/*
 Introductory SceneJS scene which renders the venerable OpenGL teapot in fog.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv",

    nodes: [

        /* Our fog node
         */
        {
            type:    "fog",
            mode:    "constant",
            // "constant", "linear", "exp", "exp2"
            color:   { r:0, g: 0.0,  b:.0 },
            start:   5,
            end:     40,
            density: 0.6,

            nodes: [

                {
                    type:"flags" ,
                    flags: {
                      fog: true
                    },
                    
                    nodes: [

                        /* Viewing transform specifies eye position, looking
                         * at the origin by default
                         */
                        {
                            type: "lookAt",
                            eye : { x: 0.0, y: 10.0, z: -15 },
                            look : { y:1.0 },
                            up : { y: 1.0 },

                            nodes: [

                                /* Camera describes the projection
                                 */
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


                                        /* A lights node inserts  point lights into the world-space.
                                         * You can have many of these, nested within modelling transforms
                                         * if you want to move them around.
                                         */
                                        {
                                            type: "light",
                                            mode:                   "dir",
                                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                            diffuse:                true,
                                            specular:               true,
                                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                        },

                                        {
                                            type: "light",
                                            mode:                   "dir",
                                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                            diffuse:                true,
                                            specular:               true,
                                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                        },

                                        {
                                            type: "light",
                                            mode:                   "dir",
                                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                            diffuse:                true,
                                            specular:               true,
                                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                        },


                                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                                         * so we can access them to set their angle attributes.
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

                                                        /* Specify the amounts of ambient, diffuse and specular
                                                         * lights our teapot reflects
                                                         */
                                                        {
                                                            type: "material",
                                                            emit: 0,
                                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.9,
                                                            shine:          100.0,

                                                            nodes: [

                                                                {
                                                                    type: "translate",
                                                                    // Example translation
                                                                    x:0.0,
                                                                    y:0.0,
                                                                    z:0.0,

                                                                    nodes : [
                                                                        {
                                                                            type: "scale",
                                                                            // Example scaling
                                                                            x:1.0,
                                                                            y:1.0,
                                                                            z:1.0,

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
        }
    ]
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

SceneJS.withNode("theScene").render();

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
        pitch += (event.clientY - lastY) * -0.5;

        SceneJS.withNode("yaw").set("angle", yaw);
        SceneJS.withNode("pitch").set("angle", pitch);

        SceneJS.withNode("theScene").render();

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);



