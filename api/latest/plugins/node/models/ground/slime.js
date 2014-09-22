/**
 * Slime ground node type
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "models/ground/slime"
 *  });
 * </pre>
 */
SceneJS.Types.addType("models/ground/slime", {
    construct: function (params) {

        this.addNodes([

            // Wire slime
            {
                type: "texture/slime",

                nodes: [
                    // Solid fill
                    {
                        type: "translate",
                        y: -3,
                        nodes: [

                            // Grid geometry, implemented by plugin at
                            // http://scenejs.org/api/latest/plugins/node/models/ground/grid.js
                            {
                                type: "geometry/grid",
                                size: { x: 1000, z: 1000 },
                                width: 1000,
                                height: 1000,
                                widthSegments: 2,
                                heightSegments: 2,
                                wire: false
                            }
                        ]
                    }
                ]
            }
        ]);
    }
});
