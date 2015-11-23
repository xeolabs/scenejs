/**
  Grid geometry node type

  @author xeolabs / http://xeolabs.com

  <p>Usage example:</p>

  <pre>
  someNode.addNode({
       type: "geometry/plane",
       wire: false, // Default
       widthSegments: 20, // Default
       heightSegments: 20 // Default
   });
 </pre>
 */
SceneJS.Types.addType("geometry/grid", {

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
                            type:"geometry/plane",
                            wire:params.wire != false,
                            widthSegments:params.xSegments || 100,
                            heightSegments:params.zSegments || 100
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