SceneJS.renderer({ enableTexture2D: true },
                SceneJS.texture({
			layers: [{
	                    uri:"http://scenejs.org/library/textures/planets/uranus/uranusmap.jpg"
			}]
                },
                        SceneJS.objects.sphere({ rings: 30, slices: 30})
                        )                
        )
