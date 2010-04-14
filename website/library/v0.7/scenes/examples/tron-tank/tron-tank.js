/* First SceneJS COLLADA import example - the Tank Program from the 1982 Disney motion picture "Tron".
 *
 * Take it for a drive - if you get stuck, just re-run the scene to reset it.
 *
 * Mouse wheel controls speed, left/right drag to steer, up/down drag to change viewpoint height.
 *
 * This example loads the tank from three seperate "assets" defined within the same COLLADA file, then wraps
 * each within modelling transforms that are dynamically configured with parameters generated from mouse input.
 *
 * No collision detection in SceneJS yet, so you can drive straight through those walls!
 *
 * Tank model is courtesy of Abraham Katase, provided in the Google 3D Warehouse at http://tinyurl.com/y8oknya
 *
 * Lindsay S. Kay,
 * lindsay.kay@xeolabs.com
 *
 */
var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',

    /* Proxy that will mediate cross-domain asset loads (including our COLLADA file).
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

    /* Perspective transformation
     */
        SceneJS.perspective({  fovy : 40.0, aspect : 1.0, near : 0.10, far : 7000.0 },

            /* Some fog for fun
             */
                SceneJS.fog({
                    mode:"linear",
                    color:{r:.50, g:.50,b:.50},
                    start: 0,
                    end:300  ,
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

                            up : { x: 0, y: 1, z: .0 }
                        },
                            /* Lighting
                             */
                                SceneJS.lights({
                                    sources: [
                                        {
                                            type:                   "dir",
                                            color:                  { r: 1.0, g: 1.0, b: 0.5 },
                                            // Yellowish
                                            diffuse:                true,
                                            specular:               true,
                                            dir:                    { x: 0.0, y: -1, z: -1.0 }
                                        } ,
                                        {
                                            type:                   "dir",
                                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                            diffuse:                true,
                                            specular:               true,
                                            dir:                    { x: 1.0, y: .5, z: -1.0  }
                                        } ,
                                        {
                                            type:                   "dir",
                                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                            diffuse:                true,
                                            specular:               true,
                                            dir:                    { x: -1.0, y: .5, z: 1.0  }
                                        }
                                    ]},

                                    /* The Tron Tank - this is composed of three assets loaded from the same
                                     * COLLADA file: "Tank", "Gun" and "Pilot1" (the red chevron
                                     * symbol on he tank's bonnet). The assets are each wrapped in modelling
                                     * transforms to position and orient them within the scene. Some of the
                                     * transforms are dynamically configured with positions and angles that
                                     * are  injected into the scene when rendered, which is generated
                                     * from mouse input.
                                     *
                                     */
                                        SceneJS.translate(
                                                function(data) {
                                                    return {
                                                        x: data.get("tron.tank.pos.x") || 0,
                                                        y: data.get("tron.tank.pos.y") || 5,
                                                        z: data.get("tron.tank.pos.z") || 0
                                                    };
                                                },

                                                SceneJS.rotate(
                                                        function(data) {
                                                            return {y: 1, angle: data.get("tron.tank.yaw") + 180 || 180 };
                                                        },
                                                        SceneJS.translate({ x:8, y: -5,z: 10},
                                                                SceneJS.rotate({x: 1, angle: 270 },
                                                                        SceneJS.scale({x:.1, y: .1, z: .1},

                                                                            /* Tank body asset
                                                                             */
                                                                                SceneJS.loadCollada({
                                                                                    uri: "http://www.scenejs.org/library/v0.7/assets/examples/tank/models/Tank.dae",
                                                                                    node:"Tank"
                                                                                }),
                                                                                SceneJS.translate({x:-50, y: 160, z: 5},
                                                                                        SceneJS.loadCollada({
                                                                                            uri: "http://www.scenejs.org/library/v0.7/assets/examples/tank/models/Tank.dae",
                                                                                            node:"Pilot1"
                                                                                        })),

                                                                            /* Gun asset
                                                                             */
                                                                                SceneJS.translate({x:-57, y: 63, z: 0},
                                                                                        SceneJS.rotate(
                                                                                                function(data) {
                                                                                                    return {z:1, angle: data.get("tron.tank.gun.yaw") || 0};
                                                                                                },
                                                                                                SceneJS.translate({x:39.0, y: -76.5, z: 52},

                                                                                                        SceneJS.loadCollada({
                                                                                                            uri: "http://www.scenejs.org/library/v0.7/assets/examples/tank/models/Tank.dae",
                                                                                                            node:"Gun"
                                                                                                        }))
                                                                                                )
                                                                                        )
                                                                                )
                                                                        )
                                                                )
                                                        )
                                                ),

                                    /* Tiled floor, loaded from the SceneJS asset library
                                     */
                                        SceneJS.load({
                                            uri:"http://scenejs.org/library/v0.7/assets/" +
                                                "examples/grid-floor/grid-floor.js"
                                        }),

                                    /* Canyon walls, a bunch of cubes
                                     */
                                        SceneJS.material({
                                            baseColor:      { r: 0.5, g: 0.5, b: 0.5 },
                                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                            specular:       10.9,
                                            shine:          20.0
                                        },
                                                SceneJS.translate({ x: -75, y: 0, z: 0},
                                                        SceneJS.rotate({y: 1, angle: 6 },
                                                                SceneJS.objects.cube({xSize: 50, ySize: 30, zSize: 50}))),

                                                SceneJS.translate({ x: 80, y: 0, z: 0},
                                                        SceneJS.rotate({y: 1, angle: 0 },
                                                                SceneJS.objects.cube({xSize: 50, ySize: 30, zSize: 50}))),

                                                SceneJS.translate({ x: -80, y: 0, z: 80},
                                                        SceneJS.rotate({y: 1, angle: -12 },
                                                                SceneJS.objects.cube({xSize: 50, ySize: 30, zSize: 50}))),

                                                SceneJS.translate({ x: 80, y: 0, z: 40},
                                                        SceneJS.rotate({y: 1, angle: -12 },
                                                                SceneJS.objects.cube({xSize: 50, ySize: 30, zSize: 50}))),

                                                SceneJS.translate({ x: 120, y: 0, z: 140},
                                                        SceneJS.rotate({y: 1, angle: -12 },
                                                                SceneJS.objects.cube({xSize: 50, ySize: 30, zSize: 50}))),

                                                SceneJS.translate({ x: -60, y: 0, z: 160},
                                                        SceneJS.rotate({y: 1, angle: -12 },
                                                                SceneJS.objects.cube({xSize: 50, ySize: 30, zSize: 50})))
                                                )
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
var tankPos = { x: 0, y: 0, z: -100 };
var eyeDir = 0;
var eye = { x: 0, y: 10, z: -400 };

var lastX;
var lastX2;
var lastY2;
var lastY;
var dragging = false;

var tankYaw = 0;
var tankYawInc = 0;

var trailYaw = 0;
var trailYawInc = 0;

var pitch = 25;
var pitchInc = 0;

var turretRotating = false;

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = exampleScene.getCanvas();

function mouseDown(event) {
    lastX = event.clientX;
    lastX2 = lastX;
    lastY2 = lastY;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;

    tankYawInc = 0;
    pitchInc = 0;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        tankYawInc = (event.clientX - lastX) * -0.01;
        pitchInc = (lastY - event.clientY) * 0.001;
        lastX2 = event.clientX;
        lastY2 = event.clientY;
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

var pInterval;

window.render = function() {
    try {
        pitch += pitchInc;

        if (pitch < 1) {
            pitch = 1;
        }

        if (pitch > 80) {
            pitch = 80;
        }

        tankYaw += tankYawInc;
        var tankYawMat = Matrix.Rotation(tankYaw * 0.0174532925, $V([0,1,0]));

        var moveVec = [0,0,1];

        moveVec = tankYawMat.multiply($V(moveVec)).elements;

        var trailVec = [0,0, -1 - (pitch * 0.02)];

        var trailPitchMat = Matrix.Rotation(pitch * 0.0174532925, $V([1,0,0]));
        var trailYawMat = Matrix.Rotation(trailYaw * 0.0174532925, $V([0,1,0]));

        trailVec = trailPitchMat.multiply($V(trailVec)).elements;
        trailVec = trailYawMat.multiply($V(trailVec)).elements;

        if (speed) {
            tankPos.x += moveVec[0] * speed;
            tankPos.y += moveVec[1] * speed;
            tankPos.z += moveVec[2] * speed;
        }

        if (eye.y > 100.0) {
            eye.y = 100.0;
        }

        if (eye.y < 20.0) {
            eye.y = 20.0;
        }

        eye.x = tankPos.x + (trailVec[0] * 35);
        eye.y = tankPos.y + (trailVec[1] * 35);
        eye.z = tankPos.z + (trailVec[2] * 35);

        var timeSeconds = (new Date().getTime() - timeStarted) / 1000;
        exampleScene.render({
            eye : eye,
            look: { x: tankPos.x, y: tankPos.y, z : tankPos.z },
            "tron.tank.pos.x" : tankPos.x,
            "tron.tank.pos.z" : tankPos.z,
            "tron.tank.yaw" : tankYaw,
            "tron.tank.gun.yaw" : -tankYaw,

            timeSeconds: timeSeconds});

        if (trailYaw > tankYaw) {
            trailYaw -= (((trailYaw - tankYaw) * 0.01)) + 0.1;
        } else if (trailYaw < tankYaw) {
            trailYaw += (((tankYaw - trailYaw) * 0.01)) + 0.1;
        }
    } catch (e) {
        clearInterval(pInterval);
        throw e;
    }
};

pInterval = setInterval("window.render()", 10);

