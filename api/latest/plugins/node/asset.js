/**
 *
 */
SceneJS.Types.addType("asset", {

    init:function (params) {

        this.addNode({
            type:"geometry",
            source: {
                type: "teapot"
            }
        });
    }
});
