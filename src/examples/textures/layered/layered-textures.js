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
                    clearColor : { r:0.2, g:0.2, b:0.2 },
                    viewport:{ x : 0, y : 0, width: 800, height: 600}  ,
                    enableTexture2D: true,
                    clear : { depth : true, color : true}
                },

                        SceneJS.lights({
                            lights: [
                                {
                                    type:                   "point",
                                    diffuse:                { r: 0.6, g: 0.6, b: 0.6 },
                                    specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                    pos:                    { x: 10.0, y: 0.0, z: -10.0 },
                                    constantAttenuation:    1.0,
                                    quadraticAttenuation:   0.0,
                                    linearAttenuation:      0.0
                                },
                                {
                                    type:                   "point",
                                    diffuse:                { r: 0.6, g: 0.6, b: 0.6 },
                                    specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                    pos:                    { x: -10.0, y: 10.0, z: 0.0 },
                                    constantAttenuation:    1.0,
                                    quadraticAttenuation:   0.0,
                                    linearAttenuation:      0.0
                                }
                            ]},
                                SceneJS.perspective({ fovy : 45.0, aspect : 1.3, near : 0.10, far : 2000.0 },

                                        SceneJS.lookAt({
                                            eye : { x: 0, y: 2, z: 12},
                                            look : { x : 0.0, y : -1.0, z : 0 },
                                            up : { x: 0.0, y: 1.0, z: 0.0 }
                                        },

                                                SceneJS.material({
                                                    ambient:  { r:0.4, g:0.4, b:0.4 },
                                                    diffuse:  { r:0.8, g:0.8, b:0.8 },
                                                    specular:  { r:0.5, g:0.5, b:0.5 },
                                                    //   emission:  { r:0.5, g:0.5, b:0.5 },
                                                    shininess: 2},

                                                        SceneJS.translate({x: -3},
                                                                SceneJS.rotate(function(scope) {
                                                                    return { angle: scope.get("angle"), y: 1 };
                                                                },
                                                                        SceneJS.objects.sphere()),


                                                                SceneJS.translate({x: 3},

                                                                        SceneJS.texture({
                                                                            uri:"earth.jpg",
                                                                            applyTo: "diffuse",
                                                                            wait: false
                                                                        },
                                                                                SceneJS.rotate(function(scope) {
                                                                                    return { angle: scope.get("angle"), y: 1 };
                                                                                },
                                                                                        SceneJS.objects.sphere()),

                                                                                SceneJS.translate({x: 3},

                                                                                        SceneJS.texture({
                                                                                            uri:"earth-specular.gif",
                                                                                            applyTo: "shininess",
                                                                                            wait: false
                                                                                        },
                                                                                                SceneJS.rotate(function(scope) {
                                                                                                    return { angle: scope.get("angle"), y: 1 };
                                                                                                },
                                                                                                        SceneJS.objects.sphere())
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
    if (angle < 720.0) {
        exampleScene.render({ angle: angle });
        angle += 1.0;
    } else {
        clearInterval(pInterval);
        exampleScene.destroy();
    }
}
pInterval = setInterval("window.doit()", 10);


