/**
 * SceneJS Example - Basic picking example
 *
 * More info:
 *
 * https://github.com/xeolabs/scenejs/wiki/picking
 */


/*----------------------------------------------------------------------
 * Scene graph definition
 *---------------------------------------------------------------------*/

SceneJS.createScene({
    type: "scene",
    id: "theScene",
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0, y: 2, z: 22},
            look : { x : 0.0, y : -1.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

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
                            color:                  { r: 0.7, g: 0.7, b: 0.7 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.5, z: -1.0 }
                        },
                        {
                            type: "node",
                            nodes: [
                                {
                                    type: "node",
                                    id: "blue-group",

                                    nodes: [
                                        {
                                            type: "translate",
                                            x: -2,
                                            z: -7,
                                            nodes: [
                                                {
                                                    type: "material",
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0,

                                                    nodes: [

                                                        {
                                                            type: "translate",
                                                            x: .5,
                                                            z: -2,

                                                            nodes: [
                                                                {
                                                                    type: "name",
                                                                    id: "left-blue-sphere",

                                                                    nodes: [
                                                                        {
                                                                            type: "sphere"
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    type: "name",
                                                                    id: "right-blue-sphere",

                                                                    nodes: [

                                                                        {
                                                                            type: "translate" ,
                                                                            x: +2,

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
                                        },

                                        {
                                            type: "node",
                                            id: "green-group",

                                            nodes: [
                                                {
                                                    type: "translate",
                                                    x: 3,
                                                    z: 0,

                                                    nodes: [
                                                        {
                                                            type: "material",
                                                            baseColor:      { r: 0.3, g: 0.9, b: 0.3 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.9,
                                                            shine:          6.0,

                                                            nodes: [
                                                                {
                                                                    type: "name",
                                                                    id: "left-green-sphere",

                                                                    nodes: [
                                                                        {
                                                                            type: "translate",
                                                                            x: -2,
                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    type: "name",
                                                                    id: "right-green-sphere",

                                                                    nodes: [
                                                                        {
                                                                            type: "translate",
                                                                            x: 1,

                                                                            nodes: [
                                                                                {
                                                                                    type: "sphere"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            id: "red-group",

                                                            nodes : [
                                                                {
                                                                    type: "translate",
                                                                    x: 2,
                                                                    z: +7,

                                                                    nodes: [
                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 0.9, g: 0.3, b: 0.3 },
                                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                                            specular:       0.9,
                                                                            shine:          6.0,

                                                                            nodes: [
                                                                                {
                                                                                    type: "name",
                                                                                    id: "red-group-sphere",

                                                                                    nodes: [

                                                                                        {
                                                                                            type: "translate",
                                                                                            x: -2,
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
                        }
                    ]
                }
            ]
        }
    ]
});


var scene = SceneJS.scene("theScene");

scene.start();

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    var coords = clickCoordsWithinElement(event);

    var hit = scene.pick(coords.x, coords.y);

    if (hit) {
        alert("Picked 'name' node with id '" + hit.name + "' at canvasX=" + hit.canvasX + ", canvasY=" + hit.canvasY);
    } else {
        alert("Nothing picked");
    }
}

canvas.addEventListener('mousedown', mouseDown, false);


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
