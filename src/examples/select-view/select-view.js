/**
 * SceneJS Example - Switchable Viewpoint using the Library, Instance and Selector Nodes.
 *
 * This example demonstrates these nodes by defining three LookAt (view transform) nodes that can be switched with
 * a Selector. Each LookAt contains an Instance of the scene content, which is defined as library components
 * within a Library node.
 *
 * Click the mouse to switch between the viewpoints.
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * January 2010
 */
SceneJS.createScene({

    type: "scene",
    id: "theScene",

    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [

        //--------------------------------------------------------------------------------------------------------------
        // The scene content, a teapot illuminated by two light sources.

        // We'll defined it within a Camera that will be referenced
        // by an Instance node within each child of our Selector, down below.
        //
        // The Camera is wrapped in a Library, which causes initial traversal to
        // bypass it - it will only be rendered via an instantiation link.
        //--------------------------------------------------------------------------------------------------------------

        {
            type: "library",

            nodes: [
                {
                    type: "camera",
                    id: "theCamera",

                    optics: {
                        type: "perspective",
                        fovy : 65.0,
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
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -2.0, y: -1.0, z: 0.0 },

                            nodes: [
                                {
                                    type: "material",
                                    baseColor:      { r: 0.6, g: 0.9, b: 0.6 },
                                    specularColor:  { r: 0.6, g: 0.9, b: 0.6 },
                                    specular:       0.9,
                                    shine:          6.0,

                                    nodes: [
                                        {
                                            type: "teapot"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },

        //------------------------------------------------------------------------------------------------------
        // Our Selector node selects one of three LookAt child nodes
        // to provide the current view point. Each LookAt contains an
        // instance of the Camera.
        //------------------------------------------------------------------------------------------------------

        {
            type: "selector",
            id: "mySelector",
            selection: [0],
            nodes: [
                {
                    type: "lookAt",
                    up: { y: 1.0 },
                    eye : { z: 10.0 },
                    nodes: [
                        {
                            type: "instance",
                            target: "theCamera"
                        }
                    ]
                },

                {
                    type: "lookAt",
                    up: {y: 1.0},
                    eye : { x: 10.0 },
                    nodes: [
                        {
                            type: "instance",
                            target: "theCamera"
                        }
                    ]
                },
                {
                    type: "lookAt",
                    up: { y: 1.0 },
                    eye : { x: -5.0, y: 5, z: 5 },
                    nodes: [
                        {
                            type: "instance",
                            target: "theCamera"
                        }
                    ]
                }
            ]
        }
    ]
});

//------------------------------------------------------------------------------------------------------------------
// Mouse handler and scene render calls - whenever the mouse is clicked, switch views and re-render scene.
//------------------------------------------------------------------------------------------------------------------

var activeView = 0;
var canvas = document.getElementById("theCanvas");

SceneJS.scene("theScene").start();

function mouseClick() {
    activeView = (activeView + 1) % 3;
    SceneJS.scene("theScene").findNode("mySelector").set("selection", [activeView]);
}

canvas.addEventListener('click', mouseClick, true);



