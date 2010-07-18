/*
 In this example we're using a WithConfigs node to delete a subgraph from a target node.

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

                                            /* Raise a SceneJS.errors.WithConfigsPropertyNotFoundException when a property
                                             * reference on the WithConfigs configuration map cannot be resolved to
                                             * any method on a target node.
                                             */
                                            strictProperties: true,  // Default is true

                                            /* Raise a SceneJS.errors.WithConfigsNodeNotFoundException exception when a node
                                             * reference in the WithConfigs configuration map cannot be resolved to its
                                             * target node in the subgraph.
                                             */
                                            strictNodes: true,      // Default is false

                                            /* The configuration map
                                             */
                                            configs: {
                                                "#pitch": {
                                                    "#yaw" : {

                                                        // Calls removeNode("delete-me") on the target node

                                                        "-node" : "delete-me"
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

                                                    // Target node
                                                        SceneJS.rotate({
                                                            sid: "yaw",
                                                            angle: 0,
                                                            y : 1.0
                                                        },
                                                                SceneJS.node({ sid: "delete-me" },
                                                                        SceneJS.objects.teapot()),

                                                            /* Leave this cube behind
                                                             */
                                                                SceneJS.objects.cube()))
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




