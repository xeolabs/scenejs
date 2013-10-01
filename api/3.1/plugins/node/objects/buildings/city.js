SceneJS.Types.addType("objects/buildings/city", {

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
                    type:"objects/buildings/building",
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