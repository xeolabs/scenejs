SceneJS.Types.addType("prims/grid", {

    construct:function (params) {

        this._translate = this.addNode({
            type:"translate"
        });

        this._scale = this._translate.addNode({
            type:"scale",
            x:1000,
            y:.5,
            z:1000,
            nodes:[
                {
                    type:"rotate",
                    x:1,
                    angle:90,
                    nodes:[
                        {
                            type:"prims/plane",
                            wire:params.wire != false,
                            widthSegments:params.xSegments || 200,
                            heightSegments:params.zSegments || 200
                        }
                    ]
                }
            ]
        });

        if (params.pos) {
            this.setPos(params.pos);
        }

        if (params.size) {
            this.setSize(params.size);
        }
    },

    setPos:function (pos) {
        this._translate.setXYZ(pos);
    },

    setSize:function (size) {
        this._scale.setXYZ(size);
    }
});