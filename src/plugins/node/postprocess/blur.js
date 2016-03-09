/**

 Blur post-process effect

 @author xeolabs / http://xeolabs.com

 <p>Usage:</p>

 <pre>

 // Create blur effect around a procedurally-generated city

 var blur = myScene.addNode({
     type: "postprocess/blur",
     texelSize:  0.00099,  // Size of one texel (1 / width, 1 / height)
     factor: 0.3,          // Amount of blur [0..1]

      nodes: [

        // City, implemented by plugin at
        // http://scenejs.org/api/latest/plugins/node/models/buildings/city.js
        {
            type: "models/buildings/city",
            width: 600
        }
     ]
 });

 // Adjust parameters:

 blur.setTexelSize(.005);

 blur.setFactor(0.55);

 </pre>

 */
SceneJS.Types.addType("postprocess/blur", {

    construct: function (params) {

        // IDs for the render target nodes
        var colorTarget = this.id + ".colorTarget";
        var colorTarget2 = this.id + ".colorTarget2";

        this._texelSize = params.texelSize != undefined ? params.texelSize : 0.00099; // Size of one texel (1 / width, 1 / height)
        this._factor = params.factor != undefined ? params.factor : 0.5;  // Amount of blur

        // Build a three-stage scene sub-graph:
        // First stage renders the given child nodes to color target
        // Second stage applies horizontal blur using the color target as input, renders to second color target
        // Third stage applies vertical blur using the second color target, renders to display

        this.addNodes([

            // Stage 1
            // Render scene to color and depth targets
            {
                type: "stage",
                priority: 1,
                pickable: true,

                nodes: [

                    // Output color target
                    {
                        type: "colorTarget",
                        id: colorTarget,

                        nodes: [

                            // Leaf node
                            {
                                id: this.id + ".leaf",

                                // The child nodes we want to render with this effect
                                nodes: params.nodes
                            }
                        ]
                    }
                ]
            }
        ]);

        // Blur shader shared by stages 2 and 3
        this._shader = this.addNode({
            type: "shader",
            shaders: [

                // Vertex stage just passes through the positions and UVs
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

                // Fragment stage blurs the color target
                {
                    stage: "fragment",
                    code: [
                        "precision highp float;",
                        "uniform sampler2D SCENEJS_uSampler0;", // Colour target
                        "uniform vec2 texelSize;",		        // Size of one texel (1 / width, 1 / height)
                        "uniform float orientation;",	        // 0 = horizontal, 1 = vertical
                        "uniform float factor;",	            // Calculated from the blur equation, b = ( f * ms / N )                        
                        "varying vec2 vUv;",
                        "void main () {",
                        "   const float MAX_BLUR_FACTOR = 20.0;",
                        "   float blurAmount = factor * 20.0;",
                        "   float count = 0.0;",
                        "   vec4 colour = vec4(0.0);",
                        "   vec2 texelOffset;",
                        "   if ( orientation == 0.0 )",
                        "       texelOffset = vec2(texelSize.x, 0.0);",
                        "   else",
                        "       texelOffset = vec2(0.0, texelSize.y);",
                        "   if ( blurAmount >= 1.0 ) {",
                        "       float halfBlur = blurAmount * 0.5;",
                        "       for (float i = 0.0; i < MAX_BLUR_FACTOR; ++i) {",
                        "           if ( i >= blurAmount )",
                        "               break;",
                        "           float offset = i - halfBlur;",
                        "           vec2 vOffset = vUv + (texelOffset * offset);",
                        "           colour += texture2D(SCENEJS_uSampler0, vOffset);",
                        "           ++count;",
                        "       }",
                        "   }",
                        "   if ( count > 0.0 )",
                        "       gl_FragColor = colour / count;",
                        "   else",
                        "       gl_FragColor = texture2D(SCENEJS_uSampler0, vUv);",

                        "}"
                    ]
                }
            ],

            // Shader params for both horizontal and vertical blur stages
            params: {
                "texelSize": [this._texelSize, this._texelSize],    // Texel size
                "factor": this._factor,	                            // Amount of blur
                "orientation": 0.0	                                // 0 = horizontal, 1 = vertical
            }
        });

        // Stages 2 and 3
        this._shader.addNodes([

            // Stage 2
            // Horizontal blur using color and depth targets,
            // rendering to a second color target
            {
                type: "stage",
                priority: 2,
                nodes: [

                    // Output color target
                    {
                        type: "colorTarget",
                        id: colorTarget2,
                        nodes: [

                            // Input color target
                            {
                                type: "texture",
                                target: colorTarget,
                                nodes: [

                                    // Shader parameters for this stage
                                    {
                                        type: "shaderParams",
                                        params: {
                                            "orientation": 0.0	// 0 = horizontal, 1 = vertical
                                        },

                                        nodes: [
                                            {
                                                type: "geometry/quad"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },

            // Stage 3
            // Vertical blur taking as input the second color target,
            // rendering to the canvas
            {
                type: "stage",
                priority: 3,
                nodes: [

                    // Input second color target
                    {
                        type: "texture",
                        target: colorTarget2,
                        nodes: [

                            // Shader parameters for this stage
                            {
                                type: "shaderParams",
                                params: {
                                    "orientation": 1.0	// 0 = horizontal, 1 = vertical
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
    },

    /**
     * Sets the texel size
     * @param {Number} texelSize The texel size
     */
    setTexelSize: function (texelSize) {
        this._texelSize = texelSize;
        this._shader.setParams({
            texelSize: [texelSize, texelSize]
        });
    },

    /**
     * Gets the texel size
     * @returns {Number}
     */
    getTexelSize: function () {
        return this._texelSize;
    },

    /**
     * Sets the blur coefficient.
     * This is calculated from the blur equation, b = ( f * ms / N ).
     * @param {Number} factor The coefficient
     */
    setFactor: function (factor) {
        this._shader.setParams({
            factor: this._factor = factor
        });
    },

    /**
     * Gets the blur coefficient
     * @returns {Number}
     */
    getFactor: function () {
        return this._factor;
    }
});

