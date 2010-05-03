/*
 OBJ Load Example - Avatar Body

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Demonstrates the import of an OBJ asset - an avatar model.

 */
SceneJS.onEvent("error", function(e) {
    alert(e.exception.message ? e.exception.message : e.exception);
});

var exampleScene = SceneJS.scene({

    /* Bind to a WebGL canvas:
     */
    canvasId: 'theCanvas',

    /* URL of the proxy server which will mediate the
     * cross-domain load of our airplane COLLADA model
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

    /* Perspective transform:
     */
        SceneJS.renderer({
            /* Enable/disable face culling
             */
            enableCullFace: true,

            /* Specify facet culling mode, accepted values are: front, back, front_and_back
             */
            cullFace: "back",

            /* Specify front/back-facing mode. Accepted values are cw or ccw
             */
            frontFace: "ccw"

        },
                SceneJS.perspective({
                    fovy : 55.0,
                    aspect : 2.0,
                    near : 0.10,
                    far : 4000.0 },

                    /* Viewing transform:
                     */
                        SceneJS.lookAt(function(data) {
                            return {
                                eye : data.get("eye"),
                                look : { x: 0.0, y: 0, z: 0 },
                                up : { y: 1.0 }
                            };
                        },

                            /* A lights node inserts lights into the world-space.  You can have as many
                             * lights as you want throughout your scene:
                             */
                                SceneJS.lights({
                                    sources: [
                                        {
                                            type:                   "dir",
                                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                            dir:                    { x: 1.0, y: 0.0, z: 0.0 },
                                            diffuse:                true,
                                            specular:               false
                                        }
                                    ]},

                                        SceneJS.material({
                                            baseColor:      { r: 0.9, g: 0.9, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0
                                        },
                                            /* Next, modelling transforms to orient the house.  These particular
                                             * transforms are dynamically configured from data injected into the
                                             * scene graph when its rendered:
                                             */
                                                SceneJS.rotate(function(data) {
                                                    return {
                                                        angle: data.get('pitch'), x : 1.0
                                                    };
                                                },
                                                        SceneJS.rotate(function(data) {
                                                            return {
                                                                angle: data.get('yaw'), y : 1.0
                                                            };
                                                        },

                                                            //    SceneJS.objects.teapot()
                                                            //
                                                                SceneJS.scale({x: 10, y: 10, z: 10},
                                                                    //SceneJS.objects.cube(),
                                                                        SceneJS.loadOBJ({
                                                                            uri: "http://www.scenejs.org/library/v0.7/assets/examples/avatar_mesh/SL%20Avatar/SL_Female.obj"
                                                                            //uri: "http://www.scenejs.org/library/v0.7/assets/examples/obj-teapot/teapot.obj"
                                                                        })
                                                                        )
                                                                )
                                                    // )
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

var pInterval;

var yaw = 305;
var pitch = 10;
var lastX;
var lastY;
var dragging = false;
//var dist = 1000;
var dist = 10;
var speed = 0;
var eye;


/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = document.getElementById(exampleScene.getCanvasId());
;

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
        pitch += (event.clientY - lastY) * 0.5;
        lastX = event.clientX;
        lastY = event.clientY;


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
            speed += 0.5;
        } else {
            speed -= 0.5;
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


function showFPS(divId) {
    if (!window._fps) {
        window._fpsLastTime = (new Date().getTime());
        window._fpsUpdateCountdown = 100;
        window._fpsSumElapsed = 0;
        window._fps = true;
        return;
    }
    var timeNow = (new Date().getTime());
    window._fpsSumElapsed += (timeNow - window._fpsLastTime);
    if (--window._fpsUpdateCountdown == 0) {
        document.getElementById(divId).innerHTML = (1000 / (window._fpsSumElapsed / 100));
        window._fpsUpdateCountdown = 100;
        window._fpsSumElapsed = 0;
    }
    window._fpsLastTime = timeNow;
}

function showTeapots(divId) {
    document.getElementById(divId).innerHTML = "" + window.countTeapots + ", eye=" + eye[0] + "," + eye[1] + ', ' + eye[2];
}

window.render = function() {
    window.countTeapots = 0;
    dist += speed;
    if (dist < -4000) {
        speed = 0;
        dist = -4000;
    }
    if (dist > 4000) {
        speed = 0;
        dist = 4000;
    }
    //    if (pitch < 1) {
    //        pitch = 1;
    //    }
    //
    //    if (pitch > 80) {
    //        pitch = 80;
    //    }

    var pitchMat = Matrix.Rotation(pitch * 0.0174532925, $V([1,0,0]));
    var yawMat = Matrix.Rotation(yaw * 0.0174532925, $V([0,1,0]));

    eye = pitchMat.multiply($V([0,0,-dist])).elements;
    eye = yawMat.multiply($V(eye)).elements;

    exampleScene.render({eye: { x: eye[0], y: eye[1], z: eye[2] }});

    //showFPS("status");
    showTeapots("status");

};

SceneJS.onEvent("error", function(e) {
    window.clearInterval(pInterval);
    alert(e.exception.message ? e.exception.message : e.exception);
});

pInterval = setInterval("window.render()", 50);