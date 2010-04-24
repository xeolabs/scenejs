SceneJS.withData({ alpha: 0.4 },

        SceneJS.scalarInterpolator({
            type:"linear",
            input:"alpha",
            output:"angle",
            keys: [0.0, 0.2, 0.5, 0.7, 0.9, 1.0],
            values: [0.0, 0.0, -50.0, -50.0, 0.0, 0.0]
        },

                SceneJS.rotate(function(data) {
                    return { angle : data.get("angle"), y: 1.0 };
                },

                        SceneJS.objects.cube()
                        )
                )
        )