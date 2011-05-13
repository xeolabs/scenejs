/**
 * SceneJS Example - Basic picking example
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */


/*----------------------------------------------------------------------
 * Scene graph definition
 *---------------------------------------------------------------------*/

SceneJS.createNode({
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
                                                                    type: "node",
                                                                    id: "left-blue-sphere",

                                                                    nodes: [
                                                                        {
                                                                            type: "sphere"
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    type: "node",
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
                                                                    type: "node",
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
                                                                    type: "node",
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
                                                                                    type: "node",
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


/* We can observe when nothing is picked with a "notpicked"
 * listener attached to the scene node:
  */
SceneJS.withNode("theScene").bind("notpicked",
        function(event) {
            alert("Nothing picked");
        });


/* We'll listen for picking on each of the teapots:
 */

SceneJS.withNode("right-blue-sphere").bind("picked",
        function(event) {
            alert("Picked: 'right-blue-sphere'");
        });

SceneJS.withNode("left-blue-sphere").bind("picked",
        function(event) {
            alert("Picked: 'left-blue-sphere'");
        });

SceneJS.withNode("red-group-sphere").bind("picked",
        function(event) {
            alert("Picked: 'red-group-sphere'");
        });

SceneJS.withNode("right-green-sphere").bind("picked",
        function(event) {
            alert("Picked: 'right-green-sphere'");
        });

SceneJS.withNode("left-green-sphere").bind("picked",
        function(event) {
            alert("Picked: 'left-green-sphere'");
        });

SceneJS.withNode("theScene").start();

var canvas = document.getElementById("theCanvas");

/* On mouse down, we render the scene in picking mode, passing in the 
 * mouse canvas coordinates. This will cause a scene render traversal in which
 * all the "picked" listeners will fire on nodes situated above whatever
 * geometry node was picked, as those nodes are visited.
 *
 */
function mouseDown(event) {
    var coords = clickCoordsWithinElement(event);
    SceneJS.withNode("theScene").pick(coords.x, coords.y);
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
