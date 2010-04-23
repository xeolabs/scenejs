(function() {

    var errorBackend = SceneJS._backends.getBackend('error');
    var vectorTextBackend = SceneJS._backends.getBackend('vector-text');

    SceneJS.text = function() {

        var cfg = SceneJS._utils.getNodeConfig(arguments || [
            {}
        ]);

        var params = cfg.getParams();

        if (!params.text) {
            errorBackend.fatalError(
                    new SceneJS.exceptions.NodeConfigExpectedException(
                            "SceneJS.vectorText property missing: text"));
        }

        return SceneJS.geometry({

            /* Callback to create geometry
             */
            create: function() {
                var geo = vectorTextBackend.getGeometry(1, 0, 0, params.text); // Unit size
                return {
                    primitive : "lines",
                    positions : geo.positions,
                    normals: [
                  
                    ],
                    uv : [],
                    indices : geo.indices,
                    colors:[]
                };
            }
        });
    };


})();