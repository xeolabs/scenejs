/**

 Procedural grid texture

 @author xeolabs / http://xeolabs.com

 @author xeolabs / http://xeolabs.com

 <p>Usage: </p>
 <pre>

 var myGreengrid = myNode.addNode({
    type: "texture/procedural/grid",
    nodes:[
        {
            type: "geometry/box"
        }
    ]
 });
 */

SceneJS.Types.addType("texture/procedural/grid", {
    construct: function (params) {
        this.addNode(SceneJS._applyIf(params, {
            type: "texture/procedural",
            code: [
                "       precision mediump float;",
                "        uniform float time;",
                "        uniform vec2 resolution;",
                "        void main( void ) {",
                "            vec2 pos = ( gl_FragCoord.xy / resolution.xy );",
                "            if(min(fract(pos.x*10.0),fract(pos.y*10.0))<0.1){",
                "                gl_FragColor = vec4(0.0, 0.5 + fract(pos.x*0.2-time*0.05+5.0), 0.0, 1.0);",
                "            }",
                "        }"
            ],
            resolution:[100,100],
            params: params.params,
            nodes: params.nodes
        }));
    }
});
