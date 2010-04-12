/*  Demonstrates level-of-detail selection. This scene contains a staircase which switches
 *  representations as a function of it's projected view-volume size. The staircase is
 * a parameterised asset, dynamically loaded from the SceneJS content library.
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

        /* Write logging output to a DIV element in the page
         */
            loggingToPage({ elementId: "logging" },

                /* A renderer node clears the depth and colour buffers and sets GL modes
                 */
                    renderer({
                        clear : { depth : true, color : true},
                        viewport:{ x : 1, y : 1, width: 1600, height: 800},
                        clearColor: { r:0.5, g: 0.5, b: 0.5 },
                        enableTexture2D:true
                    },

                        /* Perspective transformation
                         */
                            perspective({  fovy : 45.0, aspect : 2.0, near : 0.10, far : 7000.0 },

                                /* Fog, nice and thick, just for fun
                                 */
                                    fog({
                                        mode:"linear",
                                        color:{r:.50, g:.50,b:.50},
                                        start: 0,
                                        end:600  ,
                                        density:200.0
                                    },

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

                                                up : { y: 1.0 }
                                            },


                                                /* Lighting
                                                 */
                                                    lights({
                                                        sources: [
                                                            {
                                                    type:                   "dir",
                                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                    diffuse:                true,
                                                    specular:               true,
                                                    dir:                    { x: 1.0, y: -1.0, z: 1.0 }
                                                },
                                                {
                                                    type:                   "dir",
                                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                    diffuse:                true,
                                                    specular:               true,
                                                    dir:                    { x: -1.0, y: -1.0, z: -3.0 }
                                                }
                                                        ]},


                                                        /* Our spiral staircase, wrapped with some material colour
                                                         */

                                                                /* Tiled floor
                                                                 */
                                                                    load({
                                                                        uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                            "examples/tiled-floor/tiled-floor.js"
                                                                    }),


                                                                  //  SceneJS.translate({y:3, x: 100, z: 200},
                                                                            SceneJS.rotate({angle:120, y: 1},
                                                                                    SceneJS.rotate({angle:-90, x: 1},
                                                                                            SceneJS.scale({x:.1, y: .1, z: .1},
                                                                                                    SceneJS.loadCollada({
                                                                                                        uri: "http://www.scenejs.org/library/v0.7/assets/examples/fallingwater/models/model.dae"
                                                                                                    }))))//)

                                                           
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

    var eye = { x: 0, y: 22, z: -550 };
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


}
