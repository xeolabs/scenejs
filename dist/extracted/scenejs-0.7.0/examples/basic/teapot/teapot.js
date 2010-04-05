/*
 Introductory SceneJS scene which renders the venerable OpenGL teapot.

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
                    clearColor: { r:0.0, g: 0.0, b: 0.0 },
                    enableTexture2D: true
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

                                    /* A lights node inserts lights into the world-space.
                                     * You can have many of these, maybe nested within modelling transforms
                                     * if you want to move them around.
                                     */
                                        SceneJS.lights({
                                            sources: [
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: .8, g: 0.8, b: 0.8 },
                                                    diffuse:                true,
                                                    specular:               false,
                                                    pos:                    { x: 100.0, y: 4.0, z: -100.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                }
                                                ,
                                                {
                                                    type:                   "point",
                                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                    diffuse:                true,
                                                    specular:               true,
                                                    pos:                    { x: 100.0, y: -100.0, z: -100.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                },
                                                {
                                                    type:                   "point",
                                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                    diffuse:                true,
                                                    specular:               true,
                                                    pos:                    { x: -1000.0, y: -1000.0, z: 0.0 },
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

                                                            /* Specify teapot's material colour properties
                                                             */
                                                                SceneJS.material({
                                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                    specular:       0.9,
                                                                    shine:          6.0
                                                                },

                                                                    /* Teapot's geometry
                                                                     */     SceneJS.texture({

                                                            /* A texture can have multiple layers, each applying an
                                                             * image to a different material reflection component.
                                                             * This layer applies the Zod image to the diffuse
                                                             * component, with animated scaling.
                                                             */
                                                            layers: [
                                                                {
                                                                    uri:"http://scenejs.org/library/textures/misc/general-zod.jpg",
                                                                    minFilter: "linear",
                                                                    magFilter: "linear",
                                                                    wrapS: "repeat",
                                                                    wrapT: "repeat",
                                                                    isDepth: false,
                                                                    depthMode:"luminance",
                                                                    depthCompareMode: "compareRToTexture",
                                                                    depthCompareFunc: "lequal",
                                                                    flipY: false,
                                                                    width: 1,
                                                                    height: 1,
                                                                    internalFormat:"lequal",
                                                                    sourceFormat:"alpha",
                                                                    sourceType: "unsignedByte",
                                                                    applyTo:"baseColor"}]},
                                                                          SceneJS.objects.sphere()),
                                                                        SceneJS.objects.teapot()
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

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = exampleScene.getCanvas();

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



