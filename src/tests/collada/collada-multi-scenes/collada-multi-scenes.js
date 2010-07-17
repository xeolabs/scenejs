/*
 COLLADA Access Example - Selecting a Scene in a Collada File

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
SceneJS.addListener("error", function(e) {
    alert(e.exception.message);
});

/**
 * Configure SceneJS to load the COLLADA files cross-domain using the JSONP proxy service at SceneJS.
 * We'll do that by plugging in a SceneJS JSONP strategy. These have two methods - one that constructs the
 * JSONP GET request URL that is understood by the service, and the other that filters the response text.
 */
SceneJS.setJSONPStrategy({

    request : function(url, format, callback) {
        return "http://scenejs.org/cgi-bin/jsonp_proxy.pl?uri=" + url + "&format=" + format + "&callback=" + callback;
    },

    response : function(data) {
        
        /* The SceneJS proxy will provide an error message like this when
         * it fails to service the request
         */
        if (data.error) {
            throw "Proxy server responded with error: " + data.error;
        }
        return data;
    }
});


const COLLADA_PLANE_MODEL_URL = "http://www.scenejs.org/library/v0.7/assets/examples/seymourplane_triangulate/seymourplane_triangulate_augmented.dae";
const COLLADA_DUCK_MODEL_URL = "http://www.scenejs.org/library/v0.7/assets/examples/collada-duck/duck4.dae";

var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

    //-------------------------------------------------------------------------------------------------------------
    // First instance - COLLADA Seymour Plane VisualSceneNode via camera3, while configuring that camera's lookat
    // and the VisualSceneNode/plane/prop node's Z-axis rotation
    //-------------------------------------------------------------------------------------------------------------

        SceneJS.renderer({
            viewport:{ x : 1, y : 1, width: 400, height: 400}
        },
                SceneJS.withConfigs({
                    "#lookat": {
                        eye : { x: 20.0, y: 10.0, z: 10 }, // Configure the lookat transform of selected "camera3"
                        look : { x: -1.0, y: 0, z: 0 },
                        "#plane" : {
                            "#prop" : {
                                "#rotateZ" : {             // Configure the "plane/prop" node's Z-rotation
                                    angle: 40.0
                                }
                            }
                        }
                    }
                },
                        SceneJS.instance({
                            uri: COLLADA_PLANE_MODEL_URL + "#VisualSceneNode/camera3"
                        }))),

    //-------------------------------------------------------------------------------------------------------------
    // First instance - Duck VisualSceneNode via camera1
    //-------------------------------------------------------------------------------------------------------------

        SceneJS.renderer({
            viewport:{ x : 400, y : 0, width: 400, height: 400}
        },
                SceneJS.instance({
                    uri: COLLADA_DUCK_MODEL_URL + "#VisualSceneNode/camera1"
                }))
        );

window.render = function() {
    exampleScene.render({});
};

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.render()", 10);