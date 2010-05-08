/**
 * SceneJS Example - Switchable Viewpoint using the Symbol, Instance and Selector Nodes.
 *
 * This example 
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 *
 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

    // Perspective transform

        SceneJS.perspective({
            fovy : 65.0, aspect : 1.0, near : 0.40, far : 300.0
        },

            //--------------------------------------------------------------------------------------------------------------
            // The scene content, a teapot illuminated by two light sources.
            // We'll defined it within a Symbol that will be referenced by an
            // Instance node within each child of our Selector, down below.
            //--------------------------------------------------------------------------------------------------------------

                SceneJS.symbol({ name: "theScene" },
                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: 1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.8, g: 0.8, b: 0.8 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -2.0, y: -1.0, z: 0.0 }
                                }
                            ]},
                                SceneJS.material({
                                    baseColor:      { r: 0.6, g: 0.9, b: 0.6 },
                                    specularColor:  { r: 0.6, g: 0.9, b: 0.6 },
                                    specular:       0.9,
                                    shine:          6.0
                                },
                                        SceneJS.objects.teapot()))),

            //------------------------------------------------------------------------------------------------------
            // Our Selector node selects one of three LookAt child nodes
            // to provide the current view point. Each LookAt contains an
            // instance of the scene content.
            //------------------------------------------------------------------------------------------------------

                SceneJS.selector(function(data) {
                    return {
                        selection: [data.get("activeCamera")]
                    };
                },

                    // First view point - looking down the -Z axis

                        SceneJS.lookAt({
                            eye : { z: 10.0 }
                        },
                                SceneJS.instance({ name: "theScene"})),

                    // Second view point - looking down the -X axis

                        SceneJS.lookAt({
                            eye : { x: 10.0 }
                        },
                                SceneJS.instance({ name: "theScene"})),

                    // Third view point - oblique

                        SceneJS.lookAt({
                            eye : { x: -5.0, y: 5, z: 5 }
                        },
                                SceneJS.instance({ name: "theScene" })))));

//------------------------------------------------------------------------------------------------------------------
// Mouse handler and scene render calls - whenever the mouse is clicked, switch cameras and re-render scene.
//------------------------------------------------------------------------------------------------------------------

var activeCamera = 0;
var canvas = document.getElementById(exampleScene.getCanvasId());

exampleScene.render({activeCamera: activeCamera });

function mouseClick() {
    activeCamera = (activeCamera + 1) % 3;
    exampleScene.render({activeCamera: activeCamera});
}

canvas.addEventListener('click', mouseClick, true);



