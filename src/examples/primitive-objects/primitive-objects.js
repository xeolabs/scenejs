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
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  {r: 1.0, g: 1.0, b: 1.0},
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  {r: 1.0, g: 1.0, b: 1.0},
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },
                        
                        {
                            type: "translate",
                            x: -4.0,
                            y: 2.25,
                            nodes: [
                            
                                {
                                    type: "rotate",
                                    id: "sphere-rotate",
                                    angle: 0,
                                    x: 0.2,
                                    y: 1.0,
                                    
                                    nodes: [

                                        {
                                            type: "material",
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0,
        
                                            nodes: [
                                                {
                                                    type: "sphere",
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
                            x: 4.0,
                            y: 2.25,
                            
                            nodes: [
                            
                                {
                                    type: "rotate",
                                    id: "disk-rotate",
                                    angle: 0,
                                    z: 0.2,
                                    x: 1.0,
                                    
                                    nodes: [
                                    
                                        {
                                            type: "material",
                                            baseColor:      { r: 0.3, g: 0.9, b: 0.3 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0,
        
                                            nodes: [
                                                {
                                                    type: "disk",
                                                    rings: 12,
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        
                        {
                            type: "translate",
                            x: 0.0,
                            y: 0.5,
                            
                            nodes: [
                            
                                {
                                    type: "rotate",
                                    id: "box-rotate",
                                    angle: 0,
                                    x: 0.2,
                                    z: 1.0,
                                    
                                    nodes: [
                                    
                                        {
                                            type: "material",
                                            baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
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
                        

                        {
                             type: "renderer",
                        
                             wireframe: true,
                             lineWidth: 1,
                        
                             nodes: [
                        
                                 {
                                     type: "scale",
                                     x: 1.5,
                                     y: 1.5,
                                     z: 1.5,

                                     nodes: [

                                         {
                                             type: "material",
                                             baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                             specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                             specular:       0.9,
                                             shine:          6.0,

                                             nodes: [

                                                {
                                                    type: "translate",
                                                    x: -3.0,
                                                    y: -0.5,
                                                    nodes: [
                
                                                        {
                                                            type: "sphere",
                                                            slices: 6,
                                                            rings: 12
                                                        }
                                                    ]
                                                },
                                        
                                                {
                                                    type: "translate",
                                                    x: 3.25,
                                                    y: -0.5,
                                                    nodes: [

                                                        {
                                                            type: "disk",
                                                            rings: 12,
                                                        }
                                                    ]
                                                },
                                        
                                                {
                                                    type: "translate",
                                                    x: 0,
                                                    y: -2.0,

                                                    nodes: [

                                                        {
                                                            type: "box"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                                        
                         //                 
                         // {
                         //     type: "translate",
                         //     x: 2.5,
                         //     y: 1.5,
                         //     z: 1,
                         //                     
                         //     nodes: [
                         // 
                         //         {
                         //             type: "material",
                         //             baseColor:      { r: 0.3, g: 0.9, b: 0.3 },
                         //             specularColor:  { r: 0.2, g: 0.4, b: 0.3 },
                         //             specular:       0.9,
                         //             shine:          6.0,
                         // 
                         //             nodes: [
                         //     
                         //                 {
                         //                     type: "rotate",
                         //                     angle: 30.0,
                         //                     x : 1.0,
                         //                     y : 1.5,
                         // 
                         //                     nodes: [
                         //         
                         //                         {
                         //                             type: "disk"
                         //                         }
                         //                     ]
                         //                 }
                         //             ]
                         //         }
                         //     ]
                        // }
                    ]
                }
            ]
        }
    ]
});

SceneJS.withNode("theScene").render();

var disk_rotate = SceneJS.withNode("disk-rotate")
var sphere_rotate = SceneJS.withNode("sphere-rotate")
var box_rotate = SceneJS.withNode("box-rotate")

window.render = function() {
    var angle = disk_rotate.get("angle") + 0.3;
    disk_rotate.set("angle", angle);
    sphere_rotate.set("angle", angle);
    box_rotate.set("angle", angle);
    SceneJS.withNode("theScene").render();
};

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.render()", 30);
