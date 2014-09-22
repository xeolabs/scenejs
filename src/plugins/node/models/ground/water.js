/**
 * Water ground node type
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "models/ground/water"
 *  });
 * </pre>
 */
SceneJS.Types.addType("models/ground/water", {
    construct: function (params) {

        this.addNodes([

            // Wire water
            {
                type: "texture/water",

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
