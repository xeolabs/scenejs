/*  Introductory SceneJS scene which renders the venerable OpenGL teapot.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 To render the teapot, SceneJS will traverse the scene in depth-first order. Each node is a function
 that will set some WebGL state on entry, then un-set it again before exit. In this graph, the root
 scene node binds to a Canvas element, a renderer sets some rendering state, then the rest of the
 nodes specify various transforms, lights, material properties, all wrapping a teapot geometry node.

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 passed down via data "scopes". Take a close look at the rotate nodes, which use these variables, and
 the invocation of the "render" function near the bottom of this example, which passes them in.

 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

    /* Write logging output to a DIV element in the page
     */
        SceneJS.loggingToPage({ elementId: "logging" },

            /* A renderer node clears the depth and colour buffers
             */
                SceneJS.renderer({
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 600, height: 600},
                    clearColor: { r:0.0, g: 0.0, b: 0.0 }
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0 },

                            /* Viewing transform specifies eye position, looking
                             at the origin by default
                             */
                                SceneJS.lookAt({
                                    eye : { x: 0.0, y: 10.0, z: -15 },
                                    look : { y:1.0 },
                                    up : { y: 1.0 }
                                },

                                    /* A lights node inserts  point lights into the world-space.
                                     * You can have many of these, nested within modelling transforms
                                     * if you want to move them around.
                                     */
                                        SceneJS.lights({
                                            lights: [
                                                {
                                                    type:                   "point",
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                    pos:                    { x: 100.0, y: 0.0, z: -100.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                },
                                                {
                                                    type:                   "point",
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                    pos:                    { x: -100.0, y: 100.0, z: 0.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                },
                                                {
                                                    type:                   "point",
                                                    diffuse:                { r: 0.6, g: 0.3, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                    pos:                    { x: -0.0, y: 1000.0, z: 0.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
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
                                                SceneJS.rotate(function(scope) {
                                                    return {
                                                        angle: scope.get('pitch'), x : 1.0
                                                    };
                                                },
                                                        SceneJS.rotate(function(scope) {
                                                            return {
                                                                angle: scope.get('yaw'), y : 1.0
                                                            };
                                                        },

                                                            /* Specify the amounts of ambient, diffuse and specular
                                                             * lights our teapot reflects
                                                             */
                                                                SceneJS.material({
                                                                    ambient:   { r: 0.5, g: 0.5, b: 0.5 },
                                                                    diffuse:   { r: 0.6, g: 0.6, b: 0.6 },
                                                                    specular:  { r: 1, g: 1, b: 1 },
                                                                    emission: { r: 0.02, g: 0.02, b: 0.0 },
                                                                    shininess: 6.0
                                                                },

                                                                    /* Teapot's geometry
                                                                     */
                                                                        SceneJS.scale({x:1.0,y:1.0,z:1.0},
                                                                                SceneJS.objects.teapot()
                                                                                )
                                                                        )
                                                                )
                                                        ) // rotate
                                                ) // lookAt
                                        ) // perspective
                                ) // lights
                        ) // renderer
                ) // logging
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
        exampleScene.render({yaw: yaw, pitch: pitch});
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


