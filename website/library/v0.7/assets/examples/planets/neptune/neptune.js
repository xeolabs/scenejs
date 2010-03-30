SceneJS.renderer({ enableTexture2D: true },
        SceneJS.texture({
            layers: [
                {
                    uri:"http://scenejs.org/library/textures/planets/neptune/neptunemap.jpg",
                    applyTo:"baseColor"
                }
            ]
        },
                SceneJS.objects.sphere({ rings: 30, slices: 30})
                )
        )
