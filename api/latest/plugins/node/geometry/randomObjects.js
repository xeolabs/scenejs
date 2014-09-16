/**
 A cloud of randomly-scattered boxes

 Usage example:

 someNode.addNode({
       type: "geometry/randomObjects",
       numBoxes: 1000 // (default)
   });
 */


SceneJS.Types.addType("geometry/randomObjects", {

    construct: function (params) {

        var numObjects = params.numObjects || 1000;
        var materials = params.materials != false;
        var node;

        for (var i = 0, len = numObjects; i < len; i++) {

            // Random position
            node = this.addNode({
                type: "translate",
                x: Math.random() * 500 - 250,
                y: Math.random() * 500 - 250,
                z: Math.random() * 500 - 250
            });

            // Random orientation
            node = node.addNode({
                type: "rotate",
                x: Math.random(),
                y: Math.random(),
                z: Math.random(),
                angle: Math.random() * 360
            });

            if (materials) {
                // Random material
                node = node.addNode({
                    type: "material",
                    color: {
                        r: Math.random(),
                        g: Math.random(),
                        b: Math.random()
                    }
                });
            }

            // Geometry
            node.addNode({
                type: "geometry/box",
                xSize: 3,
                ySize: 6,
                zSize: 3,
                coreId: "box"
            });
        }
    }
});