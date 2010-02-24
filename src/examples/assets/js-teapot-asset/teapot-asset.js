assetDef(SceneJS.material({
    ambient:  { r:0.5, g:0.2, b:0.2 },
    diffuse:  { r:0.6, g:0.3, b:0.2 }
},
        SceneJS.rotate(function(scope) {
            return { angle : scope.get("angle"), y: 1.0 };
        },
                SceneJS.objects.teapot()
                )
        ))
