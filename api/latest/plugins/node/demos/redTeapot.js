/**
 * A red teapot node type with attributes for position and size.
 * <p>Demonstrates how to expose settable attributes on a custom node type.</p>
 *
 * @author xeolabs / http://xeolabs.com
 *
 */
SceneJS.Types.addType("demos/redTeapot", {

    construct:function (params) {

        // Create child nodes

        this._translate = this.addNode({
            type:"translate"
        });

        this._scale = this._translate.addNode({
            type:"scale",
            x:1, y:1, z:1,
            nodes:[
                {
                    type:"material",
                    color:{ r:1.0, g:0.6, b:0.6 },
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

        // Set initial position and size, if provided
        if (params.pos) {
            this.setPos(params.pos);
        }
        if (params.size) {
            this.setSize(params.size);
        }
    },

    // Sets position of teapot
    setPos:function (pos) {
        this._translate.setXYZ(pos);
    },

    // Sets size of teapot
    setSize:function (size) {
        this._scale.setXYZ(size);
    }
});
