/*
 * Another COLLADA demo - bridge of the USS Excelsior from the 1984 film,
 * Star Trek III: The Search for Spock.
 *
 * Use the mouse to fly around the bridge; drag left and right, up and down to
 * change heading and use the mouse wheel to accellerate forwards and backwards.
 *
 * Model courtesy of Google 3D Warehouse: http://bit.ly/btoGPT
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 */
with (SceneJS) {
    var exampleScene = scene({
        canvasId: 'theCanvas',

        /* Proxy that will mediate cross-domain asset loads.
         */
        proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

        /* Perspective transformation
         */
            perspective({  fovy : 40.0, aspect : 2.0, near : 0.10, far : 1000.0 },


                /* View transform - takes viewing parameters through the data passed
                 * into this scene as it is rendered. Those parameters are generated
                 * in mouse handlers outside the scene graph - see below.
                 */
                    lookAt({

                        eye : function(data) {
                            return data.get("eye");
                        },

                        look : function(data) {
                            return data.get("look");
                        },

                        up : { x: 0, y: 1, z: .0 }
                    },

                            SceneJS.rotate({z: 1, angle: 180},
                                    SceneJS.translate({x: -700, y: 60, z: -600},
                                            SceneJS.rotate({x: 1, angle: 90},

                                                    lights({
                                                        sources: [
                                                            {
                                                                type:                   "dir",
                                                                color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                                diffuse:                true,
                                                                specular:               true,
                                                                dir:                    { x: 0.0, y: 0.0, z: -1.0  }
                                                            }
                                                        ]},

                                                            SceneJS.loadCollada({
                                                                uri: "http://www.scenejs.org/library/v0.7/assets/" +
                                                                     "examples/excelsior-bridge/models/model.dae",
                                                                node:"Model"
                                                            })))
                                            )
                                    )
                            )
                    )
            );

    /*----------------------------------------------------------------------
     * Scene rendering loop and mouse handler stuff follows
     *---------------------------------------------------------------------*/
    var timeStarted = new Date().getTime();
    var speed = 0;

    var tankPos = { x: 0, y: 0, z: 0 };

    var eyeDir = 0;
    var eye = { x: 0, y: 0, z: 0 };

    var lastX;
    var lastY;
    var dragging = false;

    var yaw = 0;
    var yawInc = 0;
    var pitch = 0;
    var pitchInc = 0;

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
        yawInc = 0;
        pitchInc = 0;
    }

    /* On a mouse drag, we'll re-render the scene, passing in
     * incremented angles in each time.
     */
    function mouseMove(event) {
        if (dragging) {
            yawInc = (event.clientX - lastX) * -0.005;
            pitchInc = (lastY - event.clientY) * -0.005;
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

    window.render = function() {
        pitch += pitchInc;
        yaw += yawInc;

        if (pitch < -90) {
            pitch = -90;
        }

        if (pitch > 90) {
            pitch = 90;
        }
        var pitchMat = SceneJS_math_rotationMat4v(pitch * 0.0174532925, [1,0,0]);
        var yawMat = SceneJS_math_rotationMat4v(yaw * 0.0174532925, [0,1,0]);

        var moveVec = [0,0, 1];

        moveVec = SceneJS_math_transformVector3(pitchMat, moveVec);
        moveVec = SceneJS_math_transformVector3(yawMat, moveVec);

        if (speed) {
            eye.x -= moveVec[0] * speed;
            eye.y -= moveVec[1] * speed;
            eye.z -= moveVec[2] * speed;

        }
        exampleScene.render({
            eye : eye,
            look: {
                x: eye.x + moveVec[0],
                y: eye.y + moveVec[1],
                z: eye.z + moveVec[2]
            }
        });
    };


    /* Continue animation
     */
    var pInterval = setInterval("window.render()", 10);


}
