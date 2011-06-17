/*
 Demonstration of how to apply a texture to the specular relection component of a material.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
SceneJS.createScene({
    type: "scene",
    id: "the-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

  

    nodes: [
        {
            type: "lookAt",
            id: "the-lookat",
            eye : { x: 0, y: 0, z: 10 },
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
                        far : 600.0
                    },
                    nodes: [

                      
                            
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.5, y: -0.5, z: -0.75 }
                        },
                        {
                            type: "rotate",
                            id: "pitch",
                            x: 1,
                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    y: 1,
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
                                                            type: "scale",
                                                            x: 2,
                                                            y: 2,
                                                            z: 2,

                                                            flags: {
                                                                enabled: true
                                                            },
                                                            layer: "surface-layer",

                                                            nodes: [

                                                                /*------------------------------------------------------------------
                                                                 * Texture with texture layers applied to base color and specularity
                                                                 *----------------------------------------------------------------*/
                                                                {
                                                                    type: "texture",
                                                                    layers: [


                                                                        //                                                                        {
                                                                        //                                                                            uri:"images/earthbump.jpg",
                                                                        //                                                                            minFilter: "linear",
                                                                        //                                                                            magFilter: "linear",
                                                                        //                                                                            wrapS: "repeat",
                                                                        //                                                                            wrapT: "repeat",
                                                                        //                                                                            isDepth: false,
                                                                        //                                                                            depthMode:"luminance",
                                                                        //                                                                            depthCompareMode: "compareRToTexture",
                                                                        //                                                                            depthCompareFunc: "lequal",
                                                                        //                                                                            flipY: false,
                                                                        //                                                                            width: 1,
                                                                        //                                                                            height: 1,
                                                                        //                                                                            internalFormat:"lequal",
                                                                        //                                                                            sourceFormat:"alpha",
                                                                        //                                                                            sourceType: "unsignedByte",
                                                                        //                                                                            applyTo:"normals",
                                                                        //                                                                            blendMode: "multiply"
                                                                        //                                                                        }
                                                                        //                                                                        ,

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
                                                                        } ,
                                                                        //

                                                                        /*---------------------------------------------------------
                                                                         * Second texture layer applied to the Earth material's
                                                                         * emission component to show lights on the dark side.
                                                                         *--------------------------------------------------------*/
                                                                        {
                                                                            uri: "images/earth-lights.gif",
                                                                            applyTo:"emit",
                                                                            blendMode:"add",
                                                                            flipY: false
                                                                        }
                                                                    ],

                                                                    /*---------------------------------------------------------
                                                                     * Sphere with some material
                                                                     *--------------------------------------------------------*/
                                                                    nodes: [

                                                                        {
                                                                            type: "material",
                                                                            specular: 5,
                                                                            shine:100,
                                                                            emit: 0.0,
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
                                                        },

                                                        {
                                                            type: "scale",
                                                            x: 2.05,
                                                            y: 2.05,
                                                            z: 2.05,

                                                            flags: {
                                                                transparent: true,
                                                                enabled: true,
                                                                specular:false,
                                                                blendFunc: {
                                                                    sfactor: "srcAlpha",
                                                                    dfactor: "one"
                                                                }
                                                            },

                                                            layer: "cloud-layer",

                                                            nodes: [

                                                                /*------------------------------------------------------------------
                                                                 *
                                                                 *----------------------------------------------------------------*/

                                                                {
                                                                    type: "texture",
                                                                    layers: [

                                                                        /*---------------------------------------------------------
                                                                         *  Alpha map
                                                                         *
                                                                         *--------------------------------------------------------*/

                                                                        {
                                                                            uri: "images/earthclouds.jpg",
                                                                            applyTo:"alpha",
                                                                            blendMode: "multiply",
                                                                            flipY: false
                                                                        }

                                                                    ],

                                                                    /*---------------------------------------------------------
                                                                     * Sphere with some material
                                                                     *--------------------------------------------------------*/

                                                                    nodes: [
                                                                        {
                                                                            type: "node",
                                                                            z: 1,
                                                                            angle : 195,
                                                                            nodes: [
                                                                                {
                                                                                    type: "rotate",
                                                                                    y: 1,
                                                                                    id: "clouds-rotate",
                                                                                    nodes: [
                                                                                        {
                                                                                            type: "material",
                                                                                            specular: 0,
                                                                                            shine:0.0001,
                                                                                            emit: 0.0,
                                                                                            alpha: 1,
                                                                                            baseColor: {
                                                                                                r: 1, g: 1, b: 1
                                                                                            },
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
                }
            ]
        }
    ]
});


var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

var posZ = 10;

var earthRotate = 0;
var cloudsRotate = 0;

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
        yaw += (event.clientX - lastX) * 0.3;
        pitch += (event.clientY - lastY) * 0.3;

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


var scene = SceneJS.scene("the-scene");

scene.set("layers", [
    "surface-layer",
    "cloud-layer"
]);

scene.start({
    idleFunc: function() {
        scene.findNode("earth-rotate").set("angle", earthRotate);
        scene.findNode("clouds-rotate").set("angle", cloudsRotate);
        scene.findNode("pitch").set("angle", pitch);
        scene.findNode("yaw").set("angle", yaw);
        scene.findNode("yaw").set("angle", yaw);
        scene.findNode("the-lookat").set({ eye: { x: 0, y: 0, z: posZ } });

        //   earthRotate -= 0.4;
        cloudsRotate -= 0.06;
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

scene.bind("loading-status",

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



