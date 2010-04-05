/* Issue #18 - http://github.com/xeolabs/scenejs/issues/#issue/18
 *
 * There's supposed to be a green sphere here as well as the tiled floor.
 * 
 * It appears momentarily, then disappears.
 *
 * This happens in Chrome dev, but not in Minefield.
 *
 */
var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',

    /* Proxy that will mediate cross-domain asset loads.
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

    /* Write logging output to a DIV element in the page
     */
        SceneJS.loggingToPage({ elementId: "logging" },

            /* A renderer node clears the depth and colour buffers and sets GL modes
             */
                SceneJS.renderer({
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 600, height: 600},
                    clearColor: { r:0.5, g: 0.5, b: 0.5 },
                    enableTexture2D:true
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 45.0, aspect : 1.0, near : 0.10, far : 7000.0 },

                            /* Fog, nice and thick, just for fun
                             */
                                SceneJS.fog({
                                    mode:"linear",
                                    color:{r:.50, g:.50,b:.50},
                                    start: 0,
                                    end:600  ,
                                    density:300.0
                                },

                                    /* View transform - takes viewing parameters through the data passed
                                     * into this scene as it is rendered. Those parameters are generated
                                     * in mouse handlers outside the scene graph - see below.
                                     */
                                        SceneJS.lookAt({

                                            eye : function(data) {
                                                return data.get("eye");
                                            },

                                            look : function(data) {
                                                return data.get("look");
                                            },

                                            up : { y: 1.0 }
                                        },

                                                SceneJS.lights({
                                                    sources: [
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: .8, g: 0.8, b: 0.8 },
                                                            diffuse:                true,
                                                            specular:               false,
                                                            pos:                    { x: 100.0, y: 4.0, z: -100.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        }
                                                        ,
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            pos:                    { x: 100.0, y: -100.0, z: -100.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        },
                                                        {
                                                            type:                   "dir",
                                                            color:                  { r: 0.6, g: 0.6, b: 0.6 },
                                                            diffuse:                true,
                                                            specular:               true,
                                                            pos:                    { x: -1000.0, y: -1000.0, z: 0.0 },
                                                            constantAttenuation:    1.0,
                                                            quadraticAttenuation:   0.0,
                                                            linearAttenuation:      0.0
                                                        }
                                                    ]},

                                                        SceneJS.material({
                                                            baseColor:      { r: 0.4, g: 1.0, b: 1.0 },
                                                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                                                            specular:       0.9,
                                                            shine:          6.0
                                                        },

                                                            
                                                            //=====================================================
                                                            // Disappearing green sphere
                                                            //=====================================================

                                                                SceneJS.translate({y:50},
                                                                        SceneJS.scale({x:10,y:10,z:10},
                                                                                SceneJS.objects.sphere()
                                                                                )
                                                                        ),


                                                            /* Tiled floor asset from the SceneJS library
                                                             */
                                                                SceneJS.load({
                                                                    uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                        "examples/tiled-floor/tiled-floor.js"
                                                                })


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

var eye = { x: 0, y: 10, z: -150 };
var look = { x :  0, y: 20, z: 0 };
var speed = 0;
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;
var moveAngle = 0;
var moveAngleInc = 0;


/* Always get the canvas from the scene graph - it might bind to
 * a default one of it can't find the one specified.
 */
var canvas = exampleScene.getCanvas();

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
        moveAngleInc = (event.clientX - lastX) * 0.002;
        speed = (lastY - event.clientY) * 0.01;
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

    /* Using Sylvester Matrix Library to create this matrix
     */
    var rotMat = Matrix.Rotation(moveAngle * 0.0174532925, $V([0,1,0]));
    var moveVec = rotMat.multiply($V([0,0,1])).elements;
    if (speed) {

        eye.x += moveVec[0] * speed;
        eye.z += moveVec[2] * speed;
    }
    exampleScene.render({ eye : eye, look: { x: eye.x + moveVec[0], y: eye.y, z : eye.z + moveVec[2] }});
};

/* Continue animation
 */
var pInterval = setInterval("window.render()", 10);





