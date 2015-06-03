/**
 * Trivial example of a node type plugin
 *
 * @author xeolabs / http://xeolabs.com
 *
 */
SceneJS.Types.addType("demos/color", {

    construct:function (params) {

        this._material = this.addNode({
            type:"material",

            // Custom node types are responsible for attaching any child nodes that
            // are specified in their properties
            nodes:params.nodes
        });

        // Set initial color, if provided
        if (params.color) {
            this.setColor(params.color);
        }
    },

    setColor:function (color) {
        this._material.setColor(color);
    },

    getColor:function () {
        return this._material.getColor();
    },

    destruct:function () {
        // Not used in this example
    }
});
