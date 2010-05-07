var scene = new SceneJS.Scene(
        { /* ... */
        },

        new SceneJS.symbol({
                    name: "theScene"
                },

            new SceneJS.objects.Teapot()
        ),

        new SceneJS.Selector(
                function(data) {
                    return {
                        selection: [data.get("activeCamera")]
                    };
                },

            new SceneJS.LookAt({
                    eye : { z: 10.0 }
                 },
                 new SceneJS.Instance({ name: "theScene"})),

            new SceneJS.LookAt({
                    eye : { x: 10.0 }
                 },
                 new SceneJS.Instance({ name: "theScene"})),

            new SceneJS.LookAt({
                    eye : { x: -5.0, y: 5, z: 5 }
                 },
                 new SceneJS.Instance({ name: "theScene" })
            )
        )
    );

scene.render({ activeCamera: 0 });