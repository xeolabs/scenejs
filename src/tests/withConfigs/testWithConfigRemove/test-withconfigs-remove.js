/*
 Testing subgraph configuration setting with a WithConfigs node

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com
 */
var exampleScene = SceneJS.scene({
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0.0, y: 10.0, z: -15 },
            look : { y:1.0 },
            up : { y: 1.0 }
        },
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.0,
                        near : 0.10,
                        far : 300.0  }
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
                            ]},
                                SceneJS.material({
                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:       0.9,
                                    shine:          6.0
                                },

                                    //-------------------------------------------------------------------------------------
                                    //
                                    //
                                    //-------------------------------------------------------------------------------------

                                        SceneJS.withConfigs({

                                            /* Raise a SceneJS.WithConfigsPropertyNotFoundException when a property
                                             * reference on the WithConfigs configuration map cannot be resolved to
                                             * any method on a target node.
                                             */
                                            strictProperties: true,  // Default is true

                                            /* Raise a SceneJS.WithConfigsNodeNotFoundException exception when a node
                                             * reference in the WithConfigs configuration map cannot be resolved to its
                                             * target node in the subgraph.
                                             */
                                            strictNodes: true,      // Default is false

                                            /* The configuration map
                                             */
                                            configs: {
                                                "#pitch": {
                                                    angle: 40,

                                                    "#yaw" : {
                                                        angle: 200
                                                    }
                                                }
                                            }
                                        },
                                                /* The subgraph
                                                 */                                                
                                                SceneJS.rotate({
                                                    sid: "pitch",
                                                    angle: 0,
                                                    x : 1.0
                                                },
                                                        SceneJS.rotate({
                                                            sid: "yaw",
                                                            angle: 0,
                                                            y : 1.0
                                                        },
                                                                SceneJS.objects.teapot()
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );


/*----------------------------------------------------------------------
 * Render the scene
 *---------------------------------------------------------------------*/

SceneJS.addListener("error", function(e) {
    alert(e.exception.message);
});

exampleScene.render();




