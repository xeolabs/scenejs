/**
 * Basic boilerplate postprocess effect
 *
 */
SceneJS.Types.addType("scene/object", {

    construct: function (params) {

        this.translate = this.addNode({  type: "translate", x: 0, y: 0, z: 0 });
        this.scale = this.translate.addNode({  type: "scale", x: 1, y: 1, z: 1 });
    },

    destruct: function () {
        this._output.destroy();
    }
});

