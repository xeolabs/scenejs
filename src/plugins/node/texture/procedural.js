/**

 Procedural texture

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>
 <pre>

 // Create a box with procedural texture

 myScene.addNode({
     type: "texture/procedural",
     applyTo: "color",
     id: "myTexture",
     code: [
          // Fragment shader from GLSL sandbox
          "precision mediump float;",
          "uniform float time;",
          "varying vec2 surfacePosition;",
          "void main( void ) {",
          "    vec2 sp = surfacePosition;",
          "    vec2 p = sp*5.0 - vec2(10.0);",
          "    vec2 i = p;",
          "    float c = 1.0;",
          "    float inten = 0.10;",
          "    for (int n = 0; n < 10; n++) {",
          "        float t = time * (1.0 - (3.0 / float(n+1)));",
          "        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));",
          "        c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));",
          "    }",
          "    c /= float(10);",
          "    c = 1.5-sqrt(c);",
          "    gl_FragColor = vec4(vec3(c*c*c*c), 999.0) + vec4(0.0, 0.3, 0.5, 1.0);",
          "}"
     ],

     nodes: [
         {
             type: "material",
             color: { r: 0.7, g: 0.7, b: 0.7 },
             specularColor: { r: 1.0, g: 1.0, b: 1.0 },
             specular: 0.0,
             shine: 50.0,

             nodes: [

                 // Box node type implemented by plugin at
                 // http://scenejs.org/api/latest/plugins/node/geometry/box.js
                 {
                     type: "geometry/box"
                 }
             ]
         }
     ]
 });

 // Get the texture and modify some properties

 var myScene.getNode("myTexture",
 function(texture) {

            // Set UV coordinate scale
            texture.setScale({
                x: 0.5, y: 0.5
            });

            // Set UV coordinate translation
            texture.setTranslate({
                x: -0.2, y: 0.1
            });

            // Set UV coordinate rotation
            texture.setRotate(45.0);

            // Set blend factor, the amount by which the texture is blended
            // with whatever is under it, eg. material color or another texture
            texture.setBlendFactor(0.5);
        });
 </pre>
 */

SceneJS.Types.addType("texture/procedural", {

    construct: function (params) {

        var colorTargetId = this.getId() + ".colorTarget";
        var shaderId = this.getId() + ".shader";

        // First subgraph
        // Generates dynamic texture

        this._colorTarget = this.getScene().addNode(

            // Render to color target
            {
                type: "colorTarget",
                id: colorTargetId,

                nodes: [

                    {
                        type: "stage",
                        priority: -10,

                        nodes: [

                            // Dynamic shader
                            {
                                type: "shader",
                                id: shaderId,

                                shaders: [
                                    {
                                        stage: "vertex",
                                        code: [
                                            "attribute vec3 SCENEJS_aVertex;",
                                            "attribute vec2 SCENEJS_aUVCoord0;",
                                            "varying vec2 surfacePosition;",
                                            "void main () {",
                                            "    gl_Position = vec4(SCENEJS_aVertex, 1.0);",
                                            "    surfacePosition = SCENEJS_aUVCoord0;",
                                            "}"
                                        ]
                                    },
                                    {
                                        stage: "fragment",
                                        code: params.code
                                    }
                                ],

                                params: {
                                    time: params.time || 0.0,
                                    resolution: params.resolution || [1000.0, 1000.0]
                                },

                                nodes: [

                                    // Screen-aligned quad
                                    {
                                        type: "geometry/quad"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

        // Second subgraph
        // Wraps given child nodes in a texture sourced from the color target

        this._texture = this.addNode({
            type: "texture",
            target: colorTargetId,
            applyTo: params.applyTo,
            blendMode: params.blendMode,
            scale: params.scale,
            nodes: params.nodes
        });

        // Dynamically update the shader on each scene tick

        var scene = this.getScene();
        var self = this;

        scene.getNode(shaderId,
            function (shader) {

                var time = 0;

                self._tick = scene.on("tick",
                    function (params) {

                        shader.setParams({
                            time: time += 0.1
                        });
                    });
            });
    },


    /**
     * Sets the texture's blend factor with respect to other active textures.
     * @param {number} blendFactor The blend factor, in range [0..1]
     */
    setBlendFactor: function (blendFactor) {
        this._texture.setBlendFactor(blendFactor);
    },

    getBlendFactor: function () {
        return this._texture.getBlendFactor();
    },

    setTranslate: function (t) {
        this._texture.setTranslate(t);
    },

    getTranslate: function () {
        return this._texture.getTranslate();
    },

    setScale: function (s) {
        this._texture.setScale(s);
    },

    getScale: function () {
        return this._texture.getScale();
    },

    setRotate: function (angle) {
        this._texture.setRotate(s);
    },

    getRotate: function () {
        return this._texture.getRotate();
    },

    getMatrix: function () {
        return this._texture.getMatrix();
    },

    destruct: function () {
        this.getScene.off(this._tick);
        this._colorTarget.destroy();
    }
});
