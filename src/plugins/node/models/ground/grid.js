/**
 A grid ground

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>
 var scene = SceneJS.createScene({
        nodes: [

            // Mouse-orbited camera, implemented by plugin at
            // http://scenejs.org/api/latest/plugins/node/cameras/pickFlyOrbit.js
            {
                type: "cameras/pickFlyOrbit",
                yaw: -30,
                pitch: -20,
                zoom: 300,
                zoomSensitivity: 5.0,
                showCursor: true,
                cursorSize: 2.0,

                nodes: [
                    {
                        type: "models/gound/grid"
                    }
                ]
            }
        ]
    });
 </pre>

 */
SceneJS.Types.addType("models/ground/grid", {
    construct: function (params) {

        this.addNodes([

            // Wire grid
            {
                type: "material",
                color: { r: 0.5, g: 1.0, b: 0.5 },
                emit: 0.1,
                nodes: [

                    // Grid geometry, implemented by plugin at
                    // http://scenejs.org/api/latest/plugins/node/models/ground/grid.js
                    {
                        type: "geometry/grid",
                        size: { x: 10000, z: 10000 },
                        width: 10000,
                        height: 10000,
                        widthSegments: 10,
                        heightSegments: 10
                    }
                ]
            },

            // Solid fill
            {
                type: "translate",
                y: -3,
                nodes: [
                    {
                        type: "material",
                        color: { r: 0.5, g: 1.0, b: 0.5 },
                        emit: 0.01,
                        nodes: [

                            // Grid geometry, implemented by plugin at
                            // http://scenejs.org/api/latest/plugins/node/models/ground/grid.js
                            {
                                type: "geometry/grid",
                                size: { x: 10000, z: 10000 },
                                width: 10000,
                                height: 10000,
                                widthSegments: 100,
                                heightSegments: 100,
                                wire: false
                            }
                        ]
                    }
                ]
            }
        ]);
    }
});
