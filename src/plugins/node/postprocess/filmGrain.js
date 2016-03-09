/**

 Film grain post-process effect

 @author xeolabs / http://xeolabs.com

 <p>Usage:</p>

 <pre>

 // Create film grain effect around a procedurally-generated city

 var blur = myScene.addNode({
     type: "postprocess/filmGrain",

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
SceneJS.Types.addType("postprocess/filmGrain", {

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
                            // Leaf node
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

                                            // control parameter
                                            "uniform float time;",

                                            "uniform bool grayscale;",

                                            // noise effect intensity value (0 = no effect, 1 = full effect)
                                            "uniform float nIntensity;",

                                            // scanlines effect intensity value (0 = no effect, 1 = full effect)
                                            "uniform float sIntensity;",

                                            // scanlines effect count value (0 = no effect, 4096 = full effect)
                                            "uniform float sCount;",

                                            "void main() {",

                                            // sample the source
                                            "vec4 cTextureScreen = texture2D( SCENEJS_uSampler0, vUv );",

                                            // make some noise
                                            "float x = vUv.x * vUv.y * time *  1000.0;",
                                            "x = mod( x, 13.0 ) * mod( x, 123.0 );",
                                            "float dx = mod( x, 0.01 );",

                                            // add noise
                                            "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",

                                            // get us a sine and cosine
                                            "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

                                            // add scanlines
                                            "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

                                            // interpolate between source and result by intensity
                                            "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

                                            // convert to grayscale if desired
                                            "if( grayscale ) {",

                                            "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

                                            "}",

                                            "gl_FragColor =  vec4( cResult, cTextureScreen.a );",

                                            "}"

                                        ]
                                    }
                                ],
                                params: {
                                    nIntensity: 0.5,
                                    sIntensity: 0.95,
                                    sCount: 4096,
                                    grayscale: false
                                },

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

