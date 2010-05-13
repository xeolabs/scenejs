/*
 Perspective projection of the OpenGL Teapot using a Frustum node

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 The SceneJS.Frustum node does the same thing as SceneJS.Projection, which implicitly specifies the frustum.
 This node provides you with the ability to explicitly set the frustum, which can be useful if you want it to be
 asymmetrical.

 This example assumes that you've looked at various other examples, and just serves to demonstrate
 orthographic projection using the SceneJS.Ortho node.

 */

SceneJS.addListener("error", function(e) {
    alert(e.exception.message ? e.exception.message : e.exception);
});

var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

    /* Perspective projection - left and right specify the x-coordinate clipping planes,
     * bottom and top specify the y-coordinate clipping planes, and near and far specify
     * the distance to the z-coordinate clipping planes.
     *
     * Together these coordinates provide a frustum-shaped viewing volume.
     */
        SceneJS.frustum({
            left   :   -0.02,
            bottom :   -0.02,
            near   :    0.1,
            right  :    0.02,
            top    :    0.02,
            far    : 1000.0
        },

            /* Viewing transform specifies eye position, looking
             * at the origin by default
             */
                SceneJS.lookAt({
                    eye : { x: 0.0, y: 10.0, z: -20 },
                    look : { y:0.0 },
                    up : { y: 1.0 }
                },

                    /* A lights node inserts  point lights into the world-space.
                     * You can have many of these, nested within modelling transforms
                     * if you want to move them around.
                     */
                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                }
                            ]},

                            /* Next, modelling transforms to orient our teapot
                             by a given angle.  See how these rotate nodes take a
                             function which creates its configuration object?

                             You can do that when you want a node's configuration to be
                             evaluated dynamically at traversal-time. The function
                             takes a scope, which is SceneJS's mechanism for passing
                             variables down into a scene graph. Using the angle
                             variable on the scope, the function creates a
                             configuration that specifies a rotation about the X-axis.
                             Further down you'll see how we inject that angle
                             variable when we render the scene.
                             */
                                SceneJS.rotate(function(data) {
                                    return {
                                        angle: data.get('pitch'), x : 1.0
                                    };
                                },
                                        SceneJS.rotate(function(data) {
                                            return {
                                                angle: data.get('yaw'), y : 1.0
                                            };
                                        },

                                            /* Specify the amounts of ambient, diffuse and specular
                                             * lights our teapot reflects
                                             */
                                                SceneJS.material({
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },

                                                    /* Teapot's geometry
                                                     */
                                                        SceneJS.scale({x:1.0,y:1.0,z:1.0},
                                                                SceneJS.objects.teapot.apply(this, [])
                                                                )
                                                        )
                                                )
                                        ) // rotate
                                ) // lookAt
                        ) // perspective
                ) // lights
        ); // scene


var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

/* Throw the switch, Igor!
 * We render the scene, injecting the initial angles for the rotate nodes.
 */
exampleScene.render({yaw: yaw, pitch: pitch});

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = document.getElementById(exampleScene.getCanvasId());


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
        exampleScene.render({yaw: yaw, pitch: pitch});
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


SceneJS.addListener("error", function(e) {
    alert(e.exception.message ? e.exception.message : e.exception);
});


