SceneJS.renderer({ enableTexture2D: true },
        SceneJS.texture({
            layers: [
                {
                    uri:"http://scenejs.org/library/textures/planets/mars/mars_1k_color.jpg" ,
                    applyTo:"baseColor"
                }
            ]
        },
                SceneJS.objects.sphere({ rings: 30, slices: 30})
                )
        )
