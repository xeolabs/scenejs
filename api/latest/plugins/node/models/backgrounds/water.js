/**
 Dynamic rippling water background

 @author xeolabs / http://xeolabs.com

 <p>Usage: </p>
 <pre>

 myNode.addNodes([
    {
        type: "models/backgrounds/water"
    },
    {
        type: "geometry/box"
    }
 ]);
 </pre>
 */

SceneJS.Types.addType("models/backgrounds/water", {

    construct: function (params) {

        var shaderId = this.getId() + ".shader";

        // First subgraph
        // Generates dynamic texture

        // Dynamic water shader
        this.addNode({
            type: "shader",
            id: shaderId,

            shaders: [
                {
                    stage: "vertex",
                    code: [
                        "attribute vec3 SCENEJS_aVertex;",
                        "attribute vec2 SCENEJS_aUVCoord0;",
                        "varying vec2 surfacePosition;",
                        "void main () {",
                        "    gl_Position = vec4(SCENEJS_aVertex.x, SCENEJS_aVertex.y, 0.98, 1.0);",
                        "    surfacePosition = SCENEJS_aUVCoord0;",
                        "}"
                    ]
                },
                {
                    stage: "fragment",
                    code: [
                        "precision mediump float;",
                        "uniform float time;",
                        "varying vec2 surfacePosition;",
                        "void main( void ) {",
                        "    vec2 sp = surfacePosition;",
                        "    vec2 p = sp*5.0 - vec2(10.0);",
                        "    vec2 i = p;",
                        "    float c = 1.0;",
                        "    float inten = 0.10;",
                        "    for (int n = 0; n < 10; n++) {",
                        "        float t = time * (1.0 - (3.0 / float(n+1)));",
                        "        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));",
                        "        c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));",
                        "    }",
                        "    c /= float(10);",
                        "    c = 1.5-sqrt(c);",
                        "    gl_FragColor = vec4(vec3(c*c*c*c), 999.0) + vec4(0.0, 0.3, 0.5, 1.0);",
                        "}"
                    ]
                }
            ],
            params: {
                time: 0.0
            },

            nodes: [

                // Screen-aligned quad
                {
                    type: "geometry/quad"
                }
            ]
        });

        // Dynamically update the shader on each scene tick

        var scene = this.getScene();
        var self = this;

        scene.getNode(shaderId,
            function (shader) {

                var time = 0;
                var depth=.9;

                self._tick = scene.on("tick",
                    function (params) {

                        shader.setParams({
                            time: time += 0.1,
                            depth: depth+=0.01
                        });
                    });
            });
    },

    destruct: function () {
        this.getScene.off(this._tick);
    }
});
