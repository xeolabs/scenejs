/**
 * SceneJS Example - Basic picking
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    clearColor : { r:0, g:0, b:0.0 },
                    viewport:{ x : 0, y : 0, width: 800, height: 600}  ,
                    clear : { depth : true, color : true}
                },
                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: .8, g: 0.8, b: 0.8 },
                                    diffuse:                true,
                                    specular:               false,
                                    pos:                    { x: 100.0, y: 4.0, z: 100.0 },
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
                                    pos:                    { x: 100.0, y: -100.0, z: 100.0 },
                                    constantAttenuation:    1.0,
                                    quadraticAttenuation:   0.0,
                                    linearAttenuation:      0.0
                                },
                                {
                                    type:                   "point",
                                    color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                    diffuse:                true,
                                    specular:               true,
                                    pos:                    { x: -1000.0, y: -1000.0, z: 0.0 },
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

                                                SceneJS.name({ name: "spheres" },

                                                        SceneJS.translate({x: -2, z: -7},

                                                                SceneJS.name({ name: "blueGroup" },
                                                                        SceneJS.material({
                                                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            specular:       0.9,
                                                                            shine:          6.0
                                                                        },
                                                                                SceneJS.name({ name: "left" },
                                                                                        SceneJS.translate({x: .5, z: -2},
                                                                                                SceneJS.objects.sphere()
                                                                                                )
                                                                                        ),

                                                                                SceneJS.name({ name: "right" },
                                                                                        SceneJS.translate({x: +2},
                                                                                                SceneJS.objects.sphere())
                                                                                        )
                                                                                )
                                                                        )
                                                                ),

                                                        SceneJS.name({ name: "greenGroup" },
                                                                SceneJS.translate({x: 3, z: 0},
                                                                        SceneJS.material({
                                                                            baseColor:      { r: 0.3, g: 0.9, b: 0.3 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            specular:       0.9,
                                                                            shine:          6.0
                                                                        },
                                                                                SceneJS.name({ name: "left" },
                                                                                        SceneJS.translate({x: -2},
                                                                                                SceneJS.objects.sphere()
                                                                                                )
                                                                                        ),

                                                                                SceneJS.name({ name: "right" },
                                                                                        SceneJS.translate({x: 1},
                                                                                                SceneJS.objects.sphere())
                                                                                        )
                                                                                )
                                                                        )
                                                                ),

                                                        SceneJS.name({ name: "redGroup" },
                                                                SceneJS.translate({x: 2, z: +7},
                                                                        SceneJS.material({
                                                                            baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            specular:       0.9,
                                                                            shine:          6.0
                                                                        },
                                                                                SceneJS.name({ name: "front" },
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
        );

exampleScene.render();

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    exampleScene.pick(event.clientX, event.clientY);
}

canvas.addEventListener('mousedown', mouseDown, false);


