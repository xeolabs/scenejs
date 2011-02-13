/*
 Demonstration of how to apply a texture to the specular relection component of a material.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

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
            eye : { x: 0, y: 0, z: -10 },
            look : { x: 0, y: 0, z: 0 },
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
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "rotate",
                            id: "yaw",
                            y: 1,
                            nodes: [
                                {
                                    type: "rotate",
                                    id: "pitch",
                                    x: 1,
                                    nodes: [
                                        {
                                            type: "scale",
                                            x: 2,
                                            y: 2,
                                            z: 2,
                                            nodes: [

                                                /*------------------------------------------------------------------
                                                 * Texture with texture layers applied to base color and specularity
                                                 *----------------------------------------------------------------*/
                                                {
                                                    type: "texture",
                                                    layers: [

                                                        /*---------------------------------------------------------
                                                         * Underlying texture layer applied to the Earth material's
                                                         * baseColor to render the continents, oceans etc.
                                                         *--------------------------------------------------------*/
                                                        {
                                                            uri: "images/earth.jpg",
                                                            applyTo:"baseColor",
                                                            blendMode: "multiply",
                                                            flipY: false
                                                        },

                                                        /*---------------------------------------------------------
                                                         * Second texture layer applied to the Earth material's
                                                         * specular component to make the ocean shiney.
                                                         *--------------------------------------------------------*/
                                                        {
                                                            uri: "images/earth-specular.gif",
                                                            applyTo:"specular",
                                                            blendMode:"multiply",
                                                            flipY: false
                                                        }
                                                        ,

                                                        /*---------------------------------------------------------
                                                         * Second texture layer applied to the Earth material's
                                                         * emission component to show lights on the dark side.
                                                         *--------------------------------------------------------*/
                                                        {
                                                            uri: "images/earth-lights.gif",
                                                            applyTo:"emit",
                                                            blendMode:"multiply",
                                                            flipY: false
                                                        }
                                                    ],

                                                    /*---------------------------------------------------------
                                                     * Sphere with some material
                                                     *--------------------------------------------------------*/
                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            z: 1,
                                                            angle : 195,
                                                            nodes: [
                                                                {
                                                                    type: "rotate",
                                                                    y: 1,
                                                                    id: "earth-rotate",
                                                                    nodes: [
                                                                        {
                                                                            type: "material",
                                                                            specular: 5,
                                                                            shine:100,
                                                                            emit: 0.6,
                                                                            baseColor: {r: 1, g: 1, b: 1},
                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere"
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

var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

var posZ = -10;

var earthRotate = 0;

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

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

function mouseWheel(event) {
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
            posZ -= 0.6;
        } else {
            posZ += 0.6;
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;


}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('mousewheel', mouseWheel, true);

canvas.addEventListener('DOMMouseScroll', mouseWheel, true);


SceneJS.withNode("the-scene").start({
    idleFunc: function() {
        SceneJS.withNode("earth-rotate").set("angle", earthRotate);
        SceneJS.withNode("pitch").set("angle", pitch);
        SceneJS.withNode("yaw").set("angle", yaw);
        SceneJS.withNode("yaw").set("angle", yaw);
        SceneJS.withNode("the-lookat").set({ eye: { x: 0, y: 0, z: posZ } });

        earthRotate -= 0.4;
    }
});


/*------------------------------------------------------------------
 * Observe "loading-status" events on the scene graph - these will
 * tell us the count of texture nodes that have finished loading
 * their textures. We'll open a "please wait" dialog when there
 * are textures loading, then close it when all textures have
 * loaded.
 *
 * See here for more info on "loading-status" events:
 *  
 *
 *-----------------------------------------------------------------*/

var $dialog = $('<div></div>')
        .html('<br/><p>Loading textures, please wait</p>')
        .dialog({
    autoOpen: false,
    title: 'Just a second..'
});


var dialogOpen = false;

SceneJS.withNode("the-scene").bind("loading-status",

        function(event) {
            var params = event.params;

            if (params.numNodesLoading > 0) {
                if (!dialogOpen) {
                    $dialog.dialog('open');
                    dialogOpen = true;
                }
            } else {
                if (dialogOpen) {
                    $dialog.dialog('close');
                    dialogOpen = false;
                }
            }
        });



