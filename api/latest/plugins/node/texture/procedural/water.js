/**
 Procedural water texture

 @author xeolabs / http://xeolabs.com

 <p>Usage: </p>
 <pre>

 var myWater = myNode.addNode({
    type: "texture/procedural/water",
    nodes:[
        {
            type: "geometry/box"
        }
    ]
 });
 */
SceneJS.Types.addType("texture/procedural/water", {
    construct: function (params) {
        this.addNode({
            type: "texture/procedural",
            code: [
                // Fragment shader from GLSL sandbox
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
            ],
            params: params.params,
            nodes: params.nodes
        });
    }
});
