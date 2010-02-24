/**
 * Introductory SceneJS Example - Procedural scene generation of multiple canvases
 *
 * Lindsay Kay
 * lindsay.stanley.kay AT gmail.com
 * January 2010
 *
 * Here's one way to create multiple views of the same scene, each in a
 * seperate canvas, using a generator node.
 *
 * A generator node's job is to generate a dynamic scope obect containing
 * data for sub-nodes. See how its first parameter is a function to
 * generate that scope object. During a scene traversal, SceneJS will loop at
 * that node. In each loop, SceneJS calls the function, sets the scope and
 * traverses the subtree, stopping its loop as soon as the function result is
 * undefined. Our generator causes three loops, where in each one it sets a
 * scope containing the ID of a different canvas, with different parameters for
 * a lookAt transform. It stops the loop by not returning anything.
 *
 * The canvas and lookAt nodes in the generator's subtree then accept those
 * parameters for their configurations.
 */
with (SceneJS) {
    var exampleScene = scene({}, // node always has a config object

            generator((function() {
                var i = 0;
                return function() {
                    i++;
                    switch (i) {
                        case 1: return { canvasId : "canvas1", eye: { z : 20, y: 1 }, look :{ y: 1 }, up: { y : 1 } };
                        case 2: return { canvasId : "canvas2", eye: { x : 20, y: 1 }, look :{ y: 1 }, up: { y : 1 } };
                        case 3: return { canvasId : "canvas3", eye: { y : 20 }, up: { z : 1 } };
                        case 4: i = 0;
                    }
                };
            })(),
                    renderer(function(scope) {
                        return {
                            canvasId : scope.get("canvasId"),
                            clearColor : { r:0, g:0, b:0.0, a: 1 },
                            viewport:{ x : 1, y : 1, width: 600, height: 600}  ,
                            clear : { depth : true, color : true}
                        };
                    },

                            shader({ type: 'simple-shader' },

                                    lights({
                                        lights: [
                                            {
                                                pos: { x: 30.0, y: 30.0, z: 30.0 }
                                            }
                                        ]},
                                            perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                            },
                                                    lookAt(function(scope) {
                                                        return {
                                                            eye : scope.get("eye"),
                                                            look : scope.get("look"),
                                                            up : scope.get("up")
                                                        };
                                                    },
                                                            material({
                                                                ambient:  { r:0.2, g:0.2, b:0.5 },
                                                                diffuse:  { r:0.6, g:0.6, b:0.9 }
                                                            },
                                                                    objects.teapot()
                                                                    )
                                                            ) // lookAt
                                                    ) // perspective
                                            ) // lights
                                    ) // shader
                            ) // renderer
                    ) // generator
            ) ; // scene

    try {
        exampleScene.render();
    } catch (e) {
        if (e.message) {
            alert(e.message);
        } else {
            alert(e);
        }
        throw e;
    }

    /* Finished with the scene, so we might as well tell SceneJS to free wharever resources it has allocated for the
     * scene, such as the shader scripts and the vertex buffer objects (VBOs) it created for the teapot geometry.
     */
    exampleScene.destroy();
}
