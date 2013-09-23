SceneJS.Types.addType("effects/fog", {

    construct:function (params) {

        // Holds params for custom shader node
        this._shaderParams = {
            fogMode:1.0, // 0.0 disabled, 1.0 linear, 2.0 exponential, 3.0 quadratic, 4.0 constant
            fogDensity:0.05, // Fog density in range of [0.0..1.0]
            fogStart:0.0, // Nearest point of fog in view space (receeding Z-axis is positive)
            fogEnd:10000.0, // Furthest point of fog in view space
            fogColor:[0.6, 0.0, 0.0]  // Colour of fog - the colour that objects blend into
        };

        // Custom shader node
        this._shader = this.addNode({
            type:"shader",
            coreId:"effects/fog",

            shaders:[

                {
                    stage:"fragment",
                    code:[

                        /* Parameter uniforms
                         */
                        "uniform float  fogMode;",
                        "uniform float  fogDensity;",
                        "uniform float  fogStart;",
                        "uniform float  fogEnd;",
                        "uniform vec3   fogColor;",

                        /* Collected view-space fragment position
                         */
                        "vec4 _viewPos;",

                        /* Collects view-space fragment position
                         */
                        "void fogViewPosFunc(vec4 viewPos) {",
                        "   _viewPos = viewPos;",
                        "}",

                        /* Modifies fragment colour
                         */
                        "vec4 fogPixelColorFunc(vec4 color) {",
                        "   if (fogMode != 0.0) {", // not "disabled"
                        "       float fogFactor = (1.0 - fogDensity);",
                        "       if (fogMode != 4.0) {", // not "constant"
                        "           if (fogMode == 1.0) {", // "linear"
                        "               fogFactor *= clamp(pow(max((fogEnd - length(- _viewPos.xyz)) / " +
                            "                   (fogStart - fogEnd), 0.0), 2.0), 0.0, 1.0);",
                        "           } else {", // "exp" or "exp2"
                        "               fogFactor *= clamp((fogStart - length(- _viewPos.xyz)) / (fogStart - fogEnd), 0.0, 1.0);",
                        "           }",
                        "       }",
                        "       return color * (fogFactor + vec4(fogColor, 1.0)) * (1.0 - fogFactor);",
                        "   }",
                        "   return color;",
                        "}"
                    ],

                    /* Bind our functions to hooks
                     */
                    hooks:{
                        viewPos:"fogViewPosFunc",
                        pixelColor:"fogPixelColorFunc"
                    }
                }
            ],

            // Declare parameters and set default values
            params:this._shaderParams,

            nodes:params.nodes
        });

        if (params.mode != undefined) {
            this.setMode(params.mode);
        }
        if (params.density != undefined) {
            this.setDensity(params.density);
        }
        if (params.start != undefined) {
            this.setStart(params.start);
        }
        if (params.end != undefined) {
            this.setEnd(params.end);
        }
        if (params.color != undefined) {
            this.setColor(params.color);
        }
    },

    setMode:function (mode) {
        switch (mode) {
            case "disabled":
                this._shaderParams.fogMode = 0;
                break;
            case "linear":
                this._shaderParams.fogMode = 1;
                break;
            case "exp":
                this._shaderParams.fogMode = 2;
                break;
            case "exp2":
                this._shaderParams.fogMode = 3;
                break;
            case "constant":
                this._shaderParams.fogMode = 4;
                break;
        }
        this._shader.setParams(this._shaderParams);
    },

    getMode:function () {
        return ["disabled", "linear", "exp", "exp2", "constant"][this._shaderParams.fogMode]; // TODO: optimize
    },

    setDensity:function (density) {
        this._shaderParams.fogDensity = density;
        this._shader.setParams(this._shaderParams);
    },

    getDensity:function () {
        return this._shaderParams.fogDensity;
    },

    setStart:function (start) {
        this._shaderParams.fogStart = start;
        this._shader.setParams(this._shaderParams);
    },

    getStart:function () {
        return this._shaderParams.fogStart;
    },

    setEnd:function (end) {
        this._shaderParams.fogEnd = end;
        this._shader.setParams(this._shaderParams);
    },

    getEnd:function () {
        return this._shaderParams.fogEnd;
    },

    setColor:function (color) {
        this._shaderParams.fogColor = [color.r || 0, color.g || 0, color.b || 0 ];
        this._shader.setParams(this._shaderParams);
    },

    getColor:function () {
        var color = this._shaderParams.fogColor;
        return { r:color[0], g:color[1], b:color[2] };
    },

    destruct:function () {
        // Not used
    }
});
