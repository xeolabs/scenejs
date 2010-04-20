/*
 COLLADA Load Example - VaST Courtyard House

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Demonstrates the import of a COLLADA asset - a house model with 146 textures, courtesty of VaST architecture:

 http://www.vastarchitecture.com/Projects_Residential/Courtyard/Courtyard.html

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 injected into the scene graph along with "dist" for the distance of the eye on the Z-axis. Take a close look
 at the lookAt and rotate nodes, which use these variables, and the invocation of the "render" function near
 the bottom of this example, which passes them in.

 */
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
        SceneJS.perspective({
            fovy : 55.0,
            aspect : 2.0,
            near : 0.10,
            far : 8000.0 },

            /* Viewing transform:
             */
                SceneJS.lookAt(function(data) {
                    return {
                        eye : data.get("eye"),
                        look : { x: -1.0, y: 0, z: 0 },
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

//                                  SceneJS.material({
//                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
//                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
//                                            specular:       0.9,
//                                            shine:          6.0
//                                        },
//                                          SceneJS.scale({x: 2200, y: 2200, z: 2200},
//                                SceneJS.stationary(  SceneJS.objects.sphere()))),

                            /* Next, modelling transforms to orient the house.  These particular
                             * transforms are dynamically configured from data injected into the
                             * scene graph when its rendered:
                             */

                            /* Load our COLLADA house model, rotating it to align
                             * with our modelling coordinate system:
                             */
                                SceneJS.rotate({x:1,angle:270},
//                                        SceneJS.material({
//                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
//                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
//                                            specular:       0.9,
//                                            shine:          6.0
//                                        },
//                                                SceneJS.generator(
//                                                        (function() {
//                                                            var elems = [];
//                                                            for (var i = 0; i < 10; i++) {
//                                                                       var x= (400 * Math.random()) - 200.0;
//                                                                        var y= (400 * Math.random()) - 200.0;
//                                                                        var z= (400 * Math.random()) - 200.0;
//
//                                                                    elems.push({
//                                                                        x: x,
//                                                                        y: y,
//                                                                        z: z
//                                                                    });
//
//                                                            }
//                                                            var j = 0;
//                                                            return function() {
//                                                                if (i < elems.length) {
//                                                                    return { param: elems[i++] };
//                                                                } else {
//                                                                    i = 0;
//                                                                }
//                                                            };
//                                                        })(),
//
//                                                        SceneJS.translate(function(data) {
//                                                            return data.get("param");
//                                                        },
//                                                                SceneJS.boundingBox({
//                                                                    xmin: -3,
//                                                                    ymin: -3,
//                                                                    zmin: -3,
//                                                                    xmax: 3,
//                                                                    ymax: 3,
//                                                                    zmax: 3
//                                                                },
//                                                                        SceneJS.scale({ x:2, y:2, z:2 },
//                                                                                SceneJS.objects.teapot())
//                                                                        )
//                                                                )
//                                                        )
//                                                )
//
//                                        )
                                                                    SceneJS.loadCollada({
                                                                        uri: "http://www.scenejs.org/library/v0.7/assets/examples/" +
                                                                             "courtyard-house/models/model.dae" ,
                                                                        showBoundingBoxes: false
                                                                    })
////
//                                          SceneJS.loadCollada({
//                                                    uri: "http://www.scenejs.org/library/v0.7/assets/examples/cube/cube.dae"
//                                                })
                                        )
                                )
                        )
                )

        )
        ;


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
var dist = 0;
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

function showTeapots(divId) {
    document.getElementById(divId).innerHTML ="" +  window.countTeapots + ", eye=" + eye[0] + "," + eye[1] + ', ' + eye[2];
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

pInterval = setInterval("window.render()", 10);