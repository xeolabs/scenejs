/**
 * Scene node that defines a string of text.
 *
 * @class SceneJS.text
 * @extends SceneJS.geometry
 */
SceneJS.text = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    var params = cfg.getParams();

    if (!params.text) {
        SceneJS_errorModule.fatalError(
                new SceneJS.exceptions.NodeConfigExpectedException(
                        "SceneJS.text property missing: text"));
    }

    return SceneJS.geometry({

        /* Callback to create geometry
         */
        create: function() {
            var geo = SceneJS_vectorTextModule.getGeometry(1, 0, 0, params.text); // Unit size
            return {
                primitive : "lines",
                positions : geo.positions,
                normals: [],
                uv : [],
                indices : geo.indices,
                colors:[]
            };
        }
    });
};
