/*  Introductory SceneJS scene which renders the venerable OpenGL teapot.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 To render the teapot, SceneJS will traverse the scene in depth-first order. Each node is a function
 that will set some WebGL state on entry, then un-set it again before exit. In this graph, the root
 scene node binds to a Canvas element, a renderer sets some rendering state, then the rest of the
 nodes specify various transforms, lights, material properties, all wrapping a teapot geometry node.

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 passed down via data "scopes". Take a close look at the rotate nodes, which use these variables, and
 the invocation of the "render" function near the bottom of this example, which passes them in.

 */

var floor = SceneJS.generator(
        (function() {
            var x = -200;
            var z = -200;
            return function(data) {
                x += 20.;
                if (x > 200.0) {
                    x = -200.0;
                    z += 20.0;
                }
                if (z < 200.0) {
                    return { x: x,  z : z };
                }
                x = z = -200.0;
                return null;
            };
        })(),
        SceneJS.translate(function(data) {
            return { x: data.get("x"), z: data.get("z") };
        },
                SceneJS.scale({ x: 9.6, y: .5, z : 9.6 },
                        SceneJS.texture({
                            layers: [
                                {
                                    uri:"marble.jpg",
                                    applyTo: "diffuse",
                                    flipY:true
                                }
                            ]},
                                SceneJS.objects.cube()
                                )
                        )
                ));

var stairs = SceneJS.renderer({ enableTexture2D: true },

        SceneJS.texture({
            layers: [
                {
                    uri:"marble.jpg",
                    applyTo: "diffuse",
                    flipY:true
                }
            ]},

                SceneJS.material({
                    ambient:  { r:0.4, g:0.4, b:0.4 },
                    diffuse:  { r:0.8, g:0.8, b:0.8 }
                },
                        SceneJS.generator((function() {
                            var angle = 0;
                            var height = -10;
                            var stepNum = 0;
                            return function(data) {

                                angle += data.get("stepAngle") || 25.0;
                                height += data.get("stepSpacing") || 2.0;

                                var numSteps = data.get("numSteps") || 10;
                                if (stepNum < numSteps) {
                                    stepNum++;
                                    return { angle: angle, height: height };
                                } else {
                                    stepNum = 0;
                                    angle = 0;
                                    height = -10;
                                }
                            };
                        })(),
                                SceneJS.rotate(
                                        function(data) {
                                            return { angle : data.get("angle"), y: 1.0 };
                                        },
                                        SceneJS.translate(
                                                function(data) {
                                                    return { x: data.get("innerRadius") || 10.0, y : data.get("height") };
                                                },
                                                SceneJS.scale(
                                                        function(data) {
                                                            return {
                                                                x: data.get("stepWidth") || 5.0,
                                                                y: data.get("stepHeight") || 0.5,
                                                                z: data.get("stepDepth") || 3.0
                                                            };
                                                        },
                                                        SceneJS.objects.cube()
                                                        )
                                                )
                                        )
                                )
                        )
                )


        );

var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',

    /* Proxy that will mediate cross-domain asset loads.
     */
    proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

    /* Write logging output to a DIV element in the page
     */
        SceneJS.loggingToPage({ elementId: "logging" },

            /* A renderer node clears the depth and colour buffers
             */
                SceneJS.renderer({
                    clear : { depth : true, color : true},
                    viewport:{ x : 1, y : 1, width: 1600, height: 800},
                    clearColor: { r:0.5, g: 0.5, b: 0.5 },
                    enableTexture2D:true
                },

                    /* Perspective transformation
                     */
                        SceneJS.perspective({  fovy : 45.0, aspect : 2.0, near : 0.10, far : 2000.0 },
                                SceneJS.fog({
                                    // mode:"exp",
                                    color:{r:.50, g:.50,b:.50},
                                    start: 0,
                                    end:600  ,
                                    density:300.0
                                },
                                    /* Viewing transform specifies eye position, looking
                                     at the origin by default
                                     */
                                        SceneJS.lookAt(function(data) {
                                            return {
                                                eye : data.get("eye"),
                                                look : data.get("look"),
                                                up : { y: 1.0 }
                                            };
                                        },

                                            /* A lights node inserts  point lights into the world-space.
                                             * You can have many of these, nested within modelling transforms
                                             * if you want to move them around.
                                             */
                                                SceneJS.lights({
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
                                                    ]},

                                                        floor,

                                                    /* Next, modelling transforms to orient our teapot
                                                     by a given angle.  See how these rotate nodes take a
                                                     function which creates its configuration object?

                                                     You can do that when you want a node's configuration to be
                                                     evaluated dynamically at traversal-time. The function
                                                     takes a scope, which is SceneJS's mechanism for passing
                                                     variables down into a scene graph. Using the angle
                                                     variable on the scope, the function creates a
                                                     configuration that specifies a rotation about the X-axis.
                                                     Further down you'll see how we inject that angle
                                                     variable when we render the scene.
                                                     */
                                                        SceneJS.rotate(function(data) {
                                                            return {
                                                                angle: data.get('pitch'), x : 1.0
                                                            };
                                                        },
                                                                SceneJS.rotate(function(data) {
                                                                    return {
                                                                        angle: data.get('yaw'), y : 1.0
                                                                    };
                                                                },

                                                                    /* Specify the amounts of ambient, diffuse and specular
                                                                     * lights our teapot reflects
                                                                     */
                                                                        SceneJS.material({
                                                                            ambient:   { r: 0.5, g: 0.5, b: 0.5 },
                                                                            diffuse:   { r: 0.6, g: 0.6, b: 0.6 },
                                                                            specular:  { r: 1, g: 1, b: 1 },
                                                                            emission: { r: 0.02, g: 0.02, b: 0.0 },
                                                                            shininess: 60.0
                                                                        },

                                                                                SceneJS.boundingBox({
                                                                                    xmin: -20,
                                                                                    ymin: -20,
                                                                                    zmin: -20,
                                                                                    xmax:  20,
                                                                                    ymax:  20,
                                                                                    zmax:  20,

                                                                                    levels: [
                                                                                        10,
                                                                                        300,
                                                                                        400,
                                                                                        500
                                                                                    ]
                                                                                },
                                                                                    /* Size > 10px - draw a pink cube
                                                                                     */
                                                                                        SceneJS.material({
                                                                                            ambient:  { r:0.9, g:0.3, b:0.9 },
                                                                                            diffuse:  { r:0.9, g:0.7, b:0.9 }
                                                                                        },
                                                                                                SceneJS.objects.cube()
                                                                                                ),

                                                                                    /* Size > 200px - draw a blue low-detail sphere
                                                                                     */

                                                                                        SceneJS.withData({
                                                                                            stepWidth:7,
                                                                                            stepHeight:1.2,
                                                                                            stepDepth:3,
                                                                                            stepSpacing:3,
                                                                                            innerRadius:10,
                                                                                            numSteps:25,
                                                                                            stepAngle:40 },

                                                                                                SceneJS.load({
                                                                                                    uri:"http://scenejs.org/app/data/assets/catalogue/assets/" +
                                                                                                        "v0.7.0/staircase-example/staircase.js"
                                                                                                })

                                                                                                )
                                                                                        ,

                                                                                    /* Size > 400px - draw a green medium-detail sphere
                                                                                     */

                                                                                        SceneJS.withData({   // TODO: Hash on these configs?
                                                                                       
                                                                                            stepWidth:7,
                                                                                            stepHeight:0.6,
                                                                                            stepDepth:3,
                                                                                            stepSpacing:1.5,
                                                                                            innerRadius:10,
                                                                                            numSteps:50,
                                                                                            stepAngle:20 },

                                                                                                SceneJS.load({
                                                                                                    uri:"http://scenejs.org/app/data/assets/catalogue/assets/" +
                                                                                                        "v0.7.0/staircase-example/staircase.js"
                                                                                                })

                                                                                                ),

                                                                                    /* Size > 600px - draw a red high-detail sphere
                                                                                     */

                                                                                        SceneJS.withData({
                                                                                            stepTexture: "redstone", // Try changing this to "marble"
                                                                                            stepWidth:7,
                                                                                            stepHeight:0.6,
                                                                                            stepDepth:3,
                                                                                            stepSpacing:1.5,
                                                                                            innerRadius:10,
                                                                                            numSteps:50,
                                                                                            stepAngle:20 },

                                                                                                SceneJS.load({
                                                                                                    uri:"http://scenejs.org/app/data/assets/catalogue/assets/" +
                                                                                                        "v0.7.0/staircase-example/staircase.js"
                                                                                                })
                                                                                                )

                                                                                        )

                                                                                )
                                                                        )
                                                                ) // rotate
                                                        ) // lookAt
                                                )
                                        ) // perspective
                                ) // lights
                        ) // renderer
                ) // logging
        )
        ; // scene

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

function render() {
    var moveVec = SceneJS._math.transformVector3(SceneJS._math.rotationMat4v(moveAngle * 0.0174532925, [0,1,0]), [0,0,1]);
    if (speed) {
        eye.x += moveVec[0] * speed;
        eye.z += moveVec[2] * speed;
    }
    exampleScene.render({eye : eye, look: { x: eye.x + moveVec[0], y: eye.y, z : eye.z + moveVec[2] }});
}

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
        moveAngle -= (event.clientX - lastX) * 0.1;
        lastX = event.clientX;
        lastY = event.clientY;
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

function doit() {
    try {
        render();
    } catch (e) {
        throw e;
    }
}


render();

/* Continue animation
 */
var pInterval = setInterval("doit()", 10);



