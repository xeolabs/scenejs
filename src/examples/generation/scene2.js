/**
 * Demonstrates how to use a generator node to render a scene in two viewports 
 */
with (SceneJs) {
    var scene = graph({},
            generator(function() {
                var i = 0;
                return function() {
                    switch (i++) {
                        case 0: return {  x : 1, y : 1,  width: 200, height: 200  };
                        case 1: return {  x : 250, y : 1,  width: 200, height: 200  };
                        case 2: i = 0;
                    }
                };
            },
                    canvas({
                        canvasId: 'myCanvas'
                    },
                            viewport(function(scope) {
                                return scope.get('viewport');
                            }
                                // (...  remainder of the scene graph here ...)

                                    ) // viewport
                            ) // canvas
                    ) // generator
            ); // scene

    scene.render();
}

