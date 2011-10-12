/*
 Demonstration of video textures

 The demo is very simple - we define a video node that references an OGG file,
 then we define a texture node that references the video node.

 Then the scene will continuously redraw, each time updating the video texture.

 SceneJS scenes don't normally keep redrawing by themselves (instead only redrawing
 only whenever something changes), but since this scene contains a video, it needs to
 redraw to keep updating the texture.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [

        /*-------------------------------------------------------------------
         * The video we'll sample our texture from - doesn't matter where we
         * define this node in the scene graph:
         *-----------------------------------------------------------------*/

        {
            type: "video",
            id: "my-video",
            src: "bunny.ogg"
        },

        {
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: -10},
            look : { x : 0.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

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
                            type:          "light",
                            mode:          "dir",
                            color:         { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:       true,
                            specular:      false,
                            dir:           { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type:          "light",
                            mode:          "dir",
                            color:         { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:       true,
                            specular:      false,
                            dir:           { x: 0.0, y: 1.0, z: 1.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.2,
                            shine:          6.0,

                            nodes: [

                                /*-------------------------------------------------------------------
                                 * A texture node that samples the video node we defined above
                                 *-----------------------------------------------------------------*/

                                {
                                    type: "texture",
                                    id: "theTexture",

                                    layers: [
                                        {
                                            video: "my-video",
                                            blendMode: "multiply"
                                        }
                                    ],

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "cube-pitch",
                                            angle: -30.0,
                                            x : 1.0,

                                            nodes: [
                                                {
                                                    type: "rotate",
                                                    id: "cube-yaw",
                                                    angle: 30.0,
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
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var yaw = 30;
var pitch = -30;
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

var scene = SceneJS.scene("theScene");

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;

        scene.findNode("cube-yaw").set("angle", yaw);
        scene.findNode("cube-pitch").set("angle", pitch);

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


/* Start rendering the scene graph. On each frame, increment the rotation
 * of the teapot.
 */

scene.start({
    idleFunc: function() {
        //        scene.findNode("cube-yaw").inc("angle", .1);
        //        scene.findNode("cube-pitch").inc("angle", .2);
    }
});

