/**
 Scanlines shader

 @author xeolabs / http://xeolabs.com

 */
SceneJS.Types.addType("shader/scanline", {

    construct: function (params) {

        this._shader = this.addNode({
            type: "shader",
            shaders: [
                {
                    stage: "fragment",
                    code: [
                        "vec4 myPixelColorFunc(vec4 color) {",
                        "   float m = mod(gl_FragCoord.y, 4.0);",
                        "   if (m < 1.5) {",
                        "       color = vec4(0.0, 0.0, 0.0, 1.0);",
                        "   } else if (m < 2.0) {",
                        "       color = vec4(0.2, 0.2, 0.2, 1.0);",
                        "   } else if (m < 2.5) {",
                        "       color = vec4(0.2, 0.2, 0.2, 1.0);",
                        "   }",
                        "   return color;",
                        "}"
                    ],
                    hooks: {
                        pixelColor: "myPixelColorFunc"
                    }
                }
            ],
            nodes: params.nodes
        });
    }
});
