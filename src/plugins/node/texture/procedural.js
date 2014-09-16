/**
 Dynamic rippling water texture

 <p>Usage: </p>
 <pre>

 // Create a box with dynamic water texture

 var myWater = myNode.addNode({
    type: "texture/procedural",
    nodes:[
        {
            type: "geometry/box"
        }
    ]
 });
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
                                            "attribute vec2 SCENEJS_aUVCoord;",
                                            "varying vec2 surfacePosition;",
                                            "void main () {",
                                            "    gl_Position = vec4(SCENEJS_aVertex, 1.0);",
                                            "    surfacePosition = SCENEJS_aUVCoord;",
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
            type: "textureMap",
            target: colorTargetId,
            applyTo: params.applyTo,
            blendMode: params.blendMode,

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

    destruct: function () {
        this.getScene.off(this._tick);
        this._colorTarget.destroy();
    }
});
