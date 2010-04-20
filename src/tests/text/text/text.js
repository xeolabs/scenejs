/*
 COLLADA Load Example - Seymour Plane Test Model

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Demonstrates the import of a COLLADA asset - the Seymour test model from collada.org

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 injected into the scene graph. Take a close look at the rotate nodes, which use these variables, and
 the invocation of the "render" function near the bottom of this example, which passes them in.

 */
var exampleScene = SceneJS.scene({

    /* Bind to a WebGL canvas:
     */
    canvasId: 'theCanvas' },

    /* Perspective transform:
     */
        SceneJS.perspective({
            fovy : 55.0,
            aspect : 2.0,
            near : 0.10,
            far : 5000.0 },

            /* Viewing transform:
             */
                SceneJS.lookAt(function(data) {
                    return {
                        eye : { x: -1.0, y: 0.0, z: data.get("dist") },
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

                                SceneJS.material({
                                    baseColor:      { r: 1, g: 1.3, b: 1.9 },
                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:       0.9,
                                    shine:          6.0
                                },
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
                                                      //  SceneJS.objects.cube(),
                                                        SceneJS.translate({x:100, z: 100},
                                                            //SceneJS.objects.cube(),
                                                            /* Load our COLLADA airplane model:
                                                             */
                                                              //  SceneJS.billboard(
                                                                        SceneJS.renderer({lineWidth:1 },
                                                                                SceneJS.scale({x:5,y:5,z:5},
                                                                                        SceneJS.text({
                                                                                            text: "Take this kiss upon the brow!\nAnd, in parting from you now,\nThus much let me avow--\nYou are not wrong, who deem\nThat my days have been a dream;\nYet if hope has flown away\nIn a night, or in a day,\nIn a vision, or in none,\nIs it therefore the less gone?\nAll that we see or seem\nIs but a dream within a dream.\nI stand amid the roar\nOf a surf-tormented shore,And I hold within my hand\nGrains of the golden sand--\nHow few! yet how they creep\nThrough my fingers to the deep,\nWhile I weep--while I weep!\nO God! can I not grasp\nThem with a\n tighter clasp?\nO God! can I not save\nOne from the pitiless wave?\nIs all that we see or seem\nBut a dream within a dream?"
                                                                                        })))))))//)
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

var i = 0;
window.render = function() {
    if (i++ > 0) {
        window.clearInterval(pInterval);
    }
    exampleScene.render({dist: dist, yaw: yaw, pitch: pitch});
};

SceneJS.onEvent("error", function() {
    window.clearInterval(pInterval);
});

pInterval = setInterval("window.render()", 10);