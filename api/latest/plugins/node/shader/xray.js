/**
 X-Ray shader

 @author xeolabs / http://xeolabs.com

 */
SceneJS.Types.addType("shader/xray", {

    construct: function (params) {

        this._shader = this.addNode({
            type: "shader",

            "shaders": [
                {
                    "stage": "fragment",
                    "code": [
                        "uniform bool   transparent;",
                        "uniform bool   xray;",
                        "uniform float  glassFactor;",
                        "uniform float  murkiness;",
                        "uniform float  opacity;",
                        "uniform bool   highlight;",
                        "uniform bool   desaturate;",
                        "uniform vec3   xrayBGColor;",

                        "vec3 _std_viewNormal = vec3(0.0, 0.0,  -1.0);",

                        // Intercept the View-space normal vector
                        "void _std_ViewNormalFunc(vec3 vec) {",
                        "   _std_viewNormal = vec;",
                        "}",

                        // Intercept material alpha, adjust according to angle between the vectors
                        "float _std_MaterialAlphaFunc(float alpha) {",

                        // If in X-Ray, mode compute transparency from 'glassFactor' and 'murkiness'
                        "   if (xray) {",
                        "       alpha = (1.0  * (0.7 - abs(dot(_std_viewNormal, SCENEJS_vViewEyeVec))));",
                        "   }",

                        // If in transparency mode, set transparency to lowest among 'opacity' and 'alpha'
                        "   else if (transparent) {",
                        "       if (opacity < alpha) {",
                        "           alpha = opacity;",
                        "       }",
                        "       float gf = (glassFactor  * (murkiness - abs(dot(_std_viewNormal, SCENEJS_vViewEyeVec))));",
                        "       if (gf > alpha) {",
                        "           alpha = gf;",
                        "       }",
                        "   }",

                        "   return alpha;",
                        "}",

                        // Intercept the outgoing fragment color
                        "vec4 _std_PixelColorFunc(vec4 color) {",
                        "   if (highlight) {",
                        "       float intensity = 0.3 * color.r + 0.59 * color.g + 0.11 * color.b;",
                        "       color = vec4((intensity * -0.1) + color.rgb * (1.0 + 0.1), color.a);",
                        "       color.r = clamp(color.r * 1.5, 0.3, 1.0);",
                        "       color.g = clamp(color.g * 1.5, 0.3, 1.0);",
                        "       color.b = color.b * 0.5;",
                        "   } else if (desaturate) {",
                        "       color.rgb = xrayBGColor;",
                        "   } ",
                        "   return color;",
                        "}"
                    ],
                    "hooks": {
                        "viewNormal": "_std_ViewNormalFunc",
                        "materialAlpha": "_std_MaterialAlphaFunc",
                        "pixelColor": "_std_PixelColorFunc"
                    }
                }
            ],
            "params": {
                "transparent": false,
                "xray": true,
                "glassFactor": 1.0, // Full glass effect
                "murkiness": 1.0,
                "highlight": false,
                "opacity": 1.0,
                "desaturate": false,
                "xrayBGColor": [0.0, 0.0, 0.1]
            }
        });

        // Enable transparency with a flag
        this._flags = this._shader.addNode({
            type: "flags",
            flags: {
                transparent: true,
                backfaces: false
            },

            // Child nodes that will receive the x-ray effect
            nodes: params.nodes
        });

//        this.setEnabled(params.enabled != undefined ? params.enabled : true);
//        this.setOpacity(params.opacity != undefined ? params.opacity : 0.4);
//        this.setMonochrome(params.monochrome != undefined ? params.monochrome : false);
//        this.setGlassFactor(params.glassFactor != undefined ? params.glassFactor : 1.0);
    },

    /**
     * Enables or disables the X-Ray effect
     * @param {Boolean} enabled
     */
    setEnabled: function (enabled) {
        this._enabled = enabled;
        this._shader.setParams({ xrayEnabled: enabled });
        this._flags.setTransparent(enabled);
    },

    /**
     * Gets whether the X-Ray effect is enabled or not
     * @return {Boolean}
     */
    getEnabled: function () {
        return !!this._enabled;
    },

    /**
     * Sets the degree of opacity for X-Ray effect, with 0 being fully transparent and 1 being fully opaque
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {
        this._opacity = opacity;
        this._shader.setParams({ xrayOpacity: opacity });
    },

    /**
     * Gets the degree of opacity
     * @return {Number}
     */
    getOpacity: function () {
        return this._opacity;
    },

    /**
     * Sets whether the X-Ray effect is monochrome or not
     * @param {Boolean} monochrome
     */
    setMonochrome: function (monochrome) {
        this._monochrome = monochrome;
        this._shader.setParams({ xrayMonochrome: monochrome });
    },

    /**
     * Gets whether the X-Ray effect is monochrome or not
     * @return {Boolean}
     */
    getMonochrome: function () {
        return !!this._monochrome;
    },

    /**
     * Sets the degree of glass factor for X-Ray effect, with 0 being no glass effect and 1 being full effect
     * @param {Number} glassFactor
     */
    setGlassFactor: function (glassFactor) {
        this._glassFactor = glassFactor;
        this._shader.setParams({ xrayGlassFactor: glassFactor });
    },

    /**
     * Gets the degree of glass factor
     * @return {Number}
     */
    getGlassFactor: function () {
        return this._glassFactor;
    }

})
;
