/*
 Custom Command Demo - clip.clipbox<

 The SceneJS API has an extensible messaging system which allows us to drive the JSON Scene Graph API via commands.

 We can add more commands to the message API by installing our own command handlers.

 This example demonstrates the "clip.clipbox" plugin, which defines a command that creates a clip box
 around a target sphere node within our scene graph.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */

/*----------------------------------------------------------------------
 * Scene graph definition
 *---------------------------------------------------------------------*/

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

    nodes:[

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

                        /* A lights node inserts  point lights into the world-space.
                         * You can have many of these, nested within modelling transforms
                         * if you want to move them around.
                         */
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },


                        /* Next, modelling transforms to orient our sphere. See how these have IDs,
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
                                    angle: -30.0,
                                    y : 1.0,

                                    nodes: [

                                        /* This is where we'll insert our clipbox when we
                                         * issue the "clip.clipbox.create" command:
                                         */
                                        {
                                            type: "node",
                                            id: "insert-clipbox-here",

                                            nodes:[

                                                /* Blue colour for our shere
                                                 */
                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          100.0,

                                                    nodes: [

                                                        /** Pump the sphere size up a bit:
                                                         */
                                                        {
                                                            type: "scale",
                                                            x:1.2,
                                                            y:1.2,
                                                            z:1.2,

                                                            nodes: [

                                                                {
                                                                    type : "sphere"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                /* Red colour for our inner shere
                                                 */
                                                {
                                                    type: "material",
                                                    emit: 0,
                                                    baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                                    specularColor:  { r: 0.9, g: 0.3, b: 0.3 },
                                                    specular:       0.9,
                                                    shine:          100.0,

                                                    /* Disable clipping for the inner red sphere
                                                     */
                                                    flags: {
                                                        clipping: false
                                                    },

                                                    nodes: [

                                                        /** Pump the sphere size up a bit:
                                                         */
                                                        {
                                                            type: "scale",
                                                            x:.7,
                                                            y:.7,
                                                            z:.7,

                                                            nodes: [

                                                                /* Sphere geometry
                                                                 */
                                                                {
                                                                    type : "sphere"
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
 * Insert a clipbox, then tweak it a bit
 *---------------------------------------------------------------------*/

/* Right, lets issue the "clip.clipbox.create" command to
 * create a clipbox around the sphere:
 */
SceneJS.Message.sendMessage({

    command:"clip.clipbox.create",

    target: "insert-clipbox-here",

    xmin: -1.2,
    ymin: -1.2,
    zmin: -1.2,
    xmax: 1.2,
    ymax: 1.2,
    zmax: 1.2
});

/* Now we'll issue the "clip.clipbox.update" command to tweak the
 * boundary of the clipbox, to extend its extents on X,Y,Z axis:
 */
SceneJS.Message.sendMessage({

    command:"clip.clipbox.update",

    target: "insert-clipbox-here",

    ymin: -2.0,
    xmax: 2.0,
    zmax: 2.0
});


/*------------------------------------------------------------------------------------------------------------------
 * SceneJS debug modes
 *----------------------------------------------------------------------------------------------------------------*/

SceneJS.setDebugConfigs({

    /* Enable scene compilation - see http://scenejs.wikispaces.com/V0.8+Branch
     */
    compilation : {
        enabled: false
        //        ,
        //        logTrace : {}
    }
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var yaw = -30;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

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

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);


/* Start the scene - more info: http://scenejs.wikispaces.com/scene#Starting
 */
SceneJS.withNode("theScene").start({
    fpd: 60,
    idleFunc: function() {
        // ...
    }
});

var factor = 0.0;

window.updateAnimations = function() {

    /* We'll periodically issue the "clip.clipbox.update" command to tweak the
     * boundary of the clipbox, to extend its extents on X,Y,Z axis:
     */
    var extent = 1.0 + Math.sin(factor) * 1.0;
    factor += 0.008;

    SceneJS.Message.sendMessage({

        command:"clip.clipbox.update",

        target: "insert-clipbox-here",

        ymax: extent
    });

};

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.updateAnimations()", 10);


