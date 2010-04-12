/*
 A teapot with an orbiting directional light source that you can rotate with the mouse.

 The white dot is not the actual position of the light - it just indicates its direction
 relative to the teapot.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 600, height: 600},
                    clearColor: { r:0.0, g: 0.0, b: 0.0 },
                    enableTexture2D: true
                },
                        SceneJS.perspective({  fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0 },

                                SceneJS.lookAt({
                                    eye : { x: 0.0, y: 10.0, z: -35 },
                                    look : { y:1.0 },
                                    up : { y: 1.0 }
                                },

                                    /*---------------------------------------------------------------------------------
                                     * Our animated light source, which takes it's direction from the lightDir
                                     * property injected into the scene's render method
                                     * -------------------------------------------------------------------------------*/

                                        SceneJS.lights(
                                                function(data) {  // Dynamic config function
                                                    return {
                                                        sources: [
                                                            {
                                                                type: "dir",

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
                                                                dir: data.get("lightDir")

                                                                /* Note the absence of attenuation properties;
                                                                 * unlike a point light, a directional light has no
                                                                 * position, and is therefore not subject to attenuation
                                                                 * since it is at an infinite distance.
                                                                 */
                                                            }
                                                        ]};
                                                },

                                            /*--------------------------------------------------------------------------
                                             * Teapot, rotated and scaled into position within model-space, coloured
                                             * with some material properties
                                             * ------------------------------------------------------------------------*/

                                                SceneJS.rotate({
                                                    angle: -20, x : 1.0
                                                },
                                                        SceneJS.rotate({
                                                            angle: 30.0, y : 1.0
                                                        },
                                                                SceneJS.scale({
                                                                    x: 1, y: 1, z: 1
                                                                },

                                                                        SceneJS.material({
                                                                            baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
                                                                            emit:           0.0,
                                                                            specular:       0.9,
                                                                            shine:          6.0
                                                                        },
                                                                                SceneJS.objects.teapot()
                                                                                ))
                                                                )
                                                        )
                                                ),

                                    /*---------------------------------------------------------------------------------
                                     * This is just a sphere that indicates the light's direction - not the focus
                                     * of this example
                                     * -------------------------------------------------------------------------------*/

                                        SceneJS.translate(
                                                function(data) {
                                                    return data.get("lightDir");
                                                },
                                                SceneJS.material({
                                                    baseColor:      { r: .6, g: .6, b: 0.6 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    emit: 0.5,
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },
                                                        SceneJS.scale({x:0.3, y: 0.3, z: 0.3 },
                                                                SceneJS.objects.sphere())))
                                        )
                                )
                        )
                )
        );

/*---------------------------------------------------------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff
 *--------------------------------------------------------------------------------------------------------------------*/

var yaw = 140;
var pitch = 20;
var lastX;
var lastY;
var dragging = false;

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = exampleScene.getCanvas();

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
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

window.render = function() {
    var mat = Matrix.Rotation(pitch * 0.0174532925, $V([1,0,0])).x(Matrix.Rotation(yaw * 0.0174532925, $V([0,1,0])));
    var dir = mat.multiply($V([6,0,0])).elements;
    exampleScene.render({ lightDir: {x: dir[0], y: dir[1], z: dir[2] }});
};

window.render(); // Just to get exceptions

var pInterval = setInterval("window.render()", 10);
