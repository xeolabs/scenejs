/**
 * A box geometry with rigid-body physics behavior
 */
SceneJS.Types.addType("physics/box", {
    init:function (params) {
        this.addNode({
            type:"physics/body",
            // TODO: box body shape

            nodes:[
                {
                    type:"prims/box",
                    xSize:params.xSize,
                    ySize:params.ySize,
                    zSize:params.zSize
                }
            ]
        });
    }
});

