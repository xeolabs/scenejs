/**
 * SceneJS Example - Basic picking
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 *
 *
 *
 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    clearColor : { r:0, g:0, b:0},
                    viewport:{ x : 0, y : 0, width: 900, height: 900}  ,
                    enableTexture2D: true,
                    clear : { depth : true, color : true}
                },

                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: .8, g: 0.8, b: 0.8 },
                                    diffuse:                true,
                                    specular:               true,
                                    pos:                    { x: -100.0, y: 4.0, z: -200.0 },
                                    spotDir:                { x: -1, y:-1, z:-1},
                                    constantAttenuation:    1.0,
                                    quadraticAttenuation:   0.0,
                                    linearAttenuation:      0.0
                                }
                                ,
                                {
                                    type:                   "point",
                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                    diffuse:                true,
                                    specular:               true,
                                    pos:                    { x: -100.0, y: 100.0, z: 0.0 },
                                    constantAttenuation:    1.0,
                                    quadraticAttenuation:   0.0,
                                    linearAttenuation:      0.0
                                },
                                {
                                    type:                   "point",
                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                    diffuse:                true,
                                    specular:               false,
                                    pos:                    { x: -0.0, y: 1000.0, z: 0.0 },
                                    constantAttenuation:    1.0,
                                    quadraticAttenuation:   0.0,
                                    linearAttenuation:      0.0
                                }
                            ]},
                                SceneJS.perspective({ fovy : 45.0, aspect : 1, near : 0.10, far : 2000.0 },

                                        SceneJS.lookAt({
                                            eye : { x: 0, y: 2, z: 10},
                                            look : { x : .0, y : -1.0, z : 0 },
                                            up : { x: 0.0, y: 1.0, z: 0.0 }
                                        },
                                                SceneJS.material({
                                                    baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },

                                                        SceneJS.translate({x: -2.5},
                                                                SceneJS.rotate(function(data) {
                                                                    return { angle: data.get("angle"), y: 1 };
                                                                },
                                                                        SceneJS.texture({
                                                                            layers: [
                                                                                {
                                                                                    uri:"earth.jpg",
                                                                                    applyFrom: "uv",
                                                                                    applyTo: "baseColor",
                                                                                    flipY:true
                                                                                },
                                                                                      {
                                                                                    uri:"earth.jpg",
                                                                                    applyFrom: "uv",
                                                                                    applyTo: "baseColor",
                                                                                    flipY:false
                                                                                }
                                                                                //                                                                                ,
                                                                                //                                                                                {
                                                                                //                                                                                    uri:"earth.jpg",
                                                                                //                                                                                    applyTo: "diffuse",
                                                                                //                                                                                    flipY:true
                                                                                //                                                                                }
                                                                                //                                                                                ,
                                                                                //                                                                                {
                                                                                //                                                                                    uri:"earth.jpg",
                                                                                //                                                                                    applyTo: "specular",
                                                                                //                                                                                    flipY:true
                                                                                //                                                                                }
                                                                            ]
                                                                        },
                                                                                SceneJS.objects.sphere())))


                                                        )
                                                )
                                        )
                                )
                        )
                )
        );


var pInterval;
var angle = 0.0;

/* First render starts loading the texture and renders an untextured box
 */
exampleScene.render({ angle: angle });

/* Now we'll continuously render the scene until the count of running
 * processes is zero (ie. at which point the texture load process will have
 * completed and the texture has been applied and rendered). Processes
 * are only started and killed within scene traversals, so as not to cause
 * confusion (ie. race conditions) when we query them in the "idle"
 * interval inbetween.
 */
function doit() {
    if (angle < 1720.0) {
        exampleScene.render({ angle: angle });
        angle += 1.0;
    } else {
        clearInterval(pInterval);
        exampleScene.destroy();
    }
}
pInterval = setInterval("window.doit()", 10);


