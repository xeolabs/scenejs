/**
 X-Ray shader

 @author xeolabs / http://xeolabs.com

 */
SceneJS.Types.addType("shader/xray", {

    construct:function (params) {

        this._shader = this.addNode({
            type:"shader",

            shaders:[
                {
                    "stage":"fragment",
                    "code":[
                        "uniform bool   xrayEnabled;",
                        "uniform float  xrayOpacity;",
                        "uniform bool   xrayMonochrome;",
                        "uniform float   xrayGlassFactor;",

                        "vec3           myworldNormal = vec3(0.0, 0.0,  1.0);",
                        "vec3           myworldEyeVec = vec3(0.0, 0.0, -1.0);",

                        "void myWorldNormalFunc(vec3 vec) {",
                        "   myworldNormal = vec;",
                        "}",

                        "void myWorldEyeVecFunc(vec3 vec) {",
                        "   myworldEyeVec = vec;",
                        "}",

                        "vec4 myPixelColorFunc(vec4 color) {",
                        "   if (xrayEnabled && xrayOpacity < 1.0) {",
                        "       if (xrayMonochrome) {",
                        "           color = vec4(0.2, 0.2, 0.3, (xrayOpacity + 0.9 - abs(dot(myworldNormal, myworldEyeVec))));",
                        "       } else {",
//                        //"           color.a = (xrayOpacity + 1.0 - abs(dot(myworldNormal, myworldEyeVec)));",
//                        "           float a = xrayOpacity; ",
//                        "           a += xrayGlassFactor * (1.0 - abs(dot(myworldNormal, myworldEyeVec)));",
//                        "           color.a = a;",

                        "           color.a = xrayOpacity + (xrayGlassFactor * (1.0 - abs(dot(myworldNormal, myworldEyeVec))));",
                        "       }",
                        "   }",
                        "   return color;",
                        "}"
                    ],

                    hooks:{
                        worldNormal:"myWorldNormalFunc",
                        worldEyeVec:"myWorldEyeVecFunc",
                        pixelColor:"myPixelColorFunc"
                    }
                }
            ],
            params:{
                xrayEnabled:true,
                xrayOpacity:0.4,
                xrayMonochrome:false,
                xrayGlassFactor:0.0
            }
        });

        // Enable transparency with a flag
        this._flags = this._shader.addNode({
            type:"flags",
            flags:{
                transparent:true,
                backfaces:false
            },

            // Child nodes that will receive the x-ray effect
            nodes:params.nodes
        });

        this.setEnabled(params.enabled != undefined ? params.enabled : true);
        this.setOpacity(params.opacity != undefined ? params.opacity : 0.4);
        this.setMonochrome(params.monochrome != undefined ? params.monochrome : false);
        this.setGlassFactor(params.glassFactor != undefined ? params.glassFactor : 1.0);
    },

    /**
     * Enables or disables the X-Ray effect
     * @param {Boolean} enabled
     */
    setEnabled:function (enabled) {
        this._enabled = enabled;
        this._shader.setParams({ xrayEnabled:enabled });
        this._flags.setTransparent(enabled);
    },

    /**
     * Gets whether the X-Ray effect is enabled or not
     * @return {Boolean}
     */
    getEnabled:function () {
        return !!this._enabled;
    },

    /**
     * Sets the degree of opacity for X-Ray effect, with 0 being fully transparent and 1 being fully opaque
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._opacity = opacity;
        this._shader.setParams({ xrayOpacity:opacity });
    },

    /**
     * Gets the degree of opacity
     * @return {Number}
     */
    getOpacity:function () {
        return this._opacity;
    },

    /**
     * Sets whether the X-Ray effect is monochrome or not
     * @param {Boolean} monochrome
     */
    setMonochrome:function (monochrome) {
        this._monochrome = monochrome;
        this._shader.setParams({ xrayMonochrome:monochrome });        
    },

    /**
     * Gets whether the X-Ray effect is monochrome or not
     * @return {Boolean}
     */
    getMonochrome:function () {
        return !!this._monochrome;
    },

    /**
     * Sets the degree of glass factor for X-Ray effect, with 0 being no glass effect and 1 being full effect
     * @param {Number} glassFactor
     */
    setGlassFactor:function (glassFactor) {
        this._glassFactor = glassFactor;
        this._shader.setParams({ xrayGlassFactor:glassFactor });
    },

    /**
     * Gets the degree of glass factor
     * @return {Number}
     */
    getGlassFactor:function () {
        return this._glassFactor;
    }

})
;
