/*
 Multiple Canvases SceneJS scene which renders the venerable OpenGL teapot into four canvases.

 Stephen Bannasch
 sbannasch@concord.org

 Adapted fron the hello-teapot example by:
 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 This renders separate scenegraphs containing a teapot object from different perspectives 
 into four separate canvases.

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 updated on rotate nodes from mouse input.

 Dragging in the pitch and yaw axes in any one canvas will affect the orientation of the teapot 
 object in the other three canvases. Each of the rotatable Newell Teapots are illuminated by three 
 light sources from the same direction.

 */
SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene1",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas1",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv1",

    nodes: [

        /* Viewing transform specifies eye position, looking
         * at the origin by default
         */
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 15 },
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
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: -1.0, z: -1.0 }
                        },

                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                         * so we can access them to set their angle attributes.
                         */
                        {
                            type: "rotate",
                            id: "pitch1",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw1",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "roll1",
                                            angle: 0.0,
                                            z : 1.0,

                                            nodes: [

                                                /* Specify the amounts of ambient, diffuse and specular
                                                 * lights our teapot reflects
                                                 */
                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.6, g: 0.6, b: 1.0 },
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
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw1 = 0;
var pitch1 = 0;
var lastX1;
var lastY1;
var dragging1 = false;

SceneJS.withNode("theScene1").render();

var canvas1 = document.getElementById("theCanvas1");

function mouseDown1(event) {
    lastX1 = event.clientX;
    lastY1 = event.clientY;
    dragging1 = true;
}

function mouseUp1() {
    dragging1 = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove1(event) {
    if (dragging1) {
        yaw1 += (event.clientX - lastX1) * 0.2;
        pitch1 += (event.clientY - lastY1) * -0.2;

        SceneJS.withNode("yaw1").set("angle", yaw1);
        SceneJS.withNode("pitch1").set("angle", pitch1);

        SceneJS.withNode("theScene1").render();

        lastX1 = event.clientX;
        lastY1 = event.clientY;

        SceneJS.withNode("yaw2").set("angle", yaw1);
        SceneJS.withNode("roll2").set("angle", pitch1);
        SceneJS.withNode("theScene2").render();

        SceneJS.withNode("roll3").set("angle", yaw1);
        SceneJS.withNode("pitch3").set("angle", pitch1);
        SceneJS.withNode("theScene3").render();

        SceneJS.withNode("yaw4").set("angle", yaw1);
        SceneJS.withNode("roll4").set("angle", pitch1);
        SceneJS.withNode("theScene4").render();

    }
}

canvas1.addEventListener('mousedown', mouseDown1, true);
canvas1.addEventListener('mousemove', mouseMove1, true);
canvas1.addEventListener('mouseup', mouseUp1, true);

SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene2",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas2",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv2",

    nodes: [

        /* Viewing transform specifies eye position, looking
         * at the origin by default
         */
        {
            type: "lookAt",
            eye : { x: 15, y: 10.0, z: 0 },
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
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: -1.0, z: -1.0 }
                        },

                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                         * so we can access them to set their angle attributes.
                         */
                        {
                            type: "rotate",
                            id: "pitch2",
                            angle: 0.0,
                            z : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw2",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "roll2",
                                            angle: 0.0,
                                            x : 1.0,

                                            nodes: [

                                                /* Specify the amounts of ambient, diffuse and specular
                                                 * lights our teapot reflects
                                                 */
                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.6, g: 0.6, b: 1.0 },
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
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw2 = 0;
var pitch2 = 0;
var lastX2;
var lastY2;
var dragging2 = false;

SceneJS.withNode("theScene2").render();

var canvas2 = document.getElementById("theCanvas2");

function mouseDown2(event) {
    lastX2 = event.clientX;
    lastY2 = event.clientY;
    dragging2 = true;
}

function mouseUp2() {
    dragging2 = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove2(event) {
    if (dragging2) {
        yaw2 += (event.clientX - lastX2) * 0.2;
        pitch2 += (event.clientY - lastY2) * -0.2;

        SceneJS.withNode("yaw2").set("angle", yaw2);
        SceneJS.withNode("pitch2").set("angle", pitch2);

        SceneJS.withNode("theScene2").render();

        lastX2 = event.clientX;
        lastY2 = event.clientY;

        SceneJS.withNode("yaw1").set("angle", yaw2);
        SceneJS.withNode("roll1").set("angle", pitch2);
        SceneJS.withNode("theScene1").render();

        SceneJS.withNode("roll3").set("angle", yaw2);
        SceneJS.withNode("yaw3").set("angle", pitch2);
        SceneJS.withNode("theScene3").render();

        SceneJS.withNode("yaw4").set("angle", yaw2);
        SceneJS.withNode("pitch4").set("angle", pitch2);
        SceneJS.withNode("theScene4").render();

    }
}

canvas2.addEventListener('mousedown', mouseDown2, true);
canvas2.addEventListener('mousemove', mouseMove2, true);
canvas2.addEventListener('mouseup', mouseUp2, true);


SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene3",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas3",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv3",

    nodes: [

        /* Viewing transform specifies eye position, looking
         * at the origin by default
         */
        {
            type: "lookAt",
            eye : { x: 0, y: 15, z: 0 },
            look : { y:1.0 },
            up : { z: 1.0 },

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
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: -1.0, z: -1.0 }
                        },


                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                         * so we can access them to set their angle attributes.
                         */
                        {
                            type: "rotate",
                            id: "pitch3",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw3",
                                    angle: 0.0,
                                    z : 1.0,

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "roll3",
                                            angle: 0.0,
                                            y : 1.0,

                                            nodes: [

                                                /* Specify the amounts of ambient, diffuse and specular
                                                 * lights our teapot reflects
                                                 */
                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.6, g: 0.6, b: 1.0 },
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
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw3 = 0;
var pitch3 = 0;
var lastX3;
var lastY3;
var dragging3 = false;

SceneJS.withNode("theScene3").render();

var canvas3 = document.getElementById("theCanvas3");

function mouseDown3(event) {
    lastX3 = event.clientX;
    lastY3 = event.clientY;
    dragging3 = true;
}

function mouseUp3() {
    dragging3 = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove3(event) {
    if (dragging3) {
        yaw3 += (event.clientX - lastX3) * 0.2;
        pitch3 += (event.clientY - lastY3) * -0.2;

        SceneJS.withNode("yaw3").set("angle", yaw3);
        SceneJS.withNode("pitch3").set("angle", pitch3);

        SceneJS.withNode("theScene3").render();

        lastX3 = event.clientX;
        lastY3 = event.clientY;

        SceneJS.withNode("roll1").set("angle", yaw3);
        SceneJS.withNode("pitch1").set("angle", pitch3);
        SceneJS.withNode("theScene1").render();

        SceneJS.withNode("pitch2").set("angle", yaw3);
        SceneJS.withNode("roll2").set("angle", pitch3);
        SceneJS.withNode("theScene2").render();

        SceneJS.withNode("pitch4").set("angle", yaw3);
        SceneJS.withNode("roll4").set("angle", pitch3);
        SceneJS.withNode("theScene4").render();

    }
}

canvas3.addEventListener('mousedown', mouseDown3, true);
canvas3.addEventListener('mousemove', mouseMove3, true);
canvas3.addEventListener('mouseup', mouseUp3, true);

SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene4",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas4",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv4",

    nodes: [

        /* Viewing transform specifies eye position, looking
         * at the origin by default
         */
        {
            type: "lookAt",
            eye : { x: 45, y: 30.0, z: 0 },
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
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: -1.0, z: -1.0 }
                        },


                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                         * so we can access them to set their angle attributes.
                         */
                        {
                            type: "rotate",
                            id: "pitch4",
                            angle: 0.0,
                            z : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw4",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "roll4",
                                            angle: 0.0,
                                            x : 1.0,

                                            nodes: [

                                                /* Specify the amounts of ambient, diffuse and specular
                                                 * lights our teapot reflects
                                                 */
                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.6, g: 0.6, b: 1.0 },
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
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw4 = 0;
var pitch4 = 0;
var lastX4;
var lastY4;
var dragging4 = false;

SceneJS.withNode("theScene4").render();

var canvas4 = document.getElementById("theCanvas4");

function mouseDown4(event) {
    lastX4 = event.clientX;
    lastY4 = event.clientY;
    dragging4 = true;
}

function mouseUp4() {
    dragging4 = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove4(event) {
    if (dragging4) {
        yaw4 += (event.clientX - lastX4) * 0.2;
        pitch4 += (event.clientY - lastY4) * -0.2;

        SceneJS.withNode("yaw4").set("angle", yaw4);
        SceneJS.withNode("pitch4").set("angle", pitch4);

        SceneJS.withNode("theScene4").render();

        lastX4 = event.clientX;
        lastY4 = event.clientY;

        SceneJS.withNode("yaw1").set("angle", yaw4);
        SceneJS.withNode("roll1").set("angle", pitch4);
        SceneJS.withNode("theScene1").render();

        SceneJS.withNode("yaw2").set("angle", yaw4);
        SceneJS.withNode("pitch2").set("angle", pitch4);
        SceneJS.withNode("theScene2").render();

        SceneJS.withNode("roll3").set("angle", yaw4);
        SceneJS.withNode("yaw3").set("angle", pitch4);
        SceneJS.withNode("theScene3").render();

    }
}

canvas4.addEventListener('mousedown', mouseDown4, true);
canvas4.addEventListener('mousemove', mouseMove4, true);
canvas4.addEventListener('mouseup', mouseUp4, true);
