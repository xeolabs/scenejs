SceneJS.createNode({
    type: "scene",
    id: "the-scene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",

            id: "the-lookat",
            
            eye : { x: 0.0, y: 2.0, z: 55 },
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
                            color:                  { r: 1, g: 1, b: 1 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.5, y: -1, z: 0.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1, g: 1, b: 1 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 0.0, z: -0.5 }
                        },
                            
                        /*--------------------------------------------------------------------------------------
                         * A billboard node stops the backdrop from rotating as we update the lookAt
                         *------------------------------------------------------------------------------------*/

                        {
                            type: "billboard",

                            nodes: [

                                /*--------------------------------------------------------------------------------------
                                 * A stationary node stops the backdrop from translating as we update the lookAt
                                 *------------------------------------------------------------------------------------*/

                                {
                                    type: "stationary",

                                    nodes: [
                                        {
                                            type: "texture",
                                            layers: [
                                                {
                                                    uri: "BrickWall.jpg",
                                                    applyTo:"baseColor",                                                   
                                                    blendMode: "multiply",

                                                    /* This will scale the UV coordinates of the
                                                     * geometry to map correctly to this texture
                                                     */
                                                    scale: {
                                                        x: 0.2,
                                                        y: 0.2
                                                    }
                                                }
                                            ],

                                            nodes: [

                                                /*---------------------------------------------------------------------
                                                 * Material properties for the backdrop geometry
                                                 *--------------------------------------------------------------------*/

                                                {
                                                    type: "material",
                                                    baseColor: { r: .95, g: .95, b: .95 },
                                                    specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                                    emit:           0.2,
                                                    specular:       0.9,
                                                    shine:          3.0,

                                                    nodes: [

                                                        /*--------------------------------------------------------------
                                                         * Push the backdrop away along the view-space Z-axis
                                                         *------------------------------------------------------------*/

                                                        {
                                                            type:"translate",

                                                            z: -300,

                                                            nodes: [

                                                                /*------------------------------------------------------
                                                                 * Scale the backdrop up a bit
                                                                 *----------------------------------------------------*/

                                                                {
                                                                    type:"scale",
                                                                    x: 10,
                                                                    y: 10,
                                                                    z: 0.1,

                                                                    nodes: [

                                                                        /*---------------------------------------------
                                                                         * The backdrop geometry - note the 'colors'
                                                                         * array, which defines white at the top two
                                                                         * corners and dark gray at the bottom two.
                                                                         *--------------------------------------------*/
                                                                        {
                                                                            type: "geometry",

                                                                            primitive: "triangles",

                                                                            /* Vertex positions
                                                                             */
                                                                            positions : [
                                                                                5, 5, 5, -5, 5, 5,-5,-5, 5, 5,-5, 5
                                                                            ],

                                                                            /* Normal per vertex
                                                                             */
                                                                            normals : [
                                                                                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
                                                                            ],

                                                                            /* Vertex UV coordinates
                                                                             */
                                                                            uv : [
                                                                                5, 5, 0, 5, 0, 0, 5, 0

                                                                            ],

                                                                            /* Second optional layer of vertex UV coordinates
                                                                             */
                                                                            uv2 : [
                                                                            ],

                                                                            /* Vertex colors - top two points are white, bottom two are dark
                                                                             */
                                                                            colors : [
                                                                                1.0, 1.0, 1.0, 1.0,
                                                                                1.0, 1.0, 1.0, 1.0,
                                                                                0.1, 0.1, 0.1, 1.0,
                                                                                0.1, 0.1, 0.1, 1.0

                                                                            ],

                                                                            /* Indices describing two triangles to form the quad
                                                                             */
                                                                            indices : [
                                                                                0, 1, 2, 0, 2, 3
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
                        },

                        {
                            type: "material",
                            emit: 0,
                            baseColor:      { r: 0.6, g: 0.4, b: 0.8 },
                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                            specular:       0.9,
                            shine:          100.0,

                            nodes: [
                                {
                                    type: "scale",
                                    x:1.0,
                                    y:1.0,
                                    z:1.0,

                                    nodes: [
                                        {
                                            type : "teapot"
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


var canvas = document.getElementById("theCanvas");

var origin = null;
var speed = null;
canvas.addEventListener('mousedown', function(e) {
    origin = {x: e.clientX, y: e.clientY};
}, false);

canvas.addEventListener('mouseup', function(e) {
    origin = null;
    speed = null;
}, false);

canvas.addEventListener('mousemove', function(e) {
    if (origin)
        speed = {x: e.clientX - origin.x, y: e.clientY - origin.y};
}, false);

canvas.addEventListener('mousewheel', function(event) {
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
            speed.y -= 0.2;
        } else {
            speed.y += 0.2;
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}, true);

SceneJS.withNode("the-scene").start({
    fps: 60,
    idleFunc: function() {
        if (speed && speed.y)
            SceneJS.Message.sendMessage({
                command: "lookAt.move",
                target: "the-lookat",
                z: -speed.y / 100,
                ignoreY: true
            });

        if (speed && speed.x)
            SceneJS.Message.sendMessage({
                command: "lookAt.rotate",
                target: "the-lookat",
                angle: -speed.x / 420,
                ignoreY: true
            });
    }
});
