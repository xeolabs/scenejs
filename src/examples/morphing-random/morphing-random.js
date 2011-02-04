/*
 Mesh morphing demo

 In this example we're copying the vertex positions of a teapot node, multiplying them
 by a sine wave, then wrapping the teapot in a morphGeometry that uses the new postions as a target.

 We're then animating the morphGeometry 'factor' attribute in the render loop to peform the morphing.

 lindsay.kay@xeolabs.com

 */
SceneJS.createNode({

    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: -15 },
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
                                            id: "the-material",

                                            emit: 0,
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          100.0,

                                            nodes: [

                                                {
                                                    type : "teapot",
                                                    id: "the-teapot"


                                                },
                                                {
                                                    type: "translate",
                                                    id: "translate2",
                                                    x:0.0,
                                                    y:0.0,
                                                    z:0.0
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
 * When the teapot has been rendered, get its positions, multiply them
 * by a sine wave, then wrap the teapot in a morphGeometry that uses the
 * new postions as a target.
 *
 * The teapot node can only provide its positions after it has been
 * rendered.
 *---------------------------------------------------------------------*/

var morphCreated = false;

SceneJS.withNode("theScene").bind("rendered",
        function() {

            var teapot = SceneJS.withNode("the-teapot");

            if (!morphCreated) {

                var positions = teapot.get("positions");
                var positions2 = [];
                for (var i = 0, j = 0, len = positions.length; i < len; i++,j += 3) {
                    positions2.push(positions[i] * (1 + (Math.sin(i * 0.003) * 0.1)));
                }
                var positions3 = [];
                for (var i = 0, j = 0, len = positions.length; i < len; i++,j += 3) {
                    positions3.push(positions[i] * (1 + (Math.sin(i * 0.015) * 0.1)));
                }

                teapot.parent().insert({
                    node: {
                        type: "morphGeometry",
                        id: "my-morphGeometry",

                        keys: [
                            0, // Target 1
                            1, // Target 2
                            3  // target 3
                        ],

                        targets: [
                            {
                                positions: positions   // Target 1
                            },
                            {
                                positions: positions2  // Target 2
                            },
                            {
                                positions: positions3  // Target 3
                            }
                        ],

                        factor: 0.0  // Start at first target
                    }
                });
            }

            morphCreated = true;
        });


var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

var factor = 0;

/*----------------------------------------------------------------------
 * In our rendering loop, as soon as the morphGeometry exists, we'll
 * increment its factor to move the morph between its two targets
 *---------------------------------------------------------------------*/

SceneJS.withNode("theScene").start({
    idleFunc: function() {
        if (SceneJS.nodeExists("my-morphGeometry")) {
            SceneJS.withNode("my-morphGeometry").set("factor", 1.0 + (Math.sin(factor) * 2.0));
            factor += 0.1;
        }
    }
});

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



