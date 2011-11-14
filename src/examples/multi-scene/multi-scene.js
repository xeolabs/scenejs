/*
 Example of four scenes graphs in a page, each bound to a different canvas

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Each scene graph is bound to a different canvas.

 From SceneJS V0.9, only the "scene" node (at the root of a scene graph) needs to have a globally unique ID.
 IDs of the other nodes need only be unique within their graph - see how in this example the "yaw" and
 "pitch" IDs are reused across the graphs. That enables content JSON to reused across many graphs, enabling
 multiple views of the same models.

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 updated on rotate nodes from mouse input.

 Dragging in the pitch and yaw axes in any one canvas will affect the orientation of the teapot 
 object in the other three canvases. Each of the rotatable Newell Teapots are illuminated by three 
 light sources from the same direction.

 https://github.com/xeolabs/scenejs/wiki/Multiple-Scenes-in-a-Page

 */

var myTeapot = {
    type: "material",
    emit: 0,
    baseColor:      { r: 0.6, g: 0.6, b: 1.0 },
    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
    specular:       0.9,
    shine:          100.0,
    nodes: [
        {
            type : "teapot"
        }
    ]
};

SceneJS.createScene({
    type: "scene",
    id: "scene1", // Access scene node by this ID
    canvasId: "theCanvas1", // Bind to canvas
    loggingElementId: "theLoggingDiv1",

    nodes: [
        {
            // View transform
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: 15 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    // Perspective transform
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
                            // Light 1
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        {
                            // Light 2
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: -1.0, z: -1.0 }
                        },

                        {
                            // Teapot orientation
                            type: "rotate",
                            id: "pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    // Teapot orientation
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

SceneJS.createScene({
    type: "scene",
    id: "scene2", // Access scene node by this ID
    canvasId: "theCanvas2", // Bind to canvas
    loggingElementId: "theLoggingDiv1",

    nodes: [
        {
            // View transform
            type: "lookAt",
            eye : { x: 15.0, y: 0.0, z: 15 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    // Perspective transform
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
                            // Light 1
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        {
                            // Light 2
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: -1.0, z: 1.0 }
                        },

                        {
                            // Teapot orientation
                            type: "rotate",
                            id: "pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    // Teapot orientation
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});


SceneJS.createScene({
    type: "scene",
    id: "scene3", // Access scene node by this ID
    canvasId: "theCanvas3", // Bind to canvas
    loggingElementId: "theLoggingDiv1",

    nodes: [
        {
            // View transform
            type: "lookAt",
            eye : { x: 15.0, y: 0.0, z: 0 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    // Perspective transform
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
                            // Light 1
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        {
                            // Light 2
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: -1.0, z: 1.0 }
                        },


                        {
                            // Teapot orientation
                            type: "rotate",
                            id: "pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    // Teapot orientation
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

SceneJS.createScene({
    type: "scene",
    id: "scene4", // Access scene node by this ID
    canvasId: "theCanvas4", // Bind to canvas
    loggingElementId: "theLoggingDiv1",

    nodes: [
        {
            // View transform
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: -15 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    // Perspective transform
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
                            // Light 1
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -1.0, z: -1.0 }
                        },

                        {
                            // Light 2
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: -1.0, z: 1.0 }
                        },

                        {
                            // Teapot orientation
                            type: "rotate",
                            id: "pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    // Teapot orientation
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});


var scene1 = SceneJS.scene("scene1");
var scene2 = SceneJS.scene("scene2");
var scene3 = SceneJS.scene("scene3");
var scene4 = SceneJS.scene("scene4");

/*----------------------------------------------------------------------
 * Start rendering the scenes
 *---------------------------------------------------------------------*/

scene1.start();
scene2.start();
scene3.start();
scene4.start();

SceneJS.Message.sendMessage({
    command: "selectScenes",
    scenes: ["scene1", "scene2", "scene3", "scene4"],
    messages: [
        {
            command: "create",
            target: "yaw",
            nodes: [
                {
                    type: "material",
                    emit: 0,
                    baseColor:      { r: 0.5, g: 0.5, b: 0.6 },
                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                    specular:       1.0,
                    shine:          70.0,

                    nodes: [
                        {
                            type: "teapot"
                        }
                    ]
                }
            ]
        }
    ]
});

/*----------------------------------------------------------------------
 * Define mouse handlers 
 *---------------------------------------------------------------------*/

var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

/* On a mouse drag, we'll update the yaw and pitch rotations in each scene
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.2;
        pitch += (event.clientY - lastY) * -0.2;

        scene1.findNode("yaw").set("angle", yaw);
        scene1.findNode("pitch").set("angle", pitch);

        lastX = event.clientX;
        lastY = event.clientY;

        /*----------------------------------------------------------------------------
         * We can update our scenes by selecting the rotate nodes
         * and setting their angle attributes:
         *---------------------------------------------------------------------------*/

        //        scene2.findNode("yaw").set("angle", yaw);
        //        scene2.findNode("pitch").set("angle", pitch);
        //
        //        scene3.findNode("yaw").set("angle", yaw);
        //        scene3.findNode("pitch").set("angle", pitch);
        //
        //        scene4.findNode("yaw").set("angle", yaw);
        //        scene4.findNode("pitch").set("angle", pitch);

        /*----------------------------------------------------------------------------
         * Or as shown below, we can use the Message API to "broadcast" the
         * angle update to the rotate nodes in the scenes, since those nodes
         * share the same IDs. Note that this will be slower than selecting
         * the nodes individually, as done with the method shown above.
         *---------------------------------------------------------------------------*/

        var broadcast = false;  // Set true to try broadcasting

        if (broadcast) {

            /* Broadcast rotation updates to all scenes
             */

            SceneJS.Message.sendMessage({
                command: "update",
                target: "yaw",
                set: {
                    angle: yaw
                }
            });

            SceneJS.Message.sendMessage({
                command: "update",
                target: "pitch",
                set: {
                    angle: pitch
                }
            });

        } else {

            /* Send rotation updates to selected scenes:
             */

            SceneJS.Message.sendMessage({
                command: "selectScenes",
                scenes: ["scene1", "scene2", "scene3", "scene4"],
                messages: [
                    {
                        command: "update",
                        target: "yaw",
                        set: {
                            angle: yaw
                        }
                    },
                    {
                        command: "update",
                        target: "pitch",
                        set: {
                            angle: pitch
                        }
                    }
                ]
            });
        }
    }
}

document.getElementById("theCanvas1").addEventListener('mousedown', mouseDown, true);
document.getElementById("theCanvas1").addEventListener('mousemove', mouseMove, true);
document.getElementById("theCanvas1").addEventListener('mouseup', mouseUp, true);

document.getElementById("theCanvas2").addEventListener('mousedown', mouseDown, true);
document.getElementById("theCanvas2").addEventListener('mousemove', mouseMove, true);
document.getElementById("theCanvas2").addEventListener('mouseup', mouseUp, true);

document.getElementById("theCanvas3").addEventListener('mousedown', mouseDown, true);
document.getElementById("theCanvas3").addEventListener('mousemove', mouseMove, true);
document.getElementById("theCanvas3").addEventListener('mouseup', mouseUp, true);

document.getElementById("theCanvas4").addEventListener('mousedown', mouseDown, true);
document.getElementById("theCanvas4").addEventListener('mousemove', mouseMove, true);
document.getElementById("theCanvas4").addEventListener('mouseup', mouseUp, true);