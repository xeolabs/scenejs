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

    var modes = {
        loadCamera: params.loadCamera,
        loadLights: params.loadLights,
        showBoundingBoxes : params.showBoundingBoxes
    };

    return SceneJS.load({
          bla: params.bla,
        uri: params.uri,

        /* Uniquely ID different assets loaded from different nodes of same COLLADA file
         */
        id: params.node ? (params.uri + ":" + params.node) : params.uri,

        serverParams: {
            format: "xml"
        },

        parser: function(xml, onError) {
            return colladaBackend.parse(
                    params.uri, // Used in paths to texture images
                    xml,
                    params.node, // Optional cherry-picked asset
                    modes
                    );
        }
    });

};