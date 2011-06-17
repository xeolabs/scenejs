/*
 A teapot with an orbiting directional light source that you can rotate with the mouse.

 The white dot is not the actual position of the light - it just indicates its direction
 relative to the teapot.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */

SceneJS.createScene({
    type: "scene",
    id:"theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 35 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [

                        /*---------------------------------------------------------------------------------
                         * Our animated light source is rotated using a Quaternion node which
                         * receives rotation updates through configs injected into the scene when
                         * it is rendered
                         * -------------------------------------------------------------------------------*/

                        {
                            type: "quaternion",
                            id: "myQuaternion",

                            nodes: [
                                {
                                    type: "light",

                                    mode: "dir",

                                    /* Colour of our light
                                     */
                                    color: { r: 1.0, g: 1.0, b: 0.0 },

                                    /* Our light will contribute to both the quantities of
                                     * specular and diffuse light that will hit our teapot.
                                     */
                                    diffuse: true,
                                    specular: true,

                                    /* The directional light's direction, a vector from the
                                     * origin of this coordinate system (which is in this
                                     * case the view coordinate system, since our light is
                                     * not within any no modelling transform nodes).
                                     *
                                     * The direction vector is calculated by mouse handlers and
                                     * injected into the scene's render method.
                                     */
                                    dir: {  x: 0, y: 0, z: -1.0 }

                                    /* Note the absence of attenuation properties;
                                     * unlike a point light, a directional light has no
                                     * position, and is therefore not subject to attenuation
                                     * since it is at an infinite distance.
                                     */
                                },

                                /*----------------------------------------------------------
                                 * A sphere that marks the light's direction - not the focus
                                 * of this example
                                 * -------------------------------------------------------*/
                                {
                                    type: "translate",
                                    z: 10 ,
                                    nodes: [
                                        {
                                            type: "material",
                                            baseColor:      { r: .6, g: .6, b: 0.6 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            emit: 0.5,
                                            specular:       0.9,
                                            shine:          6.0,
                                            nodes: [
                                                {
                                                    type: "scale",
                                                    x: 0.5,
                                                    y: 0.5,
                                                    z: 0.5,
                                                    nodes: [
                                                        {
                                                            type: "sphere"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },

                        /*--------------------------------------------------------------------------
                         * Teapot, rotated and scaled into position within model-space, coloured
                         * with some material properties
                         * ------------------------------------------------------------------------*/

                        {
                            type: "rotate",
                            angle: -20,
                            x : 1.0,
                            nodes: [

                                {
                                    type: "rotate",
                                    angle: 30.0,
                                    y : 1.0,

                                    nodes: [

                                        {
                                            type: "scale",
                                            x: 2,
                                            y: 2,
                                            z: 2,

                                            nodes: [
                                                {
                                                    type: "material",
                                                    baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
                                                    emit:           0.0,
                                                    specular:       0.9,
                                                    shine:          6.0,

                                                    nodes: [
                                                        {
                                                            type: "teapot"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

/*---------------------------------------------------------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff
 *--------------------------------------------------------------------------------------------------------------------*/

var rotx = 0;
var roty = 0;
var lastX;
var lastY;
var dragging = false;

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

var scene = SceneJS.scene("theScene");

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        roty = (event.clientX - lastX);
        rotx = (event.clientY - lastY);

        if (Math.abs(roty) > Math.abs(rotx)) {

            scene.findNode("myQuaternion").add({
                rotation:{
                    y: 1,
                    angle: roty
                }
            });

        } else {

            scene.findNode("myQuaternion").add({
                rotation:{
                    x: 1,
                    angle: rotx
                }
            });
        }
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

SceneJS.bind("error", function(e) {
    alert(e.exception.message);
});

scene.start();
