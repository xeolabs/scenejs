with (SceneJs) {

  var scene = graph(
    {},

    canvas(
      { canvasId: 'exampleCanvas'}, // DONT EDIT - Locates demo canvas

      viewport(
        { x : 1, y : 1, width: 350, height: 350},

        shader(
          { type: 'simple-shader' },

          lights(
            {
              lights: [
                {
                  pos: { x: 0.0, y: 50.0, z: -50.0 }
                }
              ]},

            frustum(
              { fovy : 60.0, aspect : 1.0, near : 0.1, far : 400.0},

              lookAt(
                {
                  eye : { x: 5.0, y: 5.0, z: -7.0},
                  up : { y: 1.0 }
                },

                rotate(function(scope) {
                  return {
                    angle: scope.get('angle'), x : 1.0
                  };
                },

                       material({
                         ambient: { r:0.5, g:0.5, b:0.9 },
                         diffuse: { r:0.5, g:0.5, b:0.9 },
                         specular: { r:0.5, g:0.5, b:0.9 }},

                                objects.teapot()
                               )
                      ) // rotate
              ) // lookAt
            ) // frustum
          ) // lights
        ) // shader
      ) // viewport
    ) // canvas
  ); // scene

  scene.render({angle: 45.0});
}