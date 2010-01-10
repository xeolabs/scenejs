assetDef(SceneJs.material({
    ambient:  { r:0.9, g:0.2, b:0.2 },
    diffuse:  { r:0.9, g:0.6, b:0.2 }
},
        SceneJs.rotate(function(scope) {
            return { angle : scope.get("angle"), y: 1.0 };
        },
                SceneJs.objects.teapot()
                )
        ))
