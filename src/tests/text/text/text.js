/**
 * SceneJS Example - A Dream Within a Dream, by Edgar Allen Poe, using the SceneJS.Text Node
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * January 2010
 */
var exampleScene = SceneJS.scene({

    canvasId: 'theCanvas' },

        SceneJS.perspective({
            fovy : 55.0,
            aspect : 2.0,
            near : 0.10,
            far : 5000.0 },

                SceneJS.lookAt(function(data) {
                    return {
                        eye : { x: -1.0, y: 0.0, z: data.get("dist") },
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
                                SceneJS.material({
                                    baseColor:      { r: 1, g: 1.3, b: 1.9 },
                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:       0.9,
                                    shine:          6.0
                                },
                                        //------------------------------------------------------------------------------
                                        // These rotation nodes allow us to rotate the text around using angles injected
                                        // into the scene graph that are updated by mouse handlers
                                        //------------------------------------------------------------------------------

                                        SceneJS.rotate(function(data) {
                                            return {
                                                angle: data.get('yaw'), y : 1.0
                                            };
                                        },
                                                SceneJS.rotate(function(data) {
                                                    return {
                                                        angle: data.get('pitch'), x : 1.0
                                                    };
                                                },
                                                        SceneJS.translate({x:100, z: 100},
                                                                SceneJS.scale({x:5,y:5,z:5},

                                                                    //--------------------------------------------------
                                                                    // We'll set a fairly narrow line width for our text
                                                                    //--------------------------------------------------

                                                                        SceneJS.renderer({ lineWidth:1 },

                                                                                SceneJS.text({
                                                                                    text: "Take this kiss upon the brow!\n " +
                                                                                          "And, in parting from you now,\n " +
                                                                                          "Thus much let me avow--\n " +
                                                                                          "You are not wrong, who deem\n " +
                                                                                          "That my days have been a dream;\n " +
                                                                                          "Yet if hope has flown away\n " +
                                                                                          "In a night, or in a day,\n " +
                                                                                          "In a vision, or in none,\n " +
                                                                                          "Is it therefore the less gone?\n " +
                                                                                          "All that we see or seem\n " +
                                                                                          "Is but a dream within a dream.\n " +
                                                                                          "I stand amid the roar\n " +
                                                                                          "Of a surf-tormented shore," +
                                                                                          "And I hold within my hand\n " +
                                                                                          "Grains of the golden sand--\n " +
                                                                                          "How few! yet how they creep\n " +
                                                                                          "Through my fingers to the deep,\n " +
                                                                                          "While I weep--while I weep!\n " +
                                                                                          "O God! can I not grasp\n " +
                                                                                          "Them with a tighter clasp?\n " +
                                                                                          "O God! can I not save\n " +
                                                                                          "One from the pitiless wave?\n " +
                                                                                          "Is all that we see or seem\n " +
                                                                                          "But a dream within a dream?"
                                                                                }))
                                                                        )
                                                                )
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

var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;
var dist = -10;

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
            dist += 10;
        } else {
            dist -= 10;
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
    exampleScene.render({dist: dist, yaw: yaw, pitch: pitch});
};

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

pInterval = setInterval("window.render()", 10);