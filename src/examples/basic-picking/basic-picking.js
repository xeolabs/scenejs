/**
 * SceneJS Example - Basic picking
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas',  loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0, y: 2, z: -22},
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
                    }
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


                            /* You can put a "picked" listener on any type of node, anywhere in a scene. This node
                             * has a birds-eye view of everything pickable and reports any picked events
                             * within it. As the scene is traversed in pick-mode after a geometry has been picked,
                             * any "picked" listeners found on each node will be fired as the node is visited,
                             * so this node's listener will be the first to fire
                             */
                                SceneJS.node({ sid: "spheres",
                                    listeners: {
                                        "picked":{
                                            fn : function(params) {
                                                alert(this.getSID() + " handling 'picked' from " + params.uri);
                                            }
                                        }

                                    }
                                },

                                    /* "blue-group" subgraph containing the two blue spheres at the front
                                     */
                                        SceneJS.node({ sid: "blue-group" },

                                                SceneJS.translate({x: -2, z: -7},

                                                        SceneJS.material({
                                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.9,
                                                            shine:          6.0
                                                        },
                                                                SceneJS.node({ sid: "right-blue-sphere" },
                                                                        SceneJS.translate({x: .5, z: -2},
                                                                                SceneJS.objects.sphere()
                                                                                )
                                                                        ),

                                                                SceneJS.node({ sid: "left-blue-sphere" },
                                                                        SceneJS.translate({x: +2},
                                                                                SceneJS.objects.sphere())
                                                                        )
                                                                )
                                                        )
                                                ),

                                    /* "green-group" containing the two green spheres just behind the blue ones
                                     *
                                     */
                                        SceneJS.node({ sid: "green-group",
                                            listeners: {
                                                "picked":{
                                                    fn : function(params) {
                                                        alert(this.getSID() + " handling 'picked' from " + params.uri);
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

                                                                SceneJS.node({ sid: "right-green-sphere",
                                                                    listeners: {
                                                                        "picked":{
                                                                            fn : function(params) {
                                                                                alert(this.getSID() + " handling 'picked' from " + params.uri);
                                                                            }
                                                                        }

                                                                    }
                                                                },
                                                                        SceneJS.translate({x: -2},
                                                                                SceneJS.objects.sphere()
                                                                                )
                                                                        ),

                                                                SceneJS.node({ sid: "left-green-sphere",
                                                                    listeners: {
                                                                        "picked":{
                                                                            fn : function(params) {
                                                                                alert(this.getSID() + " handling 'picked' from " + params.uri);
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

                                    /* "red-group" subgraph containing the red sphere at the back
                                     */
                                        SceneJS.node({ sid: "red-group" },
                                                SceneJS.translate({x: 2, z: +7},

                                                        SceneJS.material({
                                                            baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.9,
                                                            shine:          6.0
                                                        },
                                                                SceneJS.node({ sid: "red-group-sphere" },
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


        );


SceneJS.setDebugConfigs({
    //        picking: {
    //            logTrace: true
    //        } ,
    //        webgl: {
    //            logTrace: true
    //        }

});

exampleScene.render();


var canvas = document.getElementById("theCanvas");

/* On mouse down, we render the scene in picking mode, passing in the 
 * mouse canvas coordinates. This will cause a scene render traversal in which
 * all the "picked" listeners will fire on nodes situated above whatever
 * geometry node was picked, as those nodes are visited.
 *
 */
function mouseDown(event) {
    exampleScene.pick(event.clientX, event.clientY);
}

canvas.addEventListener('mousedown', mouseDown, false);


