/**
 * SceneJS Example - Basic picking
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas',  loggingElementId: "theLoggingDiv" },

        SceneJS.rotate({ x : 1, angle : 0 }, // Couple of affine view transforms to complete the test
                SceneJS.translate({ x : 0,
                    listeners: {
                        "picked":{
                            fn : function(theNode, params) {
                                   alert("<translate> picked - dont know what: " + params.url);
                            }
                        }

                    }},

                        SceneJS.lookAt({
                            eye : { x: 0, y: 2, z: -12},
                            look : { x : 0.0, y : -1.0, z : 0 },
                            up : { x: 0.0, y: 1.0, z: 0.0 }
                        },
                                SceneJS.camera({
                                    optics: {
                                        type: "perspective",
                                        fovy : 25.0,
                                        aspect : 1.0,
                                        near : 0.10,
                                        far : 300.0
                                    },

                                    listeners: {
                                        "picked":{
                                            fn : function(theNode, params) {
                                              //  alert("<perspective> picked: " + params.url);
                                            }
                                        }

                                    }
                                },
                                        SceneJS.renderer({
                                            //                                            viewport: {
                                            //                                                x : 200,
                                            //                                                y : 200,
                                            //                                                width: 50,
                                            //                                                height: 50
                                            //                                            }
                                        },

                                                SceneJS.lights({
                                                    sources: [
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                                        },
                                                        {
                                                            type:                   "dir",
                                                            color:                  {r: 1.0, g: 1.0, b: 1.0},
                                                            diffuse:                true,
                                                            specular:               true,
                                                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                                        },
                                                        {
                                                            type:                   "dir",
                                                            color:                  {r: 1.0, g: 1.0, b: 1.0},
                                                            diffuse:                true,
                                                            specular:               true,
                                                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                                        }
                                                    ]},

                                                        SceneJS.node({ sid: "world",
                                                            listeners: {
                                                                "picked":{
                                                                    fn : function(theNode, params) {
                                                //                        alert("#world: picked: " + params.url);
                                                                    }
                                                                }

                                                            }
                                                        },
                                                                SceneJS.node({ sid: "spheres",
                                                                    listeners: {
                                                                        "picked":{
                                                                            fn : function(theNode, params) {
                                                  //                              alert("#world/spheres: picked: " + params.url);
                                                                            }
                                                                        }

                                                                    }
                                                                },

                                                                        SceneJS.translate({x: -2, z: -7},

                                                                                SceneJS.node({ sid: "blueGroup" },

                                                                                        SceneJS.material({
                                                                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                                            specular:       0.9,
                                                                                            shine:          6.0
                                                                                        },
                                                                                                SceneJS.node({ sid: "left" },
                                                                                                        SceneJS.translate({x: .5, z: -2},
                                                                                                                SceneJS.objects.sphere()
                                                                                                                )
                                                                                                        ),

                                                                                                SceneJS.node({ sid: "right" },
                                                                                                        SceneJS.translate({x: +2},
                                                                                                                SceneJS.objects.sphere())
                                                                                                        )
                                                                                                )
                                                                                        )
                                                                                ),

                                                                        SceneJS.node({ sid: "greenGroup",
                                                                            listeners: {
                                                                                "picked":{
                                                                                    fn : function(theNode, params) {
                                                    //                                    alert("#world/spheres/greenGroup picked: " + params.url);
                                                                                    }
                                                                                }

                                                                            }
                                                                        },
                                                                                SceneJS.translate({x: 3, z: 0},
                                                                                        SceneJS.material({
                                                                                            baseColor:      { r: 0.3, g: 0.9, b: 0.3 },
                                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                                            specular:       0.9,
                                                                                            shine:          6.0
                                                                                        },
                                                                                                SceneJS.node({ sid: "left",
                                                                                                    listeners: {
                                                                                                        "picked":{
                                                                                                            fn : function(theNode, params) {
                                                      //                                                          alert("#world/spheres/greenGroup/left picked: " + params.url);
                                                                                                            }
                                                                                                        }

                                                                                                    }
                                                                                                },
                                                                                                        SceneJS.translate({x: -2},
                                                                                                                SceneJS.objects.sphere()
                                                                                                                )
                                                                                                        ),

                                                                                                SceneJS.node({ sid: "right",
                                                                                                    listeners: {
                                                                                                        "picked":{
                                                                                                            fn : function(theNode, params) {
                                                        //                                                        alert("right picked: " + params.url);
                                                                                                            }
                                                                                                        }

                                                                                                    }
                                                                                                },
                                                                                                        SceneJS.translate({x: 1},
                                                                                                                SceneJS.objects.sphere())
                                                                                                        )
                                                                                                )
                                                                                        )
                                                                                ),

                                                                        SceneJS.node({ sid: "redGroup" },
                                                                                SceneJS.translate({x: 2, z: +7},
                                                                                        SceneJS.material({
                                                                                            baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                                            specular:       0.9,
                                                                                            shine:          6.0
                                                                                        },
                                                                                                SceneJS.node({ sid: "front" },
                                                                                                        SceneJS.translate({x: -2},
                                                                                                                SceneJS.objects.sphere()
                                                                                                                )
                                                                                                        )
                                                                                                )
                                                                                        )
                                                                                )
                                                                        )
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );


SceneJS.setDebugConfigs({
//        pick: {
//            logTrace: true
//        } ,
    webgl: {
        logTrace: true
    }
   
});

exampleScene.render();


var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    exampleScene.pick(event.clientX, event.clientY);
}

canvas.addEventListener('mousedown', mouseDown, false);


