SceneJS.Types.addType("effects/snowyPeaks", {

    construct:function (params) {

        var altitude = params.altitude || 0;

        this._shader = this.addNode({
            type:"shader",
            shaders:[
                {
                    stage:"fragment",
                    code:[
                        "float posY = 0.0;",
                        "vec4 myWorldPosFunc(vec4 pos){",
                        "   posY=pos.y;",
                        "   return pos;",
                        "}",

                        "uniform float altitude;",
                        "vec3 myMaterialBaseColorFunc(vec3 color) {",
                        "   if (posY > altitude) {",
                        "       color = vec3(1.0, 1.0, 1.0);",
                        "   }",
                        "   return color;",
                        "}"
                    ],
                    hooks:{
                        materialBaseColor:"myMaterialBaseColorFunc",
                        worldPos:"myWorldPosFunc"
                    }
                }
            ],
            params:{
                altitude:altitude
            },
            nodes:params.nodes
        });
    },

    setAltitude:function (altitude) {
        this._shader.setParams({
            altitude:altitude
        });
    },

    destruct:function () {
        // Not used
    }
})
;
