/*

 Node render masking using the "tag" node

 https://github.com/xeolabs/scenejs/wiki/tag
 
 */

SceneJS.createScene({
    id: "theScene",
    canvasId: "theCanvas",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 50 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 0.8 },
                            diffuse:                true,
                            specular:               false,
                            dir:                    { x: 0.0, y: -0.5, z: -1.0 }
                        },
                        {
                            type: "rotate",
                            id: "pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [
                                        {
                                            type: "node",
                                            id: "attach-objects-here"
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

var tags = [
    {
        tag: "apple pear orange",
        color: { r: 1 }
    },
    {
        tag: "apple pear",
        color: { g: 1 }
    },
    {
        tag: "apple orange",
        color: { b: 1 }
    }
];

var i = 0;

var contentNode = scene.findNode("attach-objects-here");

for (var x = -10.0; x < 10.0; x += 3.0) {
    for (var z = -10.0; z < 10.0; z += 3.0) {

        contentNode.add("node", {
            type: "translate",
            x: x,
            z: z,
            nodes: [

                /* tag node
                 */
                {
                    type: "tag",
                    tag: tags[i].tag,

                    nodes : [

                        /* name node for picking
                         */
                        {
                            type: "name",
                            id: "sphere at (x=" + x + ", z=" + z + ")",

                            nodes: [
                                {
                                    type: "material",
                                    baseColor: tags[i].color,
                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:       1.0,
                                    shine:          70.0,

                                    nodes: [
                                        {
                                            type : "sphere"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        i++;
        if (i > tags.length - 1) {
            i = 0;
        }
    }
}

scene.set("tagMask", "(pear)");

/* Get handles to some nodes
 */

var yawNode = scene.findNode("yaw");
var pitchNode = scene.findNode("pitch");

/* As mouse drags, we'll update the rotate nodes
 */

var lastX;
var lastY;
var dragging = false;

var newInput = false;
var yaw = 0;
var pitch = 0;


var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

function mouseMove(event) {
    if (dragging) {

        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * 0.5;

        lastX = event.clientX;
        lastY = event.clientY;

        newInput = true;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

/* Start the scene rendering
 */

scene.start({
    idleFunc: function() {
        if (newInput) {
            yawNode.set("angle", yaw);
            pitchNode.set("angle", pitch);
            newInput = false;
        }
    }
});


var tagMasks = ["(pear)","(pear|apple)","(pear|orange)","(orange)"];
var tagMaskIndex = 0;

setInterval(function() {

    scene.set("tagMask", tagMasks[tagMaskIndex]);

    tagMaskIndex++;
    if (tagMaskIndex > tagMasks.length - 1) {
        tagMaskIndex = 0;
    }

}, 500);


/* Pick listener
 */


canvas.addEventListener(
        'mousedown',
        function (event) {
            var coords = clickCoordsWithinElement(event);

            var pickRecord = scene.pick(coords.x, coords.y);

            if (pickRecord) {
                alert("Picked 'name' node with id '" + pickRecord.nodeId + "' at canvasX=" + pickRecord.canvasX + ", canvasY=" + pickRecord.canvasY);
            } else {
                alert("Nothing picked");
            }
        }, false);

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


