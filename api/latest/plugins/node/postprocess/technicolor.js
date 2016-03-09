/**
 Technicolor postprocess effect

 @author xeolabs / http://xeolabs.com

 <pre>

 // Create technicolor effect around a procedurally-generated city

 var dof = myScene.addNode({
     type: "postprocess/technicolor",

     nodes: [

        // City, implemented by plugin at
        // http://scenejs.org/api/latest/plugins/node/models/buildings/city.js
        {
            type: "models/buildings/city",
            width: 600
        }
     ]
 });
 </pre>
 */
SceneJS.Types.addType("postprocess/technicolor", {

    construct: function (params) {

        var colorTargetId = this.id + ".colorTarget";

        this.addNodes([
            {
                type: "stage",
                priority: 1,
                pickable: true,

                nodes: [
                    {
                        type: "colorTarget",
                        id: colorTargetId,
                        nodes: [
                            {
                                id: this.id + ".leaf",

                                // The child nodes we want to render with DOF
                                nodes: params.nodes
                            }
                        ]
                    }
                ]
            },
            {
                type: "stage",
                priority: 2,

                nodes: [
                    {
                        type: "texture",
                        target: colorTargetId,

                        nodes: [
                            {
                                type: "shader",
                                shaders: [
                                    {
                                        stage: "vertex",
                                        code: [
                                            "attribute vec3 SCENEJS_aVertex;",
                                            "attribute vec2 SCENEJS_aUVCoord0;",
                                            "varying vec2 vUv;",
                                            "void main () {",
                                            "    gl_Position = vec4(SCENEJS_aVertex, 1.0);",
                                            "    vUv = SCENEJS_aUVCoord0;",
                                            "}"
                                        ]
                                    },
                                    {
                                        stage: "fragment",
                                        code: [
                                            "precision highp float;",
                                            "uniform sampler2D SCENEJS_uSampler0;", // Colour target's texture
                                            "varying vec2 vUv;",
                                            "void main() {",
                                            "vec4 tex = texture2D( SCENEJS_uSampler0, vec2( vUv.x, vUv.y ) );",
                                            "gl_FragColor = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);",
                                            "}"

                                        ]
                                    }
                                ],

                                nodes: [

                                    // Quad primitive, implemented by plugin at
                                    // http://scenejs.org/api/latest/plugins/node/geometry/quad.js
                                    {
                                        type: "geometry/quad"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]);
    }
});

