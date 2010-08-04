/**
 * SceneJS Example - Basic picking
 *
 * This is a basic example that shows how picking can be used with a SceneJS.WithConfigs node.
 *
 * The WithConfigs node listens for "picked" events on its subgraph, handling them by either pushing new
 * configurations down into the subgraph or replacing nodes, depending on the origin of the event.
 *
 * Scroll down to the WithConfigs node for more details.
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


                    /*-------------------------------------------------------------------------------------
                     * The following WithConfigs node listens for pick events on its three subgraphs,
                     * handling each subgraph differently.
                     *
                     * Each of the subgraphs renders a teapot, and have root nodes identified by SIDs
                     * "teapot1", "teapot2" and "teapot3".  Each teapot is wrapped with Material properties
                     * that define their colours.
                     *
                     * Subgraph "teapot1" applies a modelling rotation to its teapot. When picked, the
                     * WithConfigs responds by pushing down a new angle value for the rotate node.
                     *
                     * When subgraph "teapot2" is picked, the WithConfigs pushes down a config that removes
                     * its teapot and replaces it with a sphere.
                     *
                     * When subgraph "teapot3" is picked, the WithConfigs pushes down a new base colour
                     * for its Material.                     
                     *-----------------------------------------------------------------------------------*/

                        SceneJS.withConfigs({

                            once: true, // Forget my config map as soon as I've applied it - dont keep reapplying it!

                            listeners: {
                                "picked":{
                                    fn : function(self, params) {

                                        /*
                                         * When "teapot1" is picked, we'll push a new angle down into
                                         * its "#teapot1-rotate" rotate node to spin it around
                                         */

                                        if (params.uri.match("^teapot1") == "teapot1") {
                                            self.setConfigs({
                                                "#teapot1" : {
                                                    "#teapot1-rotate": {
                                                        angle: 60
                                                    }
                                                }
                                            });
                                        }

                                        /*
                                         * When "teapot2" is picked, we'll remove its teapot object and
                                         * replace it with a sphere
                                         */

                                        if (params.uri.match("^teapot2") == "teapot2") {
                                            self.setConfigs({
                                                "#teapot2" : {
                                                    "#mount-point" : {
                                                        "-node": "remove-me",
                                                        "+node": SceneJS.objects.sphere()
                                                    }
                                                }
                                            });
                                        }

                                        /*
                                         * When "teapot3" is picked, we'll push a new baseColor down
                                         * into its "teapot3-color" Material node
                                         */

                                        if (params.uri.match("^teapot3") == "teapot3") {
                                            self.setConfigs({
                                                "#teapot3" : {
                                                    "#teapot3-color": {
                                                        baseColor: {r: 0.9, g: 0.3, b: 0.3 }
                                                    }
                                                }
                                            });
                                        }

                                        /*
                                         * When "teapot4" is picked, we'll splice translation and rotation
                                         * transforms above it to lift it out of the row while spinning it
                                         */

                                        if (params.uri.match("^teapot4") == "teapot4") {
                                            self.setConfigs({
                                                "#teapot4" : {
                                                    "#mount-point" : function() {
                                                        var insertAt = this.findNodeIndex("insert-here");
                                                        if (insertAt >= 0) {
                                                            var startTime = (new Date()).getTime();
                                                            var removedNode = this.removeNodeAt(insertAt);
                                                            var newSubGraph =
                                                                    SceneJS.translate(
                                                                            function() {
                                                                                var y = ((new Date()).getTime() - startTime) * 0.005;
                                                                                return { y: y < 10 ? y : 10 };
                                                                            },
                                                                            SceneJS.rotate(
                                                                                    function() {
                                                                                        var angle = ((new Date()).getTime() - startTime) * 0.05;
                                                                                        return {x: 1, angle: angle < 360 ? angle : 0 };
                                                                                    },
                                                                                    removedNode));

                                                            this.insertNode(newSubGraph, insertAt);
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        },
                            /*
                             * "teapot1"
                             */

                                SceneJS.node({ sid: "teapot1" },
                                        SceneJS.translate({ x: 7 },
                                                SceneJS.rotate({sid: "teapot1-rotate", y: 1, angle: 0.0},
                                                        SceneJS.material({
                                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                            specular:       0.9,
                                                            shine:          6.0
                                                        },
                                                                SceneJS.objects.teapot())))),


                            /*
                             * "teapot2" subgraph - note the "mount-point" and "remove-me" nodes, which are there
                             * to enable the WithConfigs to find the target parent and child nodes for node removal and
                             * replacement.
                             */

                                SceneJS.node({ sid: "teapot2" },
                                        SceneJS.material({
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0
                                        },
                                                SceneJS.node({ sid: "mount-point"},
                                                        SceneJS.node({ sid: "remove-me"},
                                                                SceneJS.objects.teapot())))),


                            /*
                             * "teapot3"
                             */

                                SceneJS.node({ sid: "teapot3" },
                                        SceneJS.translate({ x: -7 },
                                                SceneJS.material({
                                                    sid: "teapot3-color",
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },
                                                        SceneJS.objects.teapot()))),

                            /*
                             * "teapot4"
                             */

                                SceneJS.node({ sid: "teapot4" },
                                        SceneJS.translate({ x: -14 },
                                                SceneJS.material({
                                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                    specular:       0.9,
                                                    shine:          6.0
                                                },
                                                        SceneJS.node({ sid: "mount-point"},
                                                                SceneJS.node({ sid: "insert-here"},
                                                                        SceneJS.objects.teapot())))))
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

