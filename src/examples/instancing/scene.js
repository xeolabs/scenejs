/** Four teapots of various colours
 *
 */
with (SceneJS) {

    var scene = graph(
            utils.arrayOf(
                    scalarInterpolator({
                        type: 'cubic',
                        key : function(scope) {
                            scope.get('key');
                        },
                        keys: [0.0, 0.4, 1.0], // taken from time on scene context by default
                        vals: [0.0, 45.0, 180.0],
                        apply: function(scope, val) {
                            scope.put('doodah', val);
                        }
                    },
                            utils.arrayOf(
                                    lookAt(function (scope) {
                                        return {
                                            eye : { x: 6.0, y: 6.0, z: -8.0 },
                                            up : { y: scope.get('doodah') }};
                                    })
                                    )
                            )
                    )
            ); // frontend

    scene.render();
}

