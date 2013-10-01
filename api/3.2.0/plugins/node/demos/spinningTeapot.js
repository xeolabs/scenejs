/**
 * A spinning teapot node type.
 * Demonstrates how to hook the type into the scene animation loop for autonomous animation.
 */
SceneJS.Types.addType("demos/spinningTeapot", {

    construct:function (params) {

        // Create child nodes
        var rotate = this.addNode({
            type:"rotate",
            y:1,
            angle:0,
            nodes:[
                {
                    type:"material",
                    color:{ r:0.6, g:1.0, b:0.6 },
                    nodes:[
                        {
                            type:"geometry",
                            source:{
                                type:"teapot"
                            }
                        }
                    ]
                }
            ]
        });

        // Spin the teapot within the scene animation loop
        var angle = 0;
        this._tick = this.getScene().on("tick",
            function () {
                rotate.setAngle(angle);
                angle += 0.1;
            });
    },

    // Node destructor, unsubscribes from scene tick
    destruct:function () {
        this.getScene().off(this._tick);
    }
});
