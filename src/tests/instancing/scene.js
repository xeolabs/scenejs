/** Four teapots of various colours
 *
 */
with (SceneJS) {

    var scene = graph(
            utils.arrayOf(
                    scalarInterpolator({
                        type: 'cubic',
                        key : function(data) {
                            data.get('key');
                        },
                        keys: [0.0, 0.4, 1.0], // taken from time on scene context by default
                        vals: [0.0, 45.0, 180.0],
                        apply: function(data, val) {
                            data.put('doodah', val);
                        }
                    },
                            utils.arrayOf(
                                    lookAt(function (data) {
                                        return {
                                            eye : { x: 6.0, y: 6.0, z: -8.0 },
                                            up : { y: data.get('doodah') }};
                                    })
                                    )
                            )
                    )
            ); // frontend

    scene.render();
}

