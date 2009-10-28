with (SceneJs) {

    var content = shaders.simpleShader(

            lights({
                lights: [
                    {
                        pos: { x: 0.0, y: 50.0, z: -50.0 }
                    }
                ]},
                    viewport({
                        x : 1,
                        y : 1,
                        width: 400,
                        height: 400},

                            perspective({
                                fovy : 60.0,
                                aspect : 1.0,
                                near : 0.1,
                                far : 400.0},

                                    lookAt({
                                        eye : { x: 5.0, y: 5.0, z: -7.0 },
                                        up : { y: 1.0 }},

                                            material({
                                                ambient: { r:0.0, g:0.2, b:0.2 },
                                                diffuse: { r:0.0, g:0.0, b:0.4 },
                                                specular: { r:0.6,g:0.6, b:0.6 }},

                                                    objects.teapot()
                                                    ) // material
                                            ) // lookAt
                                    ) // perspective
                            ) // viewport
                    ) // lights
            ); // smoothShader



    var scene = graph(
            canvas({ canvasId: 'canvas1'}, content,content)
            );

    /* Lets do it - render one frame of the scene frontend. To recap, the canvas tag with ID "example-canvas" will display
     * a perspective projection of a teapot, scaled, rotated a little bit, translated back into the Z-axis and shaded.
     *
     * Note that if your scene frontend was interactive or animated, you would call this method in a loop.
     */
    scene.render();
}

