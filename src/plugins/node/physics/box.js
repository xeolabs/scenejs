/**
 * A box geometry with rigid-body physics behavior
 *
 * Documentation: https://github.com/xeolabs/scenejs/wiki/Physics
 *
 */
SceneJS.Types.addType("physics/box", {
    init:function (params) {
        this.addNode({
            type:"physics/body",

            shape: "box",

            xPos: params.xPos,
            yPos: params.yPos,
            zPos: params.zPos,

            //...etc

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

