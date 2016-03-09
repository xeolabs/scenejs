/**

 <p>Convolution shader</p>

 @author xeolabs / http://xeolabs.org

 IN DEVELOPMENT

 <p>Based on THREE.JS version by alteredq</p>

 <p>https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/ConvolutionShader.js</p>

 <p>Usage:</p>

 <pre>
 var shader = myScene.addNode({
            type: "shader/convolution",
            params: {
                uImageIncrement: [0.001953125, 0.0],
                sigma: 4.0,
                kernelSize: 25
            },
            nodes: [


            ]
    });

 </pre>
 */
SceneJS.Types.addType("shader/convolution", {

    construct: function (params) {

        var sigma = params.sigma || 4.0;
        var kernelSize = params.kernelSize || 25.0;
        var uImageIncrement = params.axis == "x" ? [ 0.001953125, 0.0] : [ 0.0, 0.001953125];
        var kernel = params.kernel;

        this._shader = this.addNode({
            type: "shader",
            coreId: "shader/convolution",
            shaders: [
                {
                    stage: "vertex",
                    code: [
                        "uniform vec2 uImageIncrement;",
                        "varying vec2 vUv;",
                        "attribute vec2 SCENEJS_aUVCoord0;",
                        "attribute vec3 SCENEJS_aVertex;",
                        "void main() {",
                        "   vUv = SCENEJS_aUVCoord0 - ( ( 25.0 - 1.0 ) / 2.0 ) * uImageIncrement;",
                        "   gl_Position = vec4( SCENEJS_aVertex, 1.0 );",
                        "}"
                    ]
                },
                {
                    stage: "fragment",
                    code: [
                        "precision highp float;",
                        "uniform float cKernel[ 25 ];",
                        "uniform sampler2D SCENEJS_uSampler0;",
                        "uniform vec2 uImageIncrement;",
                        "varying vec2 vUv;",
                        "void main() {",
                        "   vec2 imageCoord = vUv;",
                        "   vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",
                        "   for( int i = 0; i < 25; i ++ ) {",
                        "       sum += texture2D( SCENEJS_uSampler0, imageCoord ) * cKernel[ i ];",
                        "       imageCoord += uImageIncrement;",
                        "   }",
                        "   gl_FragColor = sum;",
                        "}"
                    ]
                }
            ],
            params: {
                "cKernal": this._buildKernel(sigma),
                "uImageIncrement": uImageIncrement
            },

            // Child nodes
            nodes: params.nodes
        });
    },

    _buildKernel: function (sigma) {
        // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.
        function gauss(x, sigma) {
            return Math.exp(-( x * x ) / ( 2.0 * sigma * sigma ));
        }

        var i;
        var kMaxKernelSize = 25;
        var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;
        if (kernelSize > kMaxKernelSize) {
            kernelSize = kMaxKernelSize;
        }
        var halfWidth = ( kernelSize - 1 ) * 0.5;
        var values = new Array(kernelSize);
        var sum = 0.0;
        for (i = 0; i < kernelSize; ++i) {
            values[ i ] = gauss(i - halfWidth, sigma);
            sum += values[ i ];
        }
        // normalize the kernel
        for (i = 0; i < kernelSize; ++i) {
            values[ i ] /= sum;
        }
        return values;
    }
});
