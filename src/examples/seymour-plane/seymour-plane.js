/*
 COLLADA Load Example - Seymour Plane Test Model

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 Demonstrates the import of a COLLADA asset - the Seymour test model from collada.org

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 injected into the scene graph. Take a close look at the rotate nodes, which use these variables, and
 the invocation of the "render" function near the bottom of this example, which passes them in.

 */

/*
 * To enable the COLLADA content to load cross-domain, we'll first configure SceneJS with a strategy to allow it
 * to use a Web service to proxy the JSONP load request. As shown here, the strategy implements two methods, one to
 * create the request URL for the service, and another to extract the data from the response.
 */
SceneJS.setJSONPStrategy({
    request : function(url, format, callback) {
        return "http://scenejs.org/cgi-bin/jsonp_proxy.pl?uri=" + url + "&format=" + format + "&callback=" + callback;
    },

    response : function(data) {  // Our proxy service does no fancy data packaging
        return data;
    }
});

var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

    /* Viewing transform:
     */
        SceneJS.lookAt({
            eye : { x: -1.0, y: 0.0, z: 15 },
            look : { x: -1.0, y: 0, z: 0 },
            up : { y: 1.0 }
        },

            /* Perspective camera
             */
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 55.0,
                        aspect : 1.0,
                        near : 0.10,
                        far : 300.0  }
                },

                    /* A lights node inserts lights into the world-space.  You can have as many
                     * lights as you want throughout your scene:
                     */
                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    dir:                    { x: 1.0, y: -1.0, z: 1.0 },
                                    diffuse:                true,
                                    specular:               true
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    dir:                    { x: -1.0, y: -1.0, z: -3.0 },
                                    diffuse:                true,
                                    specular:               true
                                }
                            ]},

                            /* Next, modelling transforms to orient our airplane.  These particular
                             * transforms are dynamically configured from data injected into the
                             * scene graph when its rendered:
                             */
                                SceneJS.rotate(function(data) {
                                    return {
                                        angle: data.get('yaw'), y : 1.0
                                    };
                                },
                                        SceneJS.rotate(function(data) {
                                            return {
                                                angle: data.get('pitch'), x : 1.0
                                            };
                                        },

                                            /* Load our COLLADA airplane model:
                                             */
                                                SceneJS.instance({
                                                    uri: "http://www.scenejs.org/library/v0.7/assets/" +
                                                         "examples/seymourplane_triangulate/" +
                                                         "seymourplane_triangulate.dae"
                                                }))
                                        )
                                )
                        )
                )
        );


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var pInterval;

var yaw = 305;
var pitch = 10;
var lastX;
var lastY;
var dragging = false;

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = document.getElementById(exampleScene.getCanvasId());

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
        pitch += (event.clientY - lastY) * 0.5;
        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

window.render = function() {
    exampleScene.render({yaw: yaw, pitch: pitch});
};

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

pInterval = setInterval("window.render()", 10);