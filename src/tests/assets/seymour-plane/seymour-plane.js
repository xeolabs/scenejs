/*
 COLLADA Load Example - Seymour Plane Test Model

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Demonstrates the import of a COLLADA asset - the Seymour test model from collada.org

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 passed down via data "scopes". Take a close look at the rotate nodes, which use these variables, and
 the invocation of the "render" function near the bottom of this example, which passes them in.

 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas',

    /* URL of the proxy server which will mediate the
     * cross-domain load of our airplane COLLADA model
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

    /* Write logging output to a DIV element in the page
     */
        SceneJS.loggingToPage({ elementId: "logging" },

            /* A renderer node clears the depth and colour buffers
             */
                SceneJS.renderer({
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 600, height: 600},
                    clearColor: { r:0.0, g: 0.0, b: 0.0 },
                    enableTexture2D: true
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 25.0, aspect : 1.0, near : 0.10, far : 5000.0 },

                            /* Viewing transform specifies eye position, looking
                             at the origin by default
                             */
                                SceneJS.lookAt({
                                    eye : { x: -20.0, y: 20.0, z: 3000 },
                                    look : { y:-1.0 },
                                    up : { y: 1.0 }
                                },

                                    /* A lights node inserts lights into the world-space.
                                     * You can have many of these, maybe nested within modelling transforms
                                     * if you want to move them around.
                                     */
                                        SceneJS.lights({
                                            sources: [
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                    diffuse:                true,
                                                    specular:               true,
                                                    dir:                    { x: 1.0, y: -1.0, z: 1.0 }
                                                },
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                    diffuse:                true,
                                                    specular:               true,
                                                    dir:                    { x: -1.0, y: -1.0, z: -3.0 }
                                                }
                                            ]},

                                            /* Next, modelling transforms to orient our airplane
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
                                                        angle: data.get('yaw'), y : 1.0
                                                    };
                                                },
                                                        SceneJS.rotate(function(data) {
                                                            return {
                                                                angle: data.get('pitch'), x : 1.0
                                                            };
                                                        },
                                                            /* Load COLLADA airplane model from the SceneJS
                                                             * model repository
                                                             */
                                                                SceneJS.loadCollada({
//                                                                    uri: "http://www.scenejs.org/library/v0.7/assets/" +
//                                                                         "examples/seymourplane_triangulate/" +
//                                                                         "seymourplane_triangulate.dae",

                                                                      uri: "http://www.scenejs.org/library/v0.7/assets/examples/temple/models/model.dae"//,

                                                                    /* The asset that we want from the COLLADA file
                                                                     */
                                                                    //node: "Model"
                                                                }))
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var pInterval;

var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;


/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = exampleScene.getCanvas();

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;

    /////////////////////////////////////////////////////////////////////////
    clearInterval(pInterval);
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
        pitch += (event.clientY - lastY) * 0.5;
        exampleScene.render({yaw: yaw, pitch: pitch});
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

window.render = function() {
    try {
        exampleScene.render({yaw: yaw, pitch: pitch});
    } catch (e) {
        throw e;
    }
};

/* Continue animation
 */
pInterval = setInterval("window.render()", 10);
