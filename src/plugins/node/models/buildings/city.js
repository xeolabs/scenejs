/**
 A simple procedurally-generated city model

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

                    // City demo scene
                    // http://scenejs.org/api/latest/plugins/node/models/buildings/city.js
                    {
                        type: "models/buildings/city",
                        width: 1000.0
                    }
                ]
            }
        ]
    });
 </pre>

 */
SceneJS.Types.addType("models/buildings/city", {

    construct:function (params) {

        var width = params.width || 600;
        if (width < 100) {
            throw "city width must be at least 100";
        }
        var halfWidth = width / 2;

        // Add a grid of buildings
        for (var x = -halfWidth; x < halfWidth; x += 50) {
            for (var z = -halfWidth; z < halfWidth; z += 50) {
                this.addNode({
                    type:"models/buildings/building",
                    buildingType:Math.floor(Math.random() * 3), // Three building types
                    pos:{
                        x:x,
                        y:0,
                        z:z
                    }
                });
            }
        }
    }
});