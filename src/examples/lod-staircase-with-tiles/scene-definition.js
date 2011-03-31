/* Demonstrates level-of-detail selection with dynamically-loaded assets.
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 * Drag the mouse up and down to move forwards and backwards, left and right to turn.
 *
 * Move backwards and watch the staircase simplify.
 *
 * This scene contains a staircase model that switches representations as a function of the
 * projected size of it's extents. The switching is done by a bounding box, which selects
 * an appropriate child for its current projected size from among its child nodes.
 */

SceneJS.createNode({

    type: "scene",

    id: "the-scene",

    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [

        {
            type: "lookAt",
            id: "the-lookat",
            eye : { x: 0, y: 10, z: -150 },
            look : { x :  0, y: 20, z: 0 },
            up : { y: 1.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 45.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 7000.0
                    },

                    nodes: [

                        /* Integrate our sky sphere, which is defined in sky-sphere.js
                         */
                        {
                            type : "instance",
                            target :"sky-sphere"
                        },

                        /* Lights, after the sky sphere to avoid applying to it
                         */
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 2.0, y: 1.0, z: 0.0 }
                        },                      


                        /* Instantiate our staircase, defined in staircase.js
                         */
                        {
                            type: "instance",
                            target: "lod-stairs"
                        } ,

                        /* Instantiate our tiled floor, defined in tiled-floor.js
                         */
                        {
                            type: "instance",
                            target: "tiled-floor"
                        }
                    ]
                }

            ]
        }
    ]
});


/*----------------------------------------------------------------------
 * Disable scene graph compilation (disabled by default in V0.8).
 *
 * This feature is alpha status and may break some scene graphs.
 *
 * It can speed your scene graph up by an order of magnitude - we'll
 * do it here just to show how it's done.
 *
 * http://scenejs.wikispaces.com/V0.8+Branch
 *---------------------------------------------------------------------*/

SceneJS.setDebugConfigs({
    compilation : {
        enabled : true
    }
});


var canvas = document.getElementById("theCanvas");

var origin = null;
var speed = null;
canvas.addEventListener('mousedown', function(e) {
    origin = {x: e.clientX, y: e.clientY};
}, false);

canvas.addEventListener('mouseup', function(e) {
    origin = null;
    speed = null;
}, false);

canvas.addEventListener('mousemove', function(e) {
    if (origin)
        speed = {x: e.clientX - origin.x, y: e.clientY - origin.y};
}, false);

canvas.addEventListener('mousewheel', function(event) {
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
            speed.y -= 0.2;
        } else {
            speed.y += 0.2;
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}, true);

SceneJS.withNode("the-scene").start({
    fps: 60,
    idleFunc: function(e) {
        if (speed && speed.y)
            SceneJS.Message.sendMessage({
                command: "lookAt.move",
                target: "the-lookat",
                z: -speed.y / 100,
                ignoreY: true
            });

        if (speed && speed.x)
            SceneJS.Message.sendMessage({
                command: "lookAt.rotate",
                target: "the-lookat",
                angle: -speed.x / 420,
                ignoreY: true
            });
    }
});
