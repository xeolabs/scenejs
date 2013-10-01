SceneJS.Types.addType("effects/crt", {

    construct:function (params) {

        this._shader = this.addNode({
            type:"shader",

            shaders:[

                {
                    stage:"fragment",
                    code:"vec4 myPixelColorFunc(vec4 color) {\n\
                              float m = mod(gl_FragCoord.y, 4.0);\n\
                              if (m < 1.5) {\n\
                                  color = vec4(0.0, 0.0, 0.0, 1.0);\n\
                              } else if (m < 2.0) {\n\
                                  color = vec4(0.2, 0.2, 0.2, 1.0);\n\
                              } else if (m < 2.5) {\n\
                                  color = vec4(0.2, 0.2, 0.2, 1.0);\n\
                              }\n\
                              return color;\n\
                          }",

                    hooks:{
                        pixelColor:"myPixelColorFunc"
                    }
                }
            ],
            nodes:params.nodes
        });
    },

    destruct:function () {
        // Not used
    }
});
