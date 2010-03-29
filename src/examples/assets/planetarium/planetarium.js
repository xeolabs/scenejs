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
                        viewport:{ x : 1, y : 1, width: 600, height: 600},
                        clearColor: { r:.5, g: 0.5, b: 0.5 },
                        enableTexture2D:true
                    },

                        /* Perspective transformation
                         */
                            perspective({  fovy : 45.0, aspect : 1.0, near : 0.10, far : 7000.0 },

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

                                                /* Sky sphere
                                                 */
                                                    withData({
                                                        radius: 5000
                                                    },
                                                            load({
                                                                uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                    "backgrounds/sphere/starrySky.js"
                                                            })),

                                                /* Lighting
                                                 */
                                                    lights({
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

                                                        /* Mars
                                                         */

                                                            rotate((function() {
                                                                var angle = 0;
                                                                return function(data) {
                                                                    angle += data.get("time") * 0.01;
                                                                    if (angle > 360.0) {
                                                                        angle = 0;
                                                                    }
                                                                    return {
                                                                        angle: angle,
                                                                        y: 1
                                                                    };
                                                                };
                                                            }()),
                                                                    translate({x:200,y:40},
                                                                            scale({x:20,y:-20, z:20},
                                                                                    load({
                                                                                        uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                            "examples/planets/mars/mars.js"
                                                                                    })))),

                                                            translate({x:150,y:40},
                                                                    scale({x:20,y:-20, z:20},
                                                                            load({
                                                                                uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                    "examples/planets/earth/earth.js"
                                                                            })))
                                                            )
                                        
                                            )
                                    )
                            )
                    )
            )
            ;

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

    /* For texture animation
     */
    var timeLast = (new Date()).getTime();


    /* Always get canvas from scene - it will try to bind to a default canvas
     * when it can't find the one specified
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
        var timeNow = (new Date()).getTime();
        moveAngle -= moveAngleInc;
        var moveVec = _math.transformVector3(_math.rotationMat4v(moveAngle * 0.0174532925, [0,1,0]), [0,0,1]);
        if (speed) {

            eye.x += moveVec[0] * speed;
            eye.z += moveVec[2] * speed;
        }
        exampleScene.render({
            eye : eye,
            look: {
                x: eye.x + moveVec[0],
                y: eye.y,
                z : eye.z + moveVec[2]
            },
            time : timeNow - timeLast
        });

        timeLast = timeNow;
    };

    /* Continue animation
     */
    var pInterval = setInterval("window.render()", 10);


}
