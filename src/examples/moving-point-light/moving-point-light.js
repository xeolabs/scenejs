/*
 A teapot with an orbiting point light source that you can rotate with the mouse.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0.0, y: 10.0, z: -35 },
            look : { y:1.0 },
            up : { y: 1.0 }
        },
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    }
                },

                    /*---------------------------------------------------------------------------------
                     * Our animated light source is rotated using a Quaternion node which
                     * received rotation updates through the scene's data context chain
                     * -------------------------------------------------------------------------------*/

                        SceneJS.quaternion({
                            sid: "myQuaternion"
                        },
                                SceneJS.translate({ x: 10, z: -10 },

                                        SceneJS.light({
                                            mode: "point",

                                            /* Our light source's colour
                                             */
                                            color: { r: 1.0, g: 1.0, b: 0.0 },

                                            /* Our light will contribute to both the quantities of
                                             * specular and diffuse light that will hit our teapot.
                                             */
                                            diffuse: true,
                                            specular: true,

                                            /* The point light's position
                                             */
                                            pos: { x: 0, y: 0, z: 0},

                                            /* Since our light has a position, it therefore has
                                             * a distance over which its intensity can attenuate.
                                             * Consult any OpenGL book for how to use these factors,
                                             * or just tweak them right here to see what happens!
                                             */
                                            constantAttenuation: 1.0,
                                            quadraticAttenuation: 0.0,
                                            linearAttenuation: 0.0
                                        }),

                                    /*----------------------------------------------------------
                                     * A sphere that marks the light's position - not the focus
                                     * of this example
                                     * -------------------------------------------------------*/

                                        SceneJS.material({
                                            baseColor:      { r: .6, g: .6, b: 0.6 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            emit: 0.5,
                                            specular:       0.9,
                                            shine:          6.0
                                        },
                                                SceneJS.scale({x:0.3, y: 0.3, z: 0.3 },
                                                        SceneJS.sphere())))),

                    /*--------------------------------------------------------------------------
                     * Our static teapot is in a sibling branch to the light source - note that
                     * the Lights node and this subgraph are both children of the Camera, where
                     * the effect of the Lights has persisted even though it has been rendered.
                     * ------------------------------------------------------------------------*/

                        SceneJS.rotate({
                            angle: -20, x : 1.0
                        },
                                SceneJS.rotate({
                                    angle: 30.0, y : 1.0
                                },
                                        SceneJS.scale({
                                            x: 2, y: 2, z: 2
                                        },

                                                SceneJS.material({
                                                    baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
                                                    emit:           0.0,
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },
                                                        SceneJS.teapot())))))));

/*---------------------------------------------------------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff
 *--------------------------------------------------------------------------------------------------------------------*/


var rotx = 0;
var roty = 0;
var lastX;
var lastY;
var dragging = false;

/* Throw the switch, Igor!
 * We render the scene.
 */
exampleScene.render();

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = document.getElementById(exampleScene.getCanvasId());


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
        roty = (event.clientX - lastX);
        rotx = (event.clientY - lastY) * -1;

        if (Math.abs(roty) > Math.abs(rotx)) {

            exampleScene.setConfigs({
                "#myQuaternion" : {
                    "+rotation": {   // Maps to SceneJS.Quaterion#addRotation
                        y: 1,
                        angle: roty
                    }
                }
            }).render();
        } else {

            exampleScene.setConfigs({
                "#myQuaternion" : {
                    "+rotation": {
                        x: 1,
                        angle: rotx
                    }
                }
            }).render();
        }
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

SceneJS.addListener("error", function(e) {
    alert(e.exception.message);
});


