/**
 * SceneJS Example - Ray picking example
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 * https://github.com/xeolabs/scenejs/wiki/picking
 */



/*----------------------------------------------------------------------
 * Function to return JSON defining a 3D array of teapots.
 *
 * Each teapot has a random colour, and is wrapped by a "name" node
 * which identifies the teapot's world-space location.
 *
 * A picking hit will contain the name of the picked teapot.
 *---------------------------------------------------------------------*/

function createTeapotArray() {

    var nodes = [];

    for (var x = -250; x <= 250; x += 100) {
        for (var y = -250; y <= 250; y += 100) {
            for (var z = -250; z <= 250; z += 100) {
                nodes.push({
                    type: "material",
                    baseColor:      { r: 0.2 + Math.random(), g: 0.2 + Math.random(), b: 0.2 + Math.random() },
                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                    specular:       0.9,
                    shine:          6.0,

                    nodes: [
                        {
                            type: "translate",
                            x: x,
                            y: y,
                            z: z,

                            nodes: [
                                {
                                    type: "name",
                                    name: "object_" + x + "_" + y + "_" + z + "",
                                    nodes: [
                                        {
                                            type: "scale",
                                            x: 10.0,
                                            y: 10.0,
                                            z: 10.0,

                                            nodes: [
                                                {
                                                    type:"teapot"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            }
        }
    }

    return {
        type: "node",
        nodes: nodes
    };
}

/*----------------------------------------------------------------------
 * Create scene containing our array of teapots.
 *
 * The scene also contains a white sphere that we will move to the
 * world-space location of the ray intersection of each pick hit, to
 * indicate the picked point on the surface of each teapot we pick.
 *---------------------------------------------------------------------*/

SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            id: "theLookAt",
            eye : { x: 0, y: 0, z: -400},
            look : { x : 0.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",

                    optics: {
                        type: "perspective",
                        fovy : 45.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 1000.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: -0.5, z: 0.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.7, g: 0.7, b: 0.7 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.5, z: 1.0 }
                        },
                        {
                            type: "node",
                            nodes: [

                                {
                                    type: "material",
                                    baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:       0.9,
                                    shine:          6.0,

                                    nodes: [

                                        /*-----------------------------------------------------------------------
                                         * Add array of pickable teapots
                                         *----------------------------------------------------------------------*/

                                        createTeapotArray(),

                                        /*-----------------------------------------------------------------------
                                         * White dot that indicates world-space ray intersection point
                                         * of each pick hit.
                                         *
                                         * We'll update its translation with the pick position on each hit.
                                         *----------------------------------------------------------------------*/
                                        {
                                            type: "name",
                                            name: "indicator",
                                            nodes: [
                                                {
                                                    type: "material",
                                                    baseColor: { r: 1, g: 1, b: 1 },
                                                    specularColor: { r: 1, g: 1, b: 1 },

                                                    nodes: [
                                                        {
                                                            type: "translate",
                                                            id: "pickIndicator",

                                                            x: -20,
                                                            z: -70,

                                                            nodes: [
                                                                {
                                                                    type: "scale",
                                                                    x: 1.5,
                                                                    y: 1.5,
                                                                    z: 1.5,
                                                                    nodes: [

                                                                        {
                                                                            type: "sphere"
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }

                            ]
                        }
                    ]
                }
            ]
        }
    ]
});


var scene = SceneJS.scene("theScene");
var indicatorSphere = scene.findNode("pickIndicator");
var lookAt = scene.findNode("theLookAt");

var canvas = document.getElementById("theCanvas");

var updated = false;

var dist = -400;

var lastX;
var lastX2;
var lastY2;
var lastY;
var dragging = false;

var yaw = 0;
var pitch = 0;

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp(event) {
    dragging = false;

    //    if (event.clientX == lastX && event.clientY == lastY) {
    //
    //
    //    }
}

function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * -.1;
        pitch += (lastY - event.clientY) * .1;
        lastX = event.clientX;
        lastY = event.clientY;
        updated = true;

    } else {

        /*-----------------------------------------------------------------------
         * On click, do ray-pick; if we get a hit, update the white
         * indicator sphere's translation to show the picked position
         *----------------------------------------------------------------------*/

        var coords = clickCoordsWithinElement(event);

        var hit = scene.pick(coords.x, coords.y, { rayPick: true });

        if (hit) {   // Ignore hits on the indicator sphere

            if (hit.name != "indicator") {
                
                $("#pickIndicator").show();

                var worldPos = hit.worldPos;

                indicatorSphere.set({
                    x: worldPos[0],
                    y: worldPos[1],
                    z: worldPos[2]
                });

                updateLabelPos(
                        hit.name,
                        hit.canvasPos,
                        hit.worldPos);
            }

        } else { // Nothing picked
            $("#pickIndicator").hide();
        }
    }
}


function clickCoordsWithinElement(event) {
    var coords = { x: 0, y: 0};
    if (!event) {
        event = window.event;
        coords.x = event.x;
        coords.y = event.y;
    } else {
        var element = event.target ;
        var totalOffsetLeft = 0;
        var totalOffsetTop = 0 ;

        while (element.offsetParent)
        {
            totalOffsetLeft += element.offsetLeft;
            totalOffsetTop += element.offsetTop;
            element = element.offsetParent;
        }
        coords.x = event.pageX - totalOffsetLeft;
        coords.y = event.pageY - totalOffsetTop;
    }
    return coords;
}

function updateLabelPos(pickName, canvasPos, worldPos) {

    var offset = $("#theCanvas").offset();

    $("#pickIndicator").show();
    $("#pickIndicator").html(
            "Hit info:<br/>"
                    + "<br/>name: \"" + pickName + "\""
                    + "<br/>canvasPos : " + roundFloat(canvasPos[0]) + ", " + roundFloat(canvasPos[1])
                    + "<br/>worldPos : " + roundFloat(worldPos[0]) + ", " + roundFloat(worldPos[1]) + ", " + roundFloat(worldPos[2])
            );

    $("#pickIndicator").css("left", offset.left + canvasPos[0] + 5);
    $("#pickIndicator").css("top", offset.top + canvasPos[1] + 5);
}

function roundFloat(v) {
    return Math.round(v * 10) / 10;
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
            dist -= 10.0;
        } else {
            dist += 10.0;
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
    updated = true;
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);
canvas.addEventListener('mousewheel', mouseWheel, true);
canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

scene.start({
    idleFunc: function() {

        if (!updated) {
            return;
        }
        updated = false;

        var eyeVec = [0,0,dist];

        var pitchMat = Matrix.Rotation(pitch * 0.0174532925, $V([1,0,0]));
        var yawMat = Matrix.Rotation(yaw * 0.0174532925, $V([0,1,0]));

        eyeVec = pitchMat.multiply($V(eyeVec)).elements;
        eyeVec = yawMat.multiply($V(eyeVec)).elements;

        lookAt.set({
            eye: {x: eyeVec[0], y: eyeVec[1], z: eyeVec[2] }
        });

        $("#pickIndicator").hide();
    }
});

