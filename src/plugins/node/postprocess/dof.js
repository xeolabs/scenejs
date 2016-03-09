/**

 Depth-of-Field post-process effect.

 @author xeolabs / http://xeolabs.com

 <p>Based on the article at Nutty Software: http://www.nutty.ca/?page_id=352&link=depth_of_field</p>

 <p>Usage:</p>

 <pre>

 // Create depth-of-field effect around a procedurally-generated city

 var dof = myScene.addNode({
     type: "postprocess/dof",
     texelSize:  0.00099,       // Size of one texel (1 / width, 1 / height)
     blurCoeff: 0.0011,	        // Calculated from the blur equation, b = ( f * ms / N )
     focusDist: 500.0,	        // The distance to the subject in perfect focus (= Ds)
     ppm: 10000,                // Pixels per millimetre

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

 dof.setTexelSize(.005);

 dof.setBlurCoeff(0.065);

 dof.setFocusDist(200.0);

 dof.setPPM(5000);

 </pre>

 <p>Autofocus</p>

 <pre>

 // When the "postprocess/dof" is under a "lookAt" node, or any node that creates one of those, such as
 // "cameras/orbit", then we can use the "autofocus" option to automatically synchronize its "focusDist"
 // with the length of the "lookAt" node's eye->look vector.

 myScene.addNode({
        type: "lookAt",
        eye: { x: 0, y: 0, z: -100 },
        look: [ x; 0, y; 0, z: 0 },

 nodes: [
 {
     type: "postprocess/dof",
     texelSize:  0.00099,
     blurCoeff: 0.0011,
     focusDist: 500.0,
     ppm: 10000,
     autofocus: true,  // Set true (default) to automatically manage focusDist

     nodes: [

         // City, implemented by plugin at
         // http://scenejs.org/api/latest/plugins/node/models/buildings/city.js
         {
             type: "models/buildings/city",
             width: 600
         }
     ]
 }
 ]
 });

 </pre>

 */
SceneJS.Types.addType("postprocess/dof", {

    construct: function (params) {

        // IDs for the render target nodes
        var colorTarget = this.id + ".colorTarget";
        var colorTarget2 = this.id + ".colorTarget2";
        var depthTarget = this.id + ".depthTarget";

        this._texelSize = params.texelSize != undefined ? params.texelSize : 0.00099; // Size of one texel (1 / width, 1 / height)
        this._blurCoeff = params.blurCoeff != undefined ? params.blurCoeff : 0.0011;  // Calculated from the blur equation, b = ( f * ms / N )
        this._focusDist = params.focusDist != undefined ? params.focusDist : 500.0;	  // The distance to the subject in perfect focus (= Ds)
        this._ppm = params.ppm || 10000;                                              // Pixels per millimetre
        this._near = params.near || 0.1;
        this._far = params.far || 10000.0;
        this._autofocus = (params.autofocus !== false);
        this._autoclip = (params.autoclip !== false);

        // Build a three-stage scene sub-graph:
        // First stage renders the given child nodes to color and depth targets
        // Second stage applies horizontal blur using the color and depth targets, renders to second color target
        // Third stage applies vertical blur using the color and depth targets, renders to display

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

                            // Output depth target
                            {
                                type: "depthTarget",
                                id: depthTarget,

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
                    }
                ]
            }

//                    // Debug stage - uncomment this to render the depth buffer to the canvas
//                    ,
//                    {
//                        type: "stage",
//                        priority: 1.2,
//
//                        nodes: [
//                            {
//                              type: "depthTarget/render",
//                                target: depthTarget
//                            }
//                        ]
//                    }
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

                // Fragment stage blurs each pixel in color target by amount in proportion to
                // corresponding depth in depth buffer
                {
                    stage: "fragment",
                    code: [
                        "precision highp float;",

                        "uniform sampler2D SCENEJS_uSampler0;", // Colour target's texture
                        "uniform sampler2D SCENEJS_uSampler1;", // Depth target's texture

                        "uniform vec2 texelSize;",		        // Size of one texel (1 / width, 1 / height)
                        "uniform float orientation;",	        // 0 = horizontal, 1 = vertical
                        "uniform float blurCoeff;",	            // Calculated from the blur equation, b = ( f * ms / N )
                        "uniform float focusDist;",	            // The distance to the subject in perfect focus (= Ds)
                        "uniform float near;",		            // near clipping plane
                        "uniform float far;",		            // far clipping plane
                        "uniform float ppm;",		            // Pixels per millimetre
                        "varying vec2 vUv;",

                        /// Unpacks an RGBA pixel to floating point value.
                        "float unpack (vec4 colour) {",
                        "   const vec4 bitShifts = vec4(1.0,",
                        "   1.0 / 255.0,",
                        "   1.0 / (255.0 * 255.0),",
                        "   1.0 / (255.0 * 255.0 * 255.0));",
                        "   return dot(colour, bitShifts);",
                        "}",

                        // Calculates the blur diameter to apply on the image.
                        // b = (f * ms / N) * (xd / (Ds +- xd))
                        // Where:
                        // (Ds + xd) for background objects
                        // (Ds - xd) for foreground objects
                        "float getBlurDiameter (float d) {",
                        //  Convert from linear depth to metres
                        "   float Dd = d * (far - near);",
                        "   float xd = abs(Dd - focusDist);",
                        "   float xdd = (Dd < focusDist) ? (focusDist - xd) : (focusDist + xd);",
                        "   float b = blurCoeff * (xd / xdd);",
                        "   return b * ppm;",
                        "}",

                        "void main () {",

                        //  Maximum blur radius to limit hardware requirements.
                        //  Cannot #define this due to a driver issue with some setups
                        "   const float MAX_BLUR_RADIUS = 60.0;",

                        //  Pass the linear depth values recorded in the depth map to the blur
                        //  equation to find out how much each pixel should be blurred with the
                        //  given camera settings.
                        "   float depth = unpack(texture2D(SCENEJS_uSampler1, vUv));",
                        "   float blurAmount = getBlurDiameter(depth);",
                        "   blurAmount = min(floor(blurAmount), MAX_BLUR_RADIUS);",

                        //  Apply the blur
                        "   float count = 0.0;",
                        "   vec4 colour = vec4(0.0);",
                        "   vec2 texelOffset;",

                        "   if ( orientation == 0.0 )",
                        "       texelOffset = vec2(texelSize.x, 0.0);",
                        "   else",
                        "       texelOffset = vec2(0.0, texelSize.y);",

                        "   if ( blurAmount >= 1.0 ) {",
                        "       float halfBlur = blurAmount * 0.5;",
                        "       for (float i = 0.0; i < MAX_BLUR_RADIUS; ++i) {",
                        "           if ( i >= blurAmount )",
                        "               break;",
                        "           float offset = i - halfBlur;",
                        "           vec2 vOffset = vUv + (texelOffset * offset);",
                        "           colour += texture2D(SCENEJS_uSampler0, vOffset);",
                        "           ++count;",
                        "       }",
                        "   }",

                        //  Apply colour
                        "   if ( count > 0.0 )",
                        "       gl_FragColor = colour / count;",
                        "   else",
                        "       gl_FragColor = texture2D(SCENEJS_uSampler0, vUv);",

                        "}"
                    ]
                }
            ],

            // Shader params for both horizontal and vertical blur passes
            params: {
                "texelSize": [this._texelSize, this._texelSize],       // Texel size
                "blurCoeff": this._blurCoeff,	// Calculated from the blur equation, b = ( f * ms / N )
                "focusDist": this._focusDist,	// The distance to the subject in perfect focus (= Ds)
                "near:": this._near,		        // near clipping plane
                "far": this._far,		            // far clipping plane
                "ppm": this._ppm,		            // Pixels per millimetre
                "orientation": 0.0	                // 0 = horizontal, 1 = vertical
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

                                    // Input depth target
                                    {
                                        type: "texture",
                                        target: depthTarget,
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
                    }
                ]
            },

            // Stage 3
            // Vertical blur taking as inputs the depth target and the second color target,
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

                            // Input depth target
                            {
                                type: "texture",
                                target: depthTarget,
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
     * @param {Number} blurCoeff The coefficient
     */
    setBlurCoeff: function (blurCoeff) {
        this._shader.setParams({
            blurCoeff: this._blurCoeff = blurCoeff
        });
    },

    /**
     * Gets the blur coefficient
     * @returns {Number}
     */
    getBlurCoeff: function () {
        return this._blurCoeff;
    },

    /**
     * Sets the distance to the subject in perfect focus
     * @param {Number} focusDist The focus distance
     */
    setFocusDist: function (focusDist) {
        this._shader.setParams({
            focusDist: this._focusDist = focusDist
        });
    },

    /** Gets the distance to the subject in perfect focus
     * @returns {Number}
     */
    getFocusDist: function () {
        return this._focusDist;
    },

    /**
     * Sets the distance to the near plane
     * @param {Number} near The near plane distance
     */
    setNear: function (near) {
        this._shader.setParams({
            near: this._near = near
        });
    },

    /** Gets distance to near plane
     * @returns {Number}
     */
    getNear: function () {
        return this._near;
    },

    /**
     * Sets the distance to the far plane
     * @param {Number} far The far plane distance
     */
    setFar: function (far) {
        this._shader.setParams({
            far: far
        });
    },

    /** Gets distance to far plane
     * @returns {Number}
     */
    getFar: function () {
        return this._far;
    },

    /**
     * Sets the number of pixels per millimetre
     * @param {Number} ppm The pixels per millimetre
     */
    setPPM: function (ppm) {
        this._shader.setParams({
            ppm: this._ppm = ppm
        });
    },

    /**
     * Gets the number of pixels per millimeter
     * @returns {Number}
     */
    getPPM: function () {
        return this._ppm;
    },

    preCompile: function () {
        if (this._autofocus) {
            this._initLookat();
        }
        if (this._autoclip) {
            this._initCamera();
        }
    },

    // Synchronises near and far DOF planes with first
    // camera node we find higher in the scene
    _initCamera: function () {
        var node = this.parent;
        while (node && node.type != "camera") {
            node = node.parent
        }
        if (node && (!this._camera || node.id != this._camera.id)) {
            if (this._camera) {
                this._camera.off(this._cameraSub);
            }
            this._camera = node;
            var self = this;

            function synchWithCamera() {
                var optics = self._camera.getOptics();
                self.setNear(optics.near);
                self.setFar(optics.far);
            }

            this._cameraSub = (!node) ? null : node.on("matrix", synchWithCamera);

            synchWithCamera(); // Immediately synch with camera
        }
    },

    // Synchronises focus depth with length of (eye->look) on the
    // first lookat node we find higher in the scene
    _initLookat: function () {
        var node = this.parent;
        while (node && node.type != "lookAt") {
            node = node.parent
        }
        if (node && (!this._lookat || node.id != this._lookat.id)) {
            if (this._lookat) {
                this._lookat.off(this._lookatSub);
            }
            this._lookat = node;
            var self = this;
            // Synchronise focus depth with length of eye->look vector

            function synchWithLookat() {
                var look = self._lookat.getLook();
                var eye = self._lookat.getEye();
                self.setFocusDist(SceneJS_math_lenVec3([ look.x - eye.x, look.y - eye.y, look.z - eye.z ]));
            }

            this._lookatSub = (!node) ? null : node.on("matrix", synchWithLookat);

            synchWithLookat(); // Imediately sycnh with lookat
        }
    }
});
