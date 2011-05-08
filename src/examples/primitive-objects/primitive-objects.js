/**
 * SceneJS Example - Primitive objects: sphere, box, disk
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */
SceneJS.createNode({

    type: "scene",
    id: "theScene",
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv",

    nodes: [

        {
            type: "lookAt",
            eye : { x: 0, y: 2, z: -22},
            look : { x : 0.0, y : -1.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [

                {
                    type: "rotate",
                    id: "all-rotate",
                    angle: 0,
                    y: 1.0,

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
                                    id: "light1",
                                    mode:                 "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: 1.0 }
                                },
                                {
                                    type: "light",
                                    id: "light1",
                                    mode:                 "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: -1.0, z: -1.0 }
                                },
                                {
                                    type: "light",
                                    id: "light2",
                                    mode:                 "dir",
                                    color:                  {r: 1.0, g: 1.0, b: 1.0},
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type: "light",
                                    id: "light3",
                                    mode:                 "dir",
                                    color:                  {r: 1.0, g: 1.0, b: 1.0},
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                },

                                {

                                    type: "selector",
                                    id: "filledObjectsSelector",
                                    selection: [1],
                                    nodes: [

                                        // Boxes

                                        {
                                            type: "translate",
                                            x: 0.0,
                                            y: 0.5,
                                            z: 4.0,

                                            nodes: [

                                                {
                                                    type: "rotate",
                                                    id: "box-rotate",
                                                    angle: 0,
                                                    x: 0.2,
                                                    y: 0.8,
                                                    z: 1.0,

                                                    nodes: [

                                                        {
                                                            type: "material",
                                                            baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.2,
                                                            shine:          6.0,

                                                            nodes: [
                                                                {
                                                                    type: "box"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },

                                        // spheres

                                        {
                                            type: "node",

                                            nodes: [

                                                {
                                                    type: "translate",
                                                    x: -4.0,
                                                    y: 2.25,
                                                    z: 1.0,
                                                    nodes: [

                                                        {
                                                            type: "rotate",
                                                            id: "sphere1-rotate",
                                                            angle: 0,
                                                            x: 0.2,
                                                            y: 1.0,

                                                            nodes: [

                                                                {
                                                                    type: "material",
                                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                    specular:       0.2,
                                                                    shine:          6.0,

                                                                    nodes: [
                                                                        {
                                                                            type: "sphere",
                                                                            id: "sphere1",
                                                                            slices: 6,
                                                                            rings: 12
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    type: "translate",
                                                    x: -3.0,
                                                    y: 1.25,
                                                    z: -3.0,

                                                    nodes: [

                                                        {
                                                            type: "scale",
                                                            x: 1.2,
                                                            y: 1.2,
                                                            z: 1.2,

                                                            nodes: [

                                                                {
                                                                    type: "rotate",
                                                                    id: "sphere2-rotate",
                                                                    angle: 0,
                                                                    x: 0.2,
                                                                    y: 1.0,

                                                                    nodes: [

                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 0.9, g: 0.3, b: 0.6 },
                                                                            specularColor:  { r: 0.9, g: 0.3, b: 0.6 },
                                                                            specular:       0.2,
                                                                            shine:          6.0,

                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere",
                                                                                    id: "sphere2",
                                                                                    slices: 24,
                                                                                    rings: 16,
                                                                                    sweep: 0.5,
                                                                                    semiMajorAxis: 1.0
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    type: "translate",
                                                    x: 3.0,
                                                    y: 1.0,
                                                    z: 1.5,

                                                    nodes: [

                                                        {
                                                            type: "scale",
                                                            x: 1.5,
                                                            y: 1.5,
                                                            z: 1.5,

                                                            nodes: [

                                                                {
                                                                    type: "rotate",
                                                                    id: "sphere3-rotate",
                                                                    angle: 90,
                                                                    x: 0.2,
                                                                    z: 1.0,

                                                                    nodes: [

                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 0.2, g: 0.8, b: 0.6 },
                                                                            specularColor:  { r: 0.9, g: 0.3, b: 0.6 },
                                                                            specular:       0.2,
                                                                            shine:          6.0,

                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere",
                                                                                    id: "sphere3",
                                                                                    slices: 24,
                                                                                    rings: 24,
                                                                                    sweep: 0.25,
                                                                                    semiMajorAxis: 1.6
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    type: "translate",
                                                    x: 1.5,
                                                    y: 0.5,
                                                    z: -2.0,

                                                    nodes: [

                                                        {
                                                            type: "scale",
                                                            x: 1.5,
                                                            y: 1.5,
                                                            z: 1.5,

                                                            nodes: [

                                                                {
                                                                    type: "rotate",
                                                                    id: "sphere4-rotate",
                                                                    angle: 90,
                                                                    x: 0.2,
                                                                    z: 1.0,

                                                                    nodes: [

                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 0.8, g: 0.7, b: 0.4 },
                                                                            specularColor:  { r: 0.9, g: 0.3, b: 0.6 },
                                                                            specular:       0.2,
                                                                            shine:          6.0,

                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere",
                                                                                    id: "sphere4",
                                                                                    slices: 24,
                                                                                    rings: 4,
                                                                                    sweep: 1.0,
                                                                                    semiMajorAxis: 1.0
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    type: "translate",
                                                    x: -0.5,
                                                    y: -3.0,
                                                    z: 4.0,

                                                    nodes: [

                                                        {
                                                            type: "scale",
                                                            x: 1.0,
                                                            y: 1.0,
                                                            z: 1.0,

                                                            nodes: [

                                                                {
                                                                    type: "rotate",
                                                                    angle: -20,
                                                                    x: 1.0,

                                                                    nodes: [

                                                                        {
                                                                            type: "rotate",
                                                                            id: "sphere5-rotate",
                                                                            angle: 10,
                                                                            y: 1.0,

                                                                            nodes: [

                                                                                {
                                                                                    type: "material",
                                                                                    baseColor:      { r: 0.8, g: 0.3, b: 0.1 },
                                                                                    specularColor:  { r: 0.9, g: 0.3, b: 0.6 },
                                                                                    specular:       0.2,
                                                                                    shine:          6.0,

                                                                                    nodes: [
                                                                                        {
                                                                                            type: "sphere",
                                                                                            id: "sphere5",
                                                                                            slices: 48,
                                                                                            rings: 48,
                                                                                            radius: 4,
                                                                                            sweep: 1.0,
                                                                                            sliceDepth: 0.25,
                                                                                            semiMajorAxis: 1.0
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
                                        },

                                        // Disks

                                        {
                                            type: "node",

                                            nodes: [

                                                {
                                                    type: "translate",
                                                    x: -3.5,
                                                    y: 1.75,
                                                    z: -0.5,

                                                    nodes: [

                                                        {
                                                            type: "scale",
                                                            x: 0.3,
                                                            y: 0.3,
                                                            z: 0.3,

                                                            nodes: [

                                                                {
                                                                    type: "rotate",
                                                                    id: "disk1-rotate",
                                                                    angle: 60,
                                                                    z: 0.4,
                                                                    x: 1.0,

                                                                    nodes: [

                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 0.8, g: 0.5, b: 0.2 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            specular:       0.2,
                                                                            shine:          6.0,

                                                                            nodes: [

                                                                                {
                                                                                    type: "disk",
                                                                                    id: "disk1",
                                                                                    radius: 5,
                                                                                    height: 2,
                                                                                    rings: 24
                                                                                },

                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    type: "translate",
                                                    x: 4.0,
                                                    y: 1.5,

                                                    nodes: [

                                                        {
                                                            type: "scale",
                                                            x: 0.3,
                                                            y: 0.3,
                                                            z: 0.3,

                                                            nodes: [

                                                                {
                                                                    type: "rotate",
                                                                    id: "disk2-rotate",
                                                                    angle: 0,
                                                                    z: 0.2,
                                                                    x: 1.0,

                                                                    nodes: [

                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 0.3, g: 0.9, b: 0.3 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            specular:       0.2,
                                                                            shine:          6.0,

                                                                            nodes: [

                                                                                {
                                                                                    type: "disk",
                                                                                    id: "disk2",
                                                                                    radius: 6,
                                                                                    // Optional radius (1 is default)
                                                                                    innerRadius: 4,
                                                                                    // Optional innerRadius results in ring (default is 0)
                                                                                    semiMajorAxis: 1.5,
                                                                                    // Optional semiMajorAxis results in ellipse (default of 1 creates circle)
                                                                                    height: 2,
                                                                                    // Optional height (1 is default)
                                                                                    rings: 48,
                                                                                    // Optional number of longitudinal rings (30 is default)
                                                                                    sweep: 0.75          // Optional rotational extrusion (1 is default)
                                                                                },

                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },

                                                {
                                                    type: "translate",
                                                    x: -0.5,
                                                    y: 1.0,
                                                    z: -5,

                                                    nodes: [

                                                        {
                                                            type: "scale",
                                                            x: 0.3,
                                                            y: 0.3,
                                                            z: 0.3,

                                                            nodes: [

                                                                {
                                                                    type: "rotate",
                                                                    id: "disk-triangle-rotate",
                                                                    angle: 60,
                                                                    z: 0.4,
                                                                    x: 1.0,

                                                                    nodes: [

                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 0.9, g: 0.2, b: 0.1 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            specular:       0.2,
                                                                            shine:          6.0,

                                                                            nodes: [

                                                                                {
                                                                                    type: "disk",
                                                                                    id: "disk-triangle",
                                                                                    radius: 5,
                                                                                    // Optional radius (1 is default)
                                                                                    innerRadius: 4,
                                                                                    // Optional innerRadius results in ring (default is 0)
                                                                                    semiMajorAxis: 1.0,
                                                                                    // Optional semiMajorAxis results in ellipse (default of 1 creates circle)
                                                                                    height: 2,
                                                                                    // Optional height (1 is default)
                                                                                    rings: 3,
                                                                                    // Optional number of longitudinal rings (30 is default)
                                                                                    sweep: 1.0           // Optional rotational extrusion (1 is default)
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
                                        },
                                    ]
                                },

                                {
                                    type: "renderer",

                                    flags: {
                                        wireframe: true
                                    },

                                    lineWidth: 1,

                                    nodes: [

                                        {
                                            type: "scale",
                                            x: 1.2,
                                            y: 1.2,
                                            z: 1.2,

                                            nodes: [

                                                {
                                                    type: "material",
                                                    baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                                    specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                                    specular:       0.2,
                                                    shine:          6.0,

                                                    nodes: [

                                                        {

                                                            type: "selector",
                                                            id: "wireframeObjectsSelector",
                                                            selection: [1],

                                                            nodes: [

                                                                // Boxes

                                                                {
                                                                    type: "translate",
                                                                    x: 0,
                                                                    y: -2.5,
                                                                    z: 4.0,
                                                                    nodes: [

                                                                        {
                                                                            type: "rotate",
                                                                            id: "wireframe-box-rotate",
                                                                            angle: -45,
                                                                            x: 1.0,
                                                                            y: 1.0,
                                                                            z: 1.0,
                                                                            nodes: [

                                                                                {
                                                                                    type: "box"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                },

                                                                // Spheres

                                                                {
                                                                    type: "node",

                                                                    nodes: [

                                                                        {
                                                                            type: "translate",
                                                                            x: -3.5,
                                                                            y: -0.5,
                                                                            z: 1.0,

                                                                            nodes: [

                                                                                {
                                                                                    type: "rotate",
                                                                                    id: "wireframe-sphere1-rotate",
                                                                                    angle: 0,
                                                                                    x: 0.2,
                                                                                    z: 1.0,

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "instance",
                                                                                            target: "sphere1"
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        },

                                                                        {
                                                                            type: "translate",
                                                                            x: -2.5,
                                                                            y: -1.5,
                                                                            z: -2.5,

                                                                            nodes: [

                                                                                {
                                                                                    type: "rotate",
                                                                                    id: "wireframe-sphere2-rotate",
                                                                                    angle: 0,
                                                                                    x: 0.2,
                                                                                    z: 1.0,

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "instance",
                                                                                            target: "sphere2"
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        },

                                                                        {
                                                                            type: "translate",

                                                                            x: 3.0,
                                                                            y: 1.0,
                                                                            z: 1.5,

                                                                            x: 3.25,
                                                                            y: -2.0,
                                                                            z: 2.0,

                                                                            nodes: [

                                                                                {
                                                                                    type: "rotate",
                                                                                    id: "wireframe-sphere3-rotate",
                                                                                    angle: 0,
                                                                                    x: 0.2,
                                                                                    z: 1.0,

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "instance",
                                                                                            target: "sphere3"
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        },

                                                                        {
                                                                            type: "translate",
                                                                            x: 1.25,
                                                                            y: -2.0,
                                                                            z: -3.0,

                                                                            nodes: [

                                                                                {
                                                                                    type: "rotate",
                                                                                    id: "wireframe-sphere4-rotate",
                                                                                    angle: 0,
                                                                                    x: 0.2,
                                                                                    z: 1.0,

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "instance",
                                                                                            target: "sphere4"
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        },

                                                                        {
                                                                            type: "translate",

                                                                            x: -0.5,
                                                                            y: -4.0,
                                                                            z: 5.0,

                                                                            nodes: [

                                                                                {
                                                                                    type: "scale",
                                                                                    x: 0.75,
                                                                                    y: 0.75,
                                                                                    z: 0.75,

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "rotate",
                                                                                            id: "wireframe-sphere5-rotate",
                                                                                            angle: -10,
                                                                                            y: 1.0,

                                                                                            nodes: [

                                                                                                {
                                                                                                    type: "instance",
                                                                                                    target: "sphere5"
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                },

                                                                // Disks

                                                                {
                                                                    type: "node",

                                                                    nodes: [
                                                                        {
                                                                            type: "translate",
                                                                            x: -3.75,
                                                                            y: -1.0,
                                                                            z: -0.75,

                                                                            nodes: [

                                                                                {
                                                                                    type: "rotate",
                                                                                    id: "wireframe-disk1-rotate",
                                                                                    angle: -45,
                                                                                    x: 1.0,
                                                                                    y: 1.0,
                                                                                    z: 1.0,
                                                                                    nodes: [

                                                                                        {
                                                                                            type: "scale",
                                                                                            x: 0.2,
                                                                                            y: 0.2,
                                                                                            z: 0.2,

                                                                                            nodes: [

                                                                                                {
                                                                                                    type: "instance",
                                                                                                    target: "disk1"
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        },

                                                                        {
                                                                            type: "translate",
                                                                            x: 3.25,
                                                                            y: -1.75,

                                                                            nodes: [

                                                                                {
                                                                                    type: "scale",
                                                                                    x: 0.3,
                                                                                    y: 0.3,
                                                                                    z: 0.3,

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "rotate",
                                                                                            id: "wireframe-disk2-rotate",
                                                                                            angle: 60,
                                                                                            z: 0.4,
                                                                                            x: 1.0,

                                                                                            nodes: [

                                                                                                {
                                                                                                    type: "instance",
                                                                                                    target: "disk2"
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        },

                                                                        {
                                                                            type: "translate",
                                                                            x: -0.75,
                                                                            y: -1.5,
                                                                            z: -4.5,

                                                                            nodes: [

                                                                                {
                                                                                    type: "scale",
                                                                                    x: 0.3,
                                                                                    y: 0.3,
                                                                                    z: 0.3,

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "rotate",
                                                                                            id: "wireframe-disk-triangle-rotate",
                                                                                            angle: 60,
                                                                                            z: 0.4,
                                                                                            x: 1.0,

                                                                                            nodes: [

                                                                                                {
                                                                                                    type: "instance",
                                                                                                    target: "disk-triangle"
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

SceneJS.withNode("theScene").render();

var rotation = document.getElementById("rotation");

// Specular light

var specular_light = document.getElementById("specular-light");
var light1 = SceneJS.withNode("light1");
var light2 = SceneJS.withNode("light2");
var light3 = SceneJS.withNode("light3");

function specularLightChange() {
    if (specular_light.checked) {
        light1.set({ specular: true });
        light2.set({ specular: true });
        light3.set({ specular: true });
    } else {
        light1.set({ specular: false });
        light2.set({ specular: false });
        light3.set({ specular: false });
    }
}

specular_light.onchange = specularLightChange;
specular_light.onchange();

var filled_objects_selector = SceneJS.withNode("filledObjectsSelector");
var wireframe_objects_selector = SceneJS.withNode("wireframeObjectsSelector");


var choose_object_type = document.getElementById("choose-object-type");
var object_type_selection;

for (var i = 0; i < choose_object_type.elements.length; i++)
    if (choose_object_type.elements[i].checked) object_type_selection = choose_object_type.elements[i].value;

function chooseObjectType() {
    for (var i = 0; i < this.elements.length; i++)
        if (this.elements[i].checked) object_type_selection = this.elements[i].value;
    switch (object_type_selection) {
        case "boxes":
            filled_objects_selector.set("selection", [0]);
            wireframe_objects_selector.set("selection", [0]);
            break;
        case 'spheres':
            filled_objects_selector.set("selection", [1]);
            wireframe_objects_selector.set("selection", [1]);
            break;
        case "disks":
            filled_objects_selector.set("selection", [2]);
            wireframe_objects_selector.set("selection", [2]);
            break;
    }
}

choose_object_type.onchange = chooseObjectType;
choose_object_type.onchange();

var all_rotate = SceneJS.withNode("all-rotate");

var disk1_rotate = SceneJS.withNode("disk1-rotate");
var disk2_rotate = SceneJS.withNode("disk2-rotate");
var disk_triangle_rotate = SceneJS.withNode("disk-triangle-rotate");
var wireframe_disk1_rotate = SceneJS.withNode("wireframe-disk1-rotate");
var wireframe_disk2_rotate = SceneJS.withNode("wireframe-disk2-rotate");
var wireframe_disk_triangle_rotate = SceneJS.withNode("wireframe-disk-triangle-rotate");

var sphere1_rotate = SceneJS.withNode("sphere1-rotate");
var sphere2_rotate = SceneJS.withNode("sphere2-rotate");
var sphere3_rotate = SceneJS.withNode("sphere3-rotate");
var sphere4_rotate = SceneJS.withNode("sphere4-rotate");
var sphere5_rotate = SceneJS.withNode("sphere5-rotate");
var wireframe_sphere1_rotate = SceneJS.withNode("wireframe-sphere1-rotate");
var wireframe_sphere2_rotate = SceneJS.withNode("wireframe-sphere2-rotate");
var wireframe_sphere3_rotate = SceneJS.withNode("wireframe-sphere3-rotate");
var wireframe_sphere4_rotate = SceneJS.withNode("wireframe-sphere4-rotate");
var wireframe_sphere5_rotate = SceneJS.withNode("wireframe-sphere5-rotate");

var box_rotate = SceneJS.withNode("box-rotate");
var wireframe_box_rotate = SceneJS.withNode("wireframe-box-rotate");

var yaw = all_rotate.get("angle");

var lastX;
var lastY;
var dragging = false;

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
        yaw += (event.clientX - lastX) * -0.5;

        all_rotate.set("angle", yaw);
        // SceneJS.withNode("theScene").render();

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

SceneJS.withNode("theScene").start({
    idleFunc:function() {
        if (rotation.checked) {
            var angle = disk1_rotate.get("angle") + 0.3;
            disk1_rotate.set("angle", angle);
            disk2_rotate.set("angle", angle);
            disk_triangle_rotate.set("angle", angle);
            wireframe_disk1_rotate.set("angle", angle);
            wireframe_disk2_rotate.set("angle", angle);
            wireframe_disk_triangle_rotate.set("angle", angle);

            sphere1_rotate.set("angle", angle);
            sphere2_rotate.set("angle", angle);
            sphere3_rotate.set("angle", angle);
            sphere4_rotate.set("angle", angle);
            sphere5_rotate.set("angle", angle);
            wireframe_sphere1_rotate.set("angle", angle);
            wireframe_sphere2_rotate.set("angle", angle);
            wireframe_sphere3_rotate.set("angle", angle);
            wireframe_sphere4_rotate.set("angle", angle);
            wireframe_sphere5_rotate.set("angle", angle);

            box_rotate.set("angle", angle);
            wireframe_box_rotate.set("angle", angle);

            yaw = all_rotate.get("angle");
            yaw += + 0.1;
            all_rotate.set("angle", yaw);
        }

    }
});
