SceneJS.renderer({ enableTexture2D: true },
                SceneJS.texture({
                    layers: [
                        {
  	                   uri:"http://scenejs.org/library/textures/planets/earth/earthmap1k.jpg" ,
			   applyTo:"diffuse"	                
  	                },
			{
  	                   uri:"http://scenejs.org/library/textures/planets/earth/earthmap1k.jpg" ,
			   applyTo:"specular"	                
  	                }
                     ] 
		},
                        SceneJS.objects.sphere({ rings: 30, slices: 30})
                        )
        )
