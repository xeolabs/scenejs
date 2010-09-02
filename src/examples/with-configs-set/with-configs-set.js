/*
 Using the SceneJS.WithConfig node to set the properties of viewing and modelling transform nodes
 within its subgraph.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

    /*---------------------------------------------------------------------------------------
     * A WithConfigs node creates a hierarchical map of values to set on the
     * methods of the nodes within its subgraph as they are is rendered.
     *
     * The keys starting with '#' locate their target nodes by their SIDs.
     *
     * SIDs were introduced in V0.7.6 - an SID is a subidentifier that uniquely
     * identifies its node within the scope of its parent.
     *
     * The keys starting with "-" map to "removeXXX" methods, "+" maps to "addXXX"
     * methods, and keys with no prefix map to "setXXX" methods.
     *
     * More info on SceneJS.WithConfigs at http://scenejs.wikispaces.com/SceneJS.WithConfigs
     *
     *--------------------------------------------------------------------------------------*/

        SceneJS.withConfigs({

            /* The configs map
             */
            configs: {
                "#viewpoint": {
                    eye: { x: 0.0, y: 10.0, z: -15 },
                    look : { y:1.0 },
                    up : { y: 1.0 },

                    "#pitch": {
                        angle: 180,  // <--------- Causes the teapot to flip upside down

                        "#yaw" : {
                            angle: 200
                        }
                    }
                }
            }
        },

            /*-------------------------------------------------------------------------------------------------------
             * This LookAt node orients and positions its Camera child node. Its eye, look and up properties will be
             * set by the WithConfigs when rendered, but we'll define them on the LookAts configuration just to
             * show what they are.
             *-----------------------------------------------------------------------------------------------------*/

                SceneJS.lookAt({

                    sid: "viewpoint",                   // The WithConfigs locates this LookAt using its SID

                    eye : { x: 0.0, y: 0.0, z: 10 },    // Don't really need to define eye, look and up because
                    look : { y: 0.0 },                  // they will be overridden by the WithConfigs node, but
                    up : { y: 1.0 }                     // we'll do so for illustration purposes
                },
                    /* Camera describes the projection
                     */
                        SceneJS.camera({
                            optics: {
                                type: "perspective",
                                fovy : 25.0,
                                aspect : 1.47,
                                near : 0.10,
                                far : 300.0  }
                        },

                            /* A lights node inserts  point lights into the world-space.
                             * You can have many of these, nested within modelling transforms
                             * if you want to move them around.
                             */
                                SceneJS.light({
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                }),
                                SceneJS.light({
                                    type:                   "dir",
                                    color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                }),
                                SceneJS.light({
                                    type:                   "dir",
                                    color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                }),

                            /*---------------------------------------------------------------------------------
                             * These Rotate nodes orient our teapot in model space. Their angles and vectors
                             * will be overridden by the WithConfigs node, so we don't really need to define
                             * those in the configs. We'll define them anyway to show what they are.
                             *-------------------------------------------------------------------------------*/

                                SceneJS.rotate({
                                    sid: "pitch",            // SID
                                    angle: 30,
                                    x : 1.0
                                },

                                        SceneJS.rotate({
                                            sid: "yaw",     // SID
                                            angle: 0,
                                            y : 1.0
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
                                                                SceneJS.teapot()
                                                                )
                                                        )
                                                )
                                        ) // rotate
                                ) // lookAt
                        ) // perspective
                ) // withConfigs
        )
        ; // scene


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

/* Throw the switch, Igor!
 * We render the scene, injecting the initial angles for the rotate nodes.
 */
exampleScene
        .setConfigs({ "#pitch": { angle: pitch, "#yaw": { angle: yaw } } })
        .render();

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

        exampleScene
                .setConfigs({ "#pitch": { angle: pitch, "#yaw": { angle: yaw } } })
                .render();

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);



