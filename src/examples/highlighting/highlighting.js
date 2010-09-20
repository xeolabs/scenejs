/**
 * SceneJS Example - highlighting
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */

var highlights = [4];

var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0, y: 2, z: -40},
            look : { x : 0.0, y : 5.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 }
        },
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 45.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    }
                },
                        SceneJS.light({
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        }),

                        SceneJS.light({
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        }),

                        SceneJS.light({
                            mode:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        }),

                        highlights[0] = SceneJS.highlight({
                            highlighted: true
                        },
                                SceneJS.translate({ x: 7 },
                                        SceneJS.rotate({sid: "teapot1-rotate", y: 1, angle: 0.0},
                                                SceneJS.material({
                                                    baseColor:          { r: 0.5, g: 0.1, b: 0.5 },
                                                    highlightBaseColor: { r: 1.0, g: 0.1, b: 1.0 },
                                                    specularColor:      { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:            0.9,
                                                    shine:                6.0
                                                },
                                                        SceneJS.teapot())))),

                        highlights[1] = SceneJS.highlight({
                            highlighted: false
                        },
                                SceneJS.material({
                                    baseColor:          { r: 0.2, g: 0.5, b: 0.2 },
                                    highlightBaseColor: { r: 0.2, g: 1.0, b: 0.2 },
                                    specularColor:      { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:           0.9,
                                    shine:              6.0
                                },
                                        SceneJS.node({ sid: "mount-point"},
                                                SceneJS.node({ sid: "remove-me"},
                                                        SceneJS.teapot())))),

                        highlights[2] = SceneJS.highlight({
                            highlighted: false
                        },
                                SceneJS.translate({ x: -7 },
                                        SceneJS.material({
                                            sid: "teapot3-color",
                                            baseColor:          { r: 0.3, g: 0.5, b: 0.5 },
                                            highlightBaseColor: { r: 0.3, g: 1.0, b: 1.0 },
                                            specularColor:      { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:           0.9,
                                            shine:              6.0
                                        },
                                                SceneJS.teapot()))),

                        highlights[3] = SceneJS.highlight({
                            highlighted: false
                        },
                                SceneJS.translate({ x: -14 },
                                        SceneJS.material({
                                            id: "teapot4-color",
                                            baseColor:          { r: 0.5, g: 0.5, b: 0.3 },
                                            highlightBaseColor: { r: 1.0, g: 1.0, b: 0.3 },
                                            specularColor:      { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:           0.9,
                                            shine:              6.0
                                        },
                                                SceneJS.translate({ id: "teapot4-pos" },
                                                        SceneJS.rotate({ id: "teapot4-spin", y: 1.0 },
                                                                SceneJS.rotate({ id: "teapot4-tumble", z: 1.0 },
                                                                        SceneJS.teapot()))))))
                        )
                )
        );


var currentHighlight = 0;
var canvas = document.getElementById(exampleScene.getCanvasId());

exampleScene.render();

function mouseClick() {
    highlights[currentHighlight].setHighlighted(false);
    currentHighlight = (currentHighlight + 1) % 4;
    highlights[currentHighlight].setHighlighted(true);
    exampleScene.render();
}

canvas.addEventListener('click', mouseClick, true);

