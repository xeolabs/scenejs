/*
 Introductory SceneJS scene which renders the venerable OpenGL teapot.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 To render the teapot, SceneJS will traverse the scene in depth-first order. Each node will set some
 WebGL state on visit, then un-set it again before exit. In this graph, the root
 scene node binds to a Canvas element, then the rest of the nodes specify various transforms, lights,
 material properties, all wrapping a teapot geometry node.

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 updated on rotate nodes from mouse input.

 */

SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv",

    nodes: [

        /* Viewing transform specifies eye position, looking
         * at the origin by default
         */
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: -15 },
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


                        /* A lights node inserts point lights into scene, to illuminate everything
                         * that is encountered after them during scene traversal.
                         *
                         * You can have many of these, nested within modelling transforms if you want to move them.
                         */
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.5, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 0.8 },
                            diffuse:                true,
                            specular:               false,
                            dir:                    { x: 0.0, y: 0.5, z: -1.0 }
                        },

                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                         * so we can access them to set their angle attributes.
                         */
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

                                        /* Specify the amounts of ambient, diffuse and specular
                                         * lights our teapot reflects
                                         */
                                        {
                                            type: "material",
                                            emit: 0,
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.7,
                                            shine:          10.0,

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
});


/*----------------------------------------------------------------------
 * Enable scene graph compilation (disabled by default in V0.8).
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

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

//SceneJS.setDebugConfigs({
//
//    shading : {
//        whitewash : true
//    }
//});

SceneJS.withNode("theScene").render();

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



