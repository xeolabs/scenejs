/*
 Issue #29  - https://xeolabs.lighthouseapp.com/projects/50643-scenejs/tickets/29-scenejsloadcollada-not-reusing-loaded-asset-keeps-reloading

 After fixing, we should see four ducks, two with bounding boxes.
 */
var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

        SceneJS.perspective({
            fovy : 55.0,
            aspect : 2.0,
            near : 0.10,
            far : 8000.0 },

                SceneJS.lookAt(function(data) {
                    return {
                        eye : data.get("eye"),
                        look : { x: -1.0, y: 0, z: 0 },
                        up : { y: 1.0 }
                    };
                },

                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    dir:                    { x: 1.0, y: -1.0, z: 1.0 },
                                    diffuse:                true,
                                    specular:               true
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    dir:                    { x: -1.0, y: -1.0, z: -3.0 },
                                    diffuse:                true,
                                    specular:               true
                                }
                            ]},


                                SceneJS.rotate({x:1,angle:270},
                                        SceneJS.translate({x: -200, y: -200},
                                                SceneJS.loadCollada({
                                                    uri: "http://www.scenejs.org/library/v0.7/assets/examples/collada-duck/duck.dae" ,
                                                    showBoundingBoxes: true
                                                })),
                                        SceneJS.translate({x: 200, y: -200},
                                                SceneJS.loadCollada({
                                                    uri: "http://www.scenejs.org/library/v0.7/assets/examples/collada-duck/duck.dae" ,
                                                    showBoundingBoxes: true
                                                })),
                                        SceneJS.translate({x: 200, y: 200},
                                                SceneJS.loadCollada({
                                                    uri: "http://www.scenejs.org/library/v0.7/assets/examples/collada-duck/duck.dae" ,
                                                    showBoundingBoxes: false
                                                })),
                                        SceneJS.translate({x: -200, y: 200},
                                                SceneJS.loadCollada({
                                                    uri: "http://www.scenejs.org/library/v0.7/assets/examples/collada-duck/duck.dae" ,
                                                    showBoundingBoxes: false
                                                }))
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
var dist = 1500;
var speed = 0;
var eye;


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
            speed += 2;
        } else {
            speed -= 2;
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

    var pitchMat = Matrix.Rotation(pitch * 0.0174532925, $V([1,0,0]));
    var yawMat = Matrix.Rotation(yaw * 0.0174532925, $V([0,1,0]));

    eye = pitchMat.multiply($V([0,0,-dist])).elements;
    eye = yawMat.multiply($V(eye)).elements;

    exampleScene.render({eye: { x: eye[0], y: eye[1], z: eye[2] }});
};

SceneJS.onEvent("error", function(e) {
    window.clearInterval(pInterval);
    alert(e.exception.message ? e.exception.message : e.exception);
});

pInterval = setInterval("window.render()", 50);