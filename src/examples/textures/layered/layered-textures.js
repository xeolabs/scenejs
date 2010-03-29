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
                                    type:                   "point",
                                    diffuse:                { r: .5, g: .5, b: .5 },
                                    ambient:               { r: 0.0, g: 0.0, b: 0.0 },
                                    specular:               { r: 0.5, g: 0.9, b: 0.9 },
                                    pos:                    { x: 100.0, y: 0.0, z: 100.0 },
                                    constantAttenuation:    1.0,
                                    quadraticAttenuation:   0.0,
                                    linearAttenuation:      0.0
                                },
                                {
                                    type:                   "point",
                                    diffuse:                { r: .5, g: .5, b: .5 },
                                     ambient:               { r: 0.0, g: 0.0, b: 0.0 },
                                    specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                    pos:                    { x: -100.0, y: 100.0, z: 100.0 },
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
                                                    ambient: { r:0.0, g:0.0, b:0.0 },
                                                    diffuse:  { r:1.0, g:1.0, b:1.0 },
                                                    specular:  { r:1.0, g:1.0, b:1.0 },
                                                    emission:  { r:1, g:1, b:1 },
                                                    shininess: 40},

                                                        SceneJS.translate({x: -2.5},
                                                                SceneJS.rotate(function(data) {
                                                                    return { angle: data.get("angle"), y: 1 };
                                                                },
                                                                        SceneJS.texture({
                                                                            layers: [
                                                                                {
                                                                                    uri:"earth.jpg",
                                                                                    applyTo: "emission",
                                                                                    flipY:true
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


