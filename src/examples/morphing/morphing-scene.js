/*
 Mesh morphing demo

 This is a super-simple example that demonstrates the use of a morphGeometry node to
 morph the positions and normals of a simple quad geometry.

 Scroll down to "morphGeometry" to see how it's done.

 lindsay.kay@xeolabs.com

 */

SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv",

    nodes:[

        /* Viewing transform specifies eye position, looking
         * at the origin by default
         */
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: -35 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [

                /* Camera describes the projection
                 */
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

                        /* A lights node inserts  point lights into the world-space.
                         * You can have many of these, nested within modelling transforms
                         * if you want to move them around.
                         */
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: 1.0 }
                        },
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: 1.0 }
                        },
                        {
                            type:                   "light",
                            mode:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: 1.0 }
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
                                            type: "material",
                                            emit: 0,
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          100.0,

                                            nodes: [
                                                {
                                                    type: "translate",
                                                    y: -1,

                                                    nodes: [
                                                        {
                                                            type: "scale",
                                                            x:.7,
                                                            y:.7,
                                                            z:.7,

                                                            nodes: [

                                                                /*------------------------------------------------------
                                                                 * The morphGeometry
                                                                 *
                                                                 * We could morph everything on the geometry except
                                                                 * of course for the indices array. In this example, we're
                                                                 * just morphing the positions and normals between two
                                                                 * targets.
                                                                 *
                                                                 * The 'factor' attribute takes a value from 0.0 to 1.0
                                                                 * to interpolate between the first and last target.
                                                                 *
                                                                 * We'll animate that as we run the scene to drive the
                                                                 * morphing.
                                                                 *----------------------------------------------------*/
                                                                {
                                                                    type: "morphGeometry",
                                                                    id: "my-morph",

                                                                    /* Start at first target
                                                                     */
                                                                    factor: 0.0,

                                                                    /* Minimum of two morph targets required
                                                                     */
                                                                    targets: [

                                                                        /* Target 1
                                                                         */
                                                                        {
                                                                            positions: [ 5, 5, 0, -5, 5, 0, -5,-5, 0,  5,-5, 0 ],
                                                                            normals : [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ]
                                                                        },

                                                                        /* Target 2
                                                                         */
                                                                        {
                                                                            positions: [ 0, 5,  5, 0, 5, -5, 0,-5, -5, 0, -5, 5 ],
                                                                            normals : [ 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1 ]
                                                                        }
                                                                    ],

                                                                    nodes:[

                                                                        /*----------------------------------------------
                                                                         * The geometry we're morphing.
                                                                         *
                                                                         * Note that the positions and normals are
                                                                         * omitted because those are specified on the
                                                                         * morphGeometry.
                                                                         *
                                                                         * We're not morphing the UV coords, so we'll
                                                                         * specify them on the geometry.
                                                                         *
                                                                         * We can have multiple geometries in a
                                                                         * morphGeometry, perhaps to divide up the
                                                                         * positions among separate indices to apply
                                                                         * multiple materials to the mesh - see the
                                                                         * multi-materials demo for more info on that.
                                                                         *
                                                                         * So the geometry can of course be nested within
                                                                         * whatever other nodes we wish, except for
                                                                         * another morphGeometry, because that would
                                                                         * override the morphGeometry we just defined.
                                                                         *---------------------------------------------*/

                                                                        {
                                                                            type: "geometry",

                                                                            primitive: "triangles",

                                                                            indices : [ 0, 1, 2, 0, 2, 3 ],
                                                                            uv      : [1, 1, 0, 1, 0, 0,1, 0]
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


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

var factor = 0;

/*----------------------------------------------------------------------
 * Start the scene graph - in each frame, we'll update the
 * morph factory on our morphGeometry node
 *--------------------------------------------------------------------*/

SceneJS.withNode("theScene").start({
    idleFunc: function() {

        SceneJS.withNode("my-morph").set("factor", factor);
        factor += 0.01;
        if (factor > 1) {
            factor = 0;
        }
    }
});

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;

        SceneJS.withNode("yaw").set("angle", yaw);
        SceneJS.withNode("pitch").set("angle", pitch);

        SceneJS.withNode("theScene").render();

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);





