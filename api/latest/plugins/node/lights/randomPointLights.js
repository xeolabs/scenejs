/**
 A randomly-scattered point lights

 Usage example:

 someNode.addNode({
       type: "geometry/randomObjects",
       numBoxes: 1000 // (default)
   });
 */


SceneJS.Types.addType("lights/randomObjects", {

    construct: function (params) {

        var numBoxes = params.numBoxes || 1000;

        for (var i = 0, len = numBoxes; i < len; i++) {

            // Random position
            this.addNode({
                type: "translate",
                x: Math.random() * 500 - 250,
                y: Math.random() * 500 - 250,
                z: Math.random() * 500 - 250,

                nodes: [
                    // Random orientation
                    {
                        type: "rotate",
                        x: Math.random(),
                        y: Math.random(),
                        z: Math.random(),
                        angle: Math.random() * 360,

                        nodes: [

                            // Random color
                            {
                                type: "material",
                                color: {
                                    r: Math.random(),
                                    g: Math.random(),
                                    b: Math.random()
                                },

                                nodes: [

                                    // Box geometry
                                    {
                                        type: "geometry/box",
                                        xSize: 3,
                                        ySize: 6,
                                        zSize: 3,
                                        coreId: "box"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
        }
    }
})();