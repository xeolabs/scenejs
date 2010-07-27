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
            eye : { x: 0, y: 2, z: 16},
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
                                //alert("<perspective> picked: " + params.url);
                            }
                        }

                    }
                },
                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                }
                            ]},

                                SceneJS.withConfigs({
                                    listeners: {
                                        "picked":{
                                            fn : function(thisNode, params) {
                                                if (params.url.match("^teapot1") == "teapot1") {
                                                    thisNode.setConfigs({
                                                        "#teapot1" : {
                                                            "#pitch": {
                                                                angle: 90
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                },
                                        SceneJS.node({ sid: "teapot1" },
                                                SceneJS.rotate({sid: "pitch", x: 1, angle: 0.0},
                                                        SceneJS.material({
                                                            baseColor:      { r: 0.3, g: 0.9, b: 0.3 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.9,
                                                            shine:          6.0
                                                        },
                                                                SceneJS.objects.teapot())))
                                        )
                                )
                        )
                )
        );


SceneJS.setDebugConfigs({
    pick: {
        logTrace: true
    }
    //    ,
    //    shading : {
    //        logScripts : true
    //    }
});

exampleScene.render();


var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    exampleScene.pick(event.clientX, event.clientY);
}

canvas.addEventListener('mousedown', mouseDown, false);


