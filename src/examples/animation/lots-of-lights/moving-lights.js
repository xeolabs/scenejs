/*
 Teapot with a light source rotating around it

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

                                    /* Sphere marking the light's position
                                     */
                                        SceneJS.translate(
                                                function(data) {
                                                    return data.get("lightPos");
                                                },
                                                SceneJS.material({
                                                    baseColor:      { r: 1.0, g: 1.0, b: 0 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    emit: 1.0,
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },
                                                        SceneJS.scale({x:0.5, y: 0.5, z: 0.5 },
                                                                SceneJS.objects.sphere()))),

                                    /** Our animated light source, which takes it's position from
                                     * properties injected into the scene's render function:
                                     */
                                        SceneJS.lights(
                                                function(data) {  // Dynamic config function
                                                    return {
                                                        sources: [
                                                            {
                                                                type: "dir",
                                                                color: { r: 1.0, g: 1.0, b: 0.0 },
                                                                diffuse: true,
                                                                specular: true,

                                                                /* The light's position:
                                                                 */
                                                                dir: data.get("lightPos"),

                                                                constantAttenuation: 0.0,
                                                                quadraticAttenuation: 0.0,
                                                                linearAttenuation: 0.0
                                                            }
                                                        ]};
                                                },


                                                SceneJS.rotate({
                                                    angle: -20, x : 1.0
                                                },
                                                        SceneJS.rotate({
                                                            angle: 30.0, y : 1.0
                                                        },

                                                                SceneJS.material({
                                                                    baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
                                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
                                                                    emit:           0.0,
                                                                    specular:       0.9,
                                                                    shine:          6.0
                                                                },
                                                                        SceneJS.objects.teapot()
                                                                        )
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );

var yaw = 0;
var pitch = 0;
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
    var pos = mat.multiply($V([6,0,0])).elements;
    exampleScene.render({ lightPos: {x: pos[0], y: pos[1], z: pos[2] } });
};

var pInterval = setInterval("window.render()", 10);
