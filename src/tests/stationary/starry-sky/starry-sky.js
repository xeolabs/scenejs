/*  Demonstrates level-of-detail selection. This scene contains a staircase which switches
 *  representations as a function of it's projected view-volume size. The staircase is
 * a parameterised asset, dynamically loaded from the SceneJS content library.
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 */

var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas' },

    /* Write logging output to a DIV element in the page
     */
        SceneJS.loggingToPage({ elementId: "logging" },

            /* A renderer node clears the depth and colour buffers and sets GL modes
             */
                SceneJS.renderer({
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 1600, height: 800},
                    clearColor: { r:0.5, g: 0.5, b: 0.5 },
                    enableTexture2D:true
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 45.0, aspect : 2.0, near : 0.10, far : 7000.0 },


                            /* View transform - takes viewing parameters through the data passed
                             * into this scene as it is rendered. Those parameters are generated
                             * in mouse handlers outside the scene graph - see below.
                             */
                                SceneJS.lookAt(function(data) {
                                    return {
                                        eye :  data.get("eye"),
                                        look :  data.get("look"),
                                        up : { y: 1.0 }
                                    };
                                },

                                    /* A SceneJS.stationary node defines a sub-space within the view space in which
                                     * the lookAt node's translation and/or rotation transformations are not applied.
                                     *
                                     * In its subtree, you can define sky-boxes/spheres, things floating beside
                                     * the viewpoint like HUD displays, control panels, a 3D mouse pointer etc.
                                     */
                                        SceneJS.stationary(

                                            /* These lights are a hack for http://github.com/xeolabs/scenejs/issues/issue/19
                                             */
                                                SceneJS.lights({
                                                    sources: [
                                                        {
                                                            type:                   "point",
                                                            ambient:                { r: 0.0, g: 0.0, b: 0.0 },
                                                            diffuse:                { r: 0.0, g: 0.0, b: 0.0 },
                                                            specular:               { r: 0.0, g: 0.0, b: 0.0 },
                                                            pos:                    { x: 0.0, y: 0.0, z: 0.0 },
                                                            constantAttenuation:    100.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        }
                                                    ]},
                                                        SceneJS.scale({ x: 1000, y: 1000,  z: 1000 },
                                                                SceneJS.texture({
                                                                    layers: [
                                                                        {
                                                                            uri:"http://scenejs.org/library/textures/stars/gigapixel-milky-way.gif",
                                                                            wrapS: "clampToEdge",
                                                                            wrapT: "clampToEdge",
                                                                            applyTo:"emission"
                                                                        }
                                                                    ]},
                                                                        SceneJS.material({
                                                                            ambient: { r: .0, g: .0, b: .0 },
                                                                            emission: { r: 1.0, g: 1.0, b: 1.0 }
                                                                        },
                                                                                SceneJS.objects.sphere()))))),

                                    /* Lighting
                                     */
                                        SceneJS.lights({
                                            sources: [
                                                {
                                                    type:                   "point",
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                                    pos:                    { x: 100.0, y: 0.0, z: -100.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                },
                                                {
                                                    type:                   "point",
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.6 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                                    pos:                    { x: -20.0, y: 50.0, z: 0.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                },
                                                {
                                                    type:                   "point",
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.6 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.9 },
                                                    pos:                    { x: 50.0, y: 100.0, z: 0.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                }
                                            ]},

                                            /* A teapot
                                             */
                                                SceneJS.translate({x:10,y:40, z:10},
                                                        SceneJS.scale({x:20,y:20, z:20},

                                                                SceneJS.objects.teapot())
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var eye = { x: 0, y: 10, z: -250 };
var look = { x :  0, y: 20, z: 0 };
var speed = 0;
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;
//var moveVec =  { x :  0, y: 0, z: 10 };
var moveAngle = 0;
var moveAngleInc = 0;

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
    speed = 0;
    moveAngleInc = 0;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (!lastX) {
        lastX = event.clientX;
        lastY = event.clientY;
    }
    if (dragging) {
        moveAngleInc = (event.clientX - lastX) * 0.005;
        speed = (lastY - event.clientY) * 0.01;
        //moveAngle -= (event.clientX - lastX) * 0.1;
        //        lastX = event.clientX;
        //        lastY = event.clientY;
    }
}

function mouseWheel(event) {
    var delta = 0;
    if (!event) event = window.event;
    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }
    if (delta) {
        if (delta < 0) {
            speed -= 0.2
        } else {
            speed += 0.2
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('mousewheel', mouseWheel, true);

window.render = function() {
    moveAngle -= moveAngleInc;
    var moveVec = SceneJS_math_transformVector3(SceneJS_math_rotationMat4v(moveAngle * 0.0174532925, [0,1,0]), [0,0,1]);
    if (speed) {

        eye.x += moveVec[0] * speed;
        eye.z += moveVec[2] * speed;
    }
    exampleScene.render({ eye : eye, look: { x: eye.x + moveVec[0], y: eye.y, z : eye.z + moveVec[2] }});
};

/* Continue animation
 */
var pInterval = setInterval("window.render()", 10);



