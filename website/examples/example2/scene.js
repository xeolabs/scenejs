with (SceneJs) {
  var scene = graph(
     {},             

    canvas(
      { canvasId: 'exampleCanvas'}, // DONT EDIT - Locates demo canvas

      viewport(
        { x : 1, y : 1, width: 400, height: 400},

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

                generator(
                  function() {

                    var x = 0;
                    
                    return function() {
                      x += 5.0;
                      if (x < 20) {
                        return { x: x };
                      }
                    };
                  },

                  translate(
                    function(scope) {
                      return { x: scope.get('x') };
                    },

                    objects.teapot()

                  ) // translate
                ) // generator
              ) // lookAt
            ) // frustum
          ) // lights
        ) // shader
      ) // viewport
    ) // canvas
  ); // scene

  scene.render();
}