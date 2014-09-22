/**
 * Grid ground node type
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Usage example:</p>
 *
 * <pre>
 * someNode.addNode({
 *      type: "models/ground/grid2"
 *  });
 * </pre>
 */
SceneJS.Types.addType("models/ground/grid2", {
    construct: function (params) {

        this.addNode({
            type: "texture/procedural",
            code: [
                // Fragment shader from GLSL sandbox
                "       precision mediump float;",
                "        uniform float time;",
                "        uniform vec2 resolution;",
                "        void main( void ) {",
                "            vec2 pos = ( gl_FragCoord.xy / resolution.xy );",
                "            if(min(fract(pos.x*100.0),fract(pos.y*100.0))<0.15){",
                "                gl_FragColor = vec4(fract(pos.x+pos.y-time*0.001));",
                //"                gl_FragColor =  vec4(1);",
                "            }",
                "        }"
            ],
            resolution:[1000,1000],
            nodes: [
                {
                    type: "rotate",
                    x: 1,
                    angle: 90.0,

                    nodes: [
                        {
                            type: "scale",
                            x: 1000,
                            y: 1000,
                            z: 1000,

                            nodes: [

                                // Grid geometry, implemented by plugin at
                                // http://scenejs.org/api/latest/plugins/node/models/ground/grid.js
                                {
                                    type: "geometry/quad"
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }
});
