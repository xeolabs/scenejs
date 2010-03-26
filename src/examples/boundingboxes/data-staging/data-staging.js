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
                                        density:300.0
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
                                                        lights: [
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
                                                        ]}
                                                            ,


                                                        /* Tiled floor
                                                         */
                                                            load({
                                                                uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                    "examples/tiled-floor/tiled-floor.js"
                                                            }),


                                                        /* And why not throw in Mars, just for fun
                                                         */
                                                            translate({x:100,y:40, z:100},
                                                                    scale({x:20,y:-20, z:20},
                                                                            load({
                                                                                uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                    "examples/planets/mars/mars.js"
                                                                            }))),

                                                        /* Our spiral staircase, wrapped with some material colour
                                                         */
                                                            material({
                                                                ambient:   { r: 0.5, g: 0.5, b: 0.5 },
                                                                diffuse:   { r: 0.6, g: 0.6, b: 0.6 },
                                                                specular:  { r: 1, g: 1, b: 1 },
                                                                emission: { r: 0.02, g: 0.02, b: 0.2 },
                                                                shininess: 60.0
                                                            },

                                                                // Why does this break stuff??
                                                                //
                                                                // Investigate ASAP

                                                                //                                                                    translate({x:-50, y:50 },
                                                                //                                                                            scale({x:20,y:20,z:20},
                                                                //                                                                                    texture({ uri: "http://scenejs.org/library/textures/stars/gigapixel-milky-way.gif", applyTo: "emission" },
                                                                //                                                                                            objects.sphere()))),
                                                                    translate({x: 100, y:20, z: 0 },
                                                                            SceneJS.scale({
                                                                                x: 20,
                                                                                y: 20,
                                                                                z: 20

                                                                            },
                                                                                    SceneJS.texture({
                                                                                        layers: [
                                                                                            {
                                                                                                uri:"general-zod.jpg",
                                                                                                wrapS: "repeat",
                                                                                                wrapT: "repeat",
                                                                                                flipY: false,

//                                                                                                rotate : (function() {
//                                                                                                    var _x = 0;
//                                                                                                    return function(data) {
//                                                                                                        if (_x > 360.0) _x = 0;
//                                                                                                        _x += 1;
//                                                                                                        return { z: _x };
//                                                                                                    };
//                                                                                                })(),
//
//                                                                                                translate : (function() {
//                                                                                                    var _x = 0;
//                                                                                                    return function(data) {
//                                                                                                        if (_x > 1.0) _x = 0;
//                                                                                                        _x += .01;
//                                                                                                        return { x: _x };
//                                                                                                    };
//                                                                                                })(),

                                                                                                scale : (function() {
                                                                                                    var _x = 0;
                                                                                                    return function(data) {
                                                                                                        if (_x > 10.0) _x = 0;
                                                                                                        _x += .01;
                                                                                                        return { x: _x, y: _x };
                                                                                                    };
                                                                                                })(),

                                                                                                applyTo:"emission"
                                                                                            }
                                                                                        ]},
                                                                                            SceneJS.material({

                                                                                                diffuse: { r: .0, g: .0, b: .0 },
                                                                                                emission: { r: 1., g: 1., b: 1. }
                                                                                            },
                                                                                                    SceneJS.objects.cube()
                                                                                                    )))),

                                                                /* Bounding box - roughly fitted to staircase
                                                                 */
                                                                    boundingBox({
                                                                        xmin: -20,
                                                                        ymin: -20,
                                                                        zmin: -20,
                                                                        xmax:  20,
                                                                        ymax:  20,
                                                                        zmax:  20,

                                                                        /* We'll do level-of-detail selection with this
                                                                         * boundingBox - five representations at
                                                                         * different sizes
                                                                         */
                                                                        levels: [
                                                                            10,     // Level 1
                                                                            200,    // Level 2
                                                                            400,    // Level 3
                                                                            500,    // Level 4
                                                                            600     // Level 5
                                                                        ]
                                                                    },

                                                                        /* Level 1 - a cube to at least show a dot on the horizon
                                                                         */
                                                                            objects.cube(),

                                                                        /* Level 2 - staircase with 12 very chunky steps
                                                                         * and no texture
                                                                         */
                                                                            withData({
                                                                                stepWidth:7,
                                                                                stepHeight:2.4,
                                                                                stepDepth:3,
                                                                                stepSpacing:6,
                                                                                innerRadius:10,
                                                                                numSteps:12,
                                                                                stepAngle:80 },

                                                                                    load({
                                                                                        uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                            "examples/spiral-staircase/spiral-staircase.js"
                                                                                    })),

                                                                        /* Level 3 - more detail; staircase with 24 chunky
                                                                         *  steps and no texture
                                                                         */
                                                                            withData({
                                                                                stepWidth:7,
                                                                                stepHeight:1.2,
                                                                                stepDepth:3,
                                                                                stepSpacing:3,
                                                                                innerRadius:10,
                                                                                numSteps:24,       // Half the number of steps, less coarse
                                                                                stepAngle:40 },

                                                                                    load({
                                                                                        uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                            "examples/spiral-staircase/spiral-staircase.js"
                                                                                    })),

                                                                        /* Level 4 - yet more detail; staircase with 48 fine
                                                                         * steps and no texture
                                                                         */
                                                                            withData({
                                                                                stepWidth:7,
                                                                                stepHeight:0.6,
                                                                                stepDepth:3,
                                                                                stepSpacing:1.5,
                                                                                innerRadius:10,
                                                                                numSteps:48,
                                                                                stepAngle:20 },

                                                                                    load({
                                                                                        uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                            "examples/spiral-staircase/spiral-staircase.js"
                                                                                    })),

                                                                        /* Level 5 - maximum detail; textured staircase with
                                                                         * 48 fine steps
                                                                         */
                                                                            withData({
                                                                                stepTexture: "marble",
                                                                                stepWidth:7,
                                                                                stepHeight:0.6,
                                                                                stepDepth:3,
                                                                                stepSpacing:1.5,
                                                                                innerRadius:10,
                                                                                numSteps:48,
                                                                                stepAngle:20 },

                                                                                    load({
                                                                                        uri:"http://scenejs.org/library/v0.7/assets/" +
                                                                                            "examples/spiral-staircase/spiral-staircase.js"
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
        var moveVec = _math.transformVector3(_math.rotationMat4v(moveAngle * 0.0174532925, [0,1,0]), [0,0,1]);
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
