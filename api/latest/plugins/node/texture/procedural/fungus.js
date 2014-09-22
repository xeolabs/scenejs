/**

 Procedural green fungus texture

 @author xeolabs / http://xeolabs.com

 <p>Usage: </p>
 <pre>

 var myGreenfungus = myNode.addNode({
    type: "texture/procedural/fungus",
    nodes:[
        {
            type: "geometry/box"
        }
    ]
 });
 */

SceneJS.Types.addType("texture/procedural/fungus", {
    construct: function (params) {
        this.addNode({
            type: "texture/procedural",
            code: [
                // Fragment shader from GLSL sandbox
                "precision mediump float;",
                "uniform vec2 resolution;",
                "float hash(float x){",
                "    return fract(sin(x) * 43758.23);",
                "}",
                "float hash21(vec2 uv) {",
                "    return fract(sin(uv.x * 15.78 + uv.y * 35.14) * 43758.23);",
                "}",
                "mat2 m = mat2(15.78, 35.78, 75.39, 154.27);",
                "vec2 hash22(vec2 uv){",
                "    return fract(sin(m * uv) * 43758.23);",
                "}",
                "void main( void ) {",
                "    vec2 uv = gl_FragCoord.xy / resolution  * 20.0; ",
                "    vec2 g = floor(uv);",
                "    vec2 f = fract(uv);",
                "    float res = 1.0;",
                "    for(int i = -1; i <= 1; i++){",
                "        for(int j = -1; j <= 1; j++){",
                "            vec2 b = vec2(i, j);",
                "            vec2 v = b + hash22(g + b) - f;",
                "            float d = length(v);",
                "            res = min(d, res);",
                "        }",
                "    }",
                "    float c = res;",
                "    gl_FragColor = vec4(c*.4,c,c*.6,1.0);",
                "}"
            ],
            params: params.params,
            nodes: params.nodes
        });
    }
});
