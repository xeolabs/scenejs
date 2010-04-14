SceneJS.loadCollada = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    var errorBackend = SceneJS._backends.getBackend("error");
    var colladaBackend = SceneJS._backends.getBackend("collada");

    var params = cfg.getParams();
    if (!params.uri) {
        errorBackend.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                ("Mandatory SceneJS.assets.collada parameter missing: uri"));
    }

    return SceneJS.load({

        uri: params.uri,

        serverParams: {
            format: "xml"
        },

        parser: function(xml, onError) {
            return colladaBackend.parse(
                    params.uri, // Used in paths to texture images
                    xml,
                    params.node);   // Optional cherry-picked asset in Collada file
        }
    });

};