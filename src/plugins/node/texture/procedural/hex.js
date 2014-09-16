/**

 Procedural hex texture

 <p>Usage: </p>
 <pre>

 var myGreenhex = myNode.addNode({
    type: "texture/procedural/hex",
    nodes:[
        {
            type: "geometry/box"
        }
    ]
 });
 */

SceneJS.Types.addType("texture/procedural/hex", {
    construct: function (params) {
        this.addNode({
            type: "texture/procedural",
            code: [
                // Fragment shader from GLSL sandbox
                "precision highp float;",
                "uniform float time;",
                "uniform vec2 mouse;",
                "uniform vec2 resolution;",

                "float Scale = 50.0;",
                "vec2 Move = vec2(0.0, 50.0);",
                "vec4 Color1 = vec4(0.0, 0.0, 0.0 ,1.0);",
                "vec4 Color2 = vec4(0.0, 0.0, 0.0 ,1.0);",
                "vec4 Color3 = vec4(1.0, 1.0, 1.0 ,1.0);",
                "float hexx( vec2 p, vec2 h )",
                "{",
                "    vec2 q = abs(p);",
                "    return max(q.x-h.y,max(q.x+q.y*0.57735,q.y*1.1547)-h.x);",
                "}",

                "void main( void )",
                "{",
                "    vec2 hex = vec2(0.692, 0.4) * Scale;",
                "    float radius = 0.215 * Scale;",
                //"    //radius *= pow(min(1.0, max(0.0, gl_FragCoord.y-0.0)/200.0), 0.8);",
                //"    vec2 p = gl_FragCoord.xy + (Move*time);",
                "    vec2 p = gl_FragCoord.xy + (Move);",
                "    vec2 p1 = mod(p, hex) - hex*vec2(0.5);",
                "    vec2 p2 = mod(p+hex*0.5, hex) - hex*vec2(0.5);",
                "    float d1 = hexx(p1, vec2(radius));",
                "    float d2 = hexx(p2, vec2(radius));",
                "    float d = min(d1, d2);",
                "    float c = d>0.0 ? 0.0 : 0.9;",

                "    float g = max((mod(gl_FragCoord.x+gl_FragCoord.y-time*30.0, 500.0)/200.0), 0.0);",

                "    gl_FragColor = Color1*vec4(c) + max(Color2, Color3*g)*vec4(1.0-c);",
                "}"
            ],
            resolution: [10000, 10000],
            params: params.params,
            nodes: params.nodes
        });
    }
});
