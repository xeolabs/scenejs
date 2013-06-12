/**
 * A red teapot node type with attributes for position and size.
 * Demonstrates how to expose settable attributes on a custom node type.
 */
SceneJS.Types.addType("demos/tableWithThings", {

    init:function (params) {

        this._hoops = this.addNodes([
            {
                type:"demos/things/hoops"
            }
        ]);

        this._hoops = this.addNodes([
            {
                type:"demos/things/hoops"
            }
        ]);

    }
});
