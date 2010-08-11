/**
 *
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * March 2010
 *
 */


var exampleScene = SceneJS.scene({
    canvasId: 'theCanvas',
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0, y: 2, z: -40},
            look : { x : 0.0, y : 5.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 }
        },
                SceneJS.camera({
                    listeners: {
                        "tweak-me2":function(event) {
                            alert(this.getID() + " handling 'tweak-me2' event from " + event.uri);
                        }
                    },
                    optics: {
                        type: "perspective",
                        fovy : 45.0,
                        aspect : 1.0,
                        near : 0.10,
                        far : 300.0
                    }
                },
                        SceneJS.lights({

                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                }
                            ]}),


                        SceneJS.withConfigs({
                            sid: "with-config",
                            info : "SceneJS.withConfigs",
                            listeners: {
                                "tweak-me": function(event) {
                                    alert(this.getID() + " X handling 'tweak-me' event from " + event.uri);

                                    if (event.uri.match("^teapot") == "teapot") {
                                        this.setConfigs({
                                            "#teapot" : {
                                                "#teapot-color": {
                                                    baseColor: {r: Math.random(), g:Math.random(), b: Math.random() }
                                                }
                                            }
                                        });
                                        this.setOnce(true);
                                    }

                                    this.fireEvent("tweak-me2");
                                }
                            }
                        },

                                SceneJS.node({ sid: "teapot1" },
                                        SceneJS.translate({ x: -7 },
                                                SceneJS.material({
                                                    sid: "teapot-color",
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },
                                                        SceneJS.node({
                                                            listeners: {
                                                                "rendering" : {
                                                                    fn: function() {
                                                                        this.fireEvent("tweak-me");
                                                                    }
                                                                }
                                                            }
                                                        },
                                                                SceneJS.objects.teapot())))),

                                SceneJS.node({ sid: "teapot2" },
                                        SceneJS.translate({ x: 0 },
                                                SceneJS.material({
                                                    sid: "teapot-color",
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },
                                                        SceneJS.node({
                                                            listeners: {
                                                                "rendering" : {
                                                                    fn: function() {
                                                                        this.fireEvent("tweak-me");
                                                                    }
                                                                }
                                                            }
                                                        },
                                                                SceneJS.objects.teapot())))),


                                SceneJS.node({ sid: "teapot3" },
                                        SceneJS.translate({ x: 7 },
                                                SceneJS.material({
                                                    sid: "teapot-color",
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },
                                                        SceneJS.node({
                                                            listeners: {
                                                                "rendering" : {
                                                                    fn: function() {
                                                                        this.fireEvent("tweak-me");
                                                                    }
                                                                }
                                                            }
                                                        },
                                                                SceneJS.objects.teapot()))))
                                )
                        )
                )
        );


/*----------------------------------------------------------------------
 * Scene rendering stuff follows
 *---------------------------------------------------------------------*/
var pInterval;

var x = 0;
window.render = function() {
    exampleScene.render();
};

SceneJS.addListener("error", function(e) {
    window.clearInterval(pInterval);
    alert(e.exception.message ? e.exception.message : e.exception);
});

pInterval = setInterval("window.render()", 10);

var canvas = document.getElementById("theCanvas");

canvas.addEventListener('mousedown', function (event) {
    exampleScene.pick(event.clientX, event.clientY);
}, false);

