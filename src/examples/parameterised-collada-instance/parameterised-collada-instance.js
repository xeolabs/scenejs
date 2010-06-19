/*
 COLLADA Access Example - Selecting a Scene in a Collada File

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */

const COLLADA_FILE_URL = "http://www.scenejs.org/library/v0.7/assets/examples/" +
                         "seymourplane_triangulate/seymourplane_triangulate_augmented.dae";

var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' }, // Bind to a canvas

    /*
     */
        SceneJS.withConfigs({
            "#lookat": {
                eye : { x: 8, y: 5, z: 9 },   // Configure the lookat transform of selected "camera3"
                look : { x: -1.0, y: -2, z: 0 },

                "#plane" : {     // Don't actually need to reference "plane" node - would discover "prop"
                    "#prop" : {
                        "#rotateZ" : {         // Configure the "prop" node's Z-rotation
                            angle: (function() {
                                var a = 0;
                                return function() {
                                    a += 2.0;
                                    return a;
                                };
                            })()
                        }
                    }
                }
            }
        },
                SceneJS.instance({
                    uri: COLLADA_FILE_URL + "#VisualSceneNode/camera3"
                })));

var pInterval;

SceneJS.addListener("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.addListener("reset", function() {
    window.clearInterval(pInterval);
});

SceneJS.setJSONPStrategy({
    request : function(url, format, callback) {
        return "http://scenejs.org/cgi-bin/jsonp_proxy.pl?uri=" +
               url + "&format=" + format + "&callback=" + callback;
    },

    response : function(data) {
        return data;
    }
});

window.render = function() {
    exampleScene.render({});
};

pInterval = setInterval("window.render()", 10);