/*
 Testing subgraph creation with a WithConfigs node

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
                        aspect : 1.25,
                        near : 0.10,
                        far : 300.0  }
                },
                        
                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        }),

                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        }),

                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        }),

                        SceneJS.material({
                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                            specular:       0.9,
                            shine:          6.0
                        },

                            /*----------------------------------------------------------------------------------
                             * A WithConfigs node creates a hierarchical map of values to set on the
                             * methods of the nodes within its subgraph as they are is rendered.
                             *
                             * The keys starting with '#' locate their target nodes by their SIDs.
                             *
                             * SIDs were introduced in V0.7.6 - an SID is a subidentifier that uniquely
                             * identifies its node within the scope of its parent.
                             *
                             * The keys starting with "-" map to "removeXXX" methods, "+" maps to "addXXX"
                             * methods, and keys with no prefix map to "setXXX" methods.
                             *
                             * More info on SceneJS.WithConfigs at http://scenejs.wikispaces.com/SceneJS.WithConfigs
                             *
                             *--------------------------------------------------------------------------------*/

                                SceneJS.withConfigs({
                                   
                                    /* The configuration map
                                     */
                                    configs: {
                                        "#cafe": {
                                            "#table5" : {
                                                "#chair2" : {

                                                    /* Content we're attaching. "+node" directs the WithConfig
                                                     * to call the "addNode" method on the Node at the attachment
                                                     * point to attach the object
                                                     */
                                                    "+node" :
                                                            SceneJS.rotate({ // The object to attach - imagine
                                                                angle: 0,    // this teapot is a person!
                                                                y : 1.0
                                                            },
                                                                    SceneJS.teapot())
                                                }
                                            }
                                        }
                                    }
                                },

                                    /* The subgraph
                                     */
                                        SceneJS.node({ sid: "cafe" },
                                                SceneJS.translate({ x: -1, y: 0, z: -1},
                                                        SceneJS.node({ sid: "table5" },
                                                                SceneJS.translate({ x: 1, y: 0, z: 1},

                                                                    /* Attachment point
                                                                     */
                                                                        SceneJS.node({ sid: "chair2" }))))))
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
