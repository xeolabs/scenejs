/**
 * A stack of rings with attributes for position and size.
 * Demonstrates how to expose settable attributes on a custom node type.
 */
SceneJS.Types.addType("demos/stackOfRings", {

    init:function (params) {

        // Create child nodes
        this._translate = this.addNode({
            type:"translate",
            x:-1.1, y:2.3, z:-1.1
        });

        this._scale = this._translate.addNode({
            type: "scale",
            nodes:[
                // Blue torus
                {
                    type:"translate",
                    y:0.8, x:0.2, z:0.2,
                    nodes:[
                        {
                            type:"rotate",
                            x:1, angle:90,
                            nodes:[
                                {
                                    type:"scale",
                                    x:0.6, y:0.6, z:0.6,
                                    nodes:[
                                        {
                                            type:"material",
                                            color:{ r:0.5, g:0.5, b:0.6 },

                                            nodes:[
                                                {
                                                    type:"geometry",
                                                    source:{
                                                        type:"torus"
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // Pink torus
                {
                    type:"translate",
                    y:0.42, x:0.2, z:0.3,
                    nodes:[
                        {
                            type:"rotate",
                            x:1, angle:90,
                            nodes:[
                                {
                                    type:"scale",
                                    x:0.7, y:0.7, z:0.7,
                                    nodes:[
                                        {
                                            type:"material",
                                            color:{ r:0.7, g:0.5, b:0.5 },

                                            nodes:[
                                                {
                                                    type:"geometry",
                                                    source:{
                                                        type:"torus"
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // Green torus
                {
                    type:"translate",
                    y:-0.055,
                    nodes:[
                        {
                            type:"rotate",
                            x:1, angle:90,
                            nodes:[
                                {
                                    type:"scale",
                                    x:0.8, y:0.8, z:0.8,
                                    nodes:[
                                        {
                                            type:"material",
                                            color:{ r:0.5, g:0.7, b:0.5 },

                                            nodes:[
                                                {
                                                    type:"geometry",
                                                    source:{
                                                        type:"torus"
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // Yellow torus
                {
                    type:"translate",
                    y:-0.6,
                    nodes:[
                        {
                            type:"rotate",
                            x:1, angle:90,
                            nodes:[
                                {
                                    type:"scale",
                                    x:0.9, y:0.9, z:0.9,
                                    nodes:[
                                        {
                                            type:"material",
                                            color:{ r:0.7, g:0.7, b:0.5 },

                                            nodes:[
                                                {
                                                    type:"geometry",
                                                    source:{
                                                        type:"torus"
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
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

    /**
     * Sets position
     * @param pos
     */
    setPos:function (pos) {
        this._translate.setXYZ(pos);
    },

    /**
     * Sets size
     * @param size
     */
    setSize:function (size) {
        this._scale.setXYZ(size);
    }
});
