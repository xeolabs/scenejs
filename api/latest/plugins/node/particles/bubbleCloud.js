SceneJS.Types.addType("particles/bubbleCloud", {

    init:function (params) {

        var num = params.numBubbles || 10;
        var scale;

        for (var i = 0; i < num; i++) {

            scale = 0.2 + (Math.random() * 2);

            this.addNode({
                type:"particles/bubble",
                pos:{
                    x:(Math.random() * 400) - 200,
                    y:2,
                    z:(Math.random() * 400) - 200
                },
                size:{
                    x:scale,
                    y:scale,
                    z:scale
                },
                dir:{
                    x:0,
                    y:0.1 + Math.random() * 0.1,
                    z:0
                }
            });
        }

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
    },

    setRotate:function (rotate) {
        this._rotate.set(rotate);
    }
});
