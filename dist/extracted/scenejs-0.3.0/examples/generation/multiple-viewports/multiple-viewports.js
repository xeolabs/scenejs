/**
 * SceneJS Example - Procedural scene generation of multiple viewports on a canvas
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * Here's one way to create multiple viewports on a canvas, using a generator node.
 * A generator node's job is to generate a dynamic scope obect containing data for
 * sub-nodes. See how its first parameter is a function to generate that scope
 * object. During a scene traversal, SceneJS will loop at that node. In each loop,
 * SceneJS calls the function, sets the scope and traverses the subtree, stopping
 * its loop as soon as the function result is undefined. Our generator causes four
 * loops, where in each one it sets a scope containing different extents for its
 * child viewport node. It stops the loop by not returning anything.
 */
with (SceneJs) {
    var exampleScene = scene({},

            canvas({
                canvasId: 'mycanvas'
            },
                    shader({ type: 'simple-shader' },
                            lights({
                                lights: [
                                    {
                                        pos: { x: 50.0, y: 0.0, z: 30.0 }
                                    }
                                ]},
                                    material({
                                        ambient:  { r:0.2, g:0.2, b:0.5 },
                                        diffuse:  { r:0.6, g:0.6, b:0.9 }
                                    },
                                            perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                            },
                                                    generator((function() {
                                                        var i = 0;
                                                        return function() {
                                                            i++;
                                                            switch (i) {
                                                                case 1: return { viewport: {  x : 1, y : 1,  width: 250, height: 250  } };
                                                                case 2: return { viewport: { x : 250, y : 1,  width: 250, height: 250  } };
                                                                case 3: return { viewport: { x : 250, y : 250,  width: 250, height: 250  } };
                                                                case 4: return { viewport: { x : 1, y : 250,  width: 250, height: 250  } };
                                                                case 5: i = 0;
                                                            }
                                                        };
                                                    })(),
                                                            viewport(function(scope) {
                                                                return scope.get('viewport');
                                                            },
                                                                    lookAt({
                                                                        eye : { x: 0.0, y: 20.0, z: -20.0},
                                                                        look : { x : 0.0, y : 0.0, z : 0 },
                                                                        up : { x: 0.0, y: 1.0, z: 0.0 }
                                                                    },
                                                                            objects.teapot()
                                                                            )
                                                                    )
                                                            )
                                                    )
                                            )
                                    )
                            )
                    )
            ); // scene
    exampleScene.render();
}

