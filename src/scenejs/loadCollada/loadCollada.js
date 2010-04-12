SceneJS.loadCollada = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    var params = cfg.getParams();
    if (!params.uri) {
        throw new SceneJS.exceptions.NodeConfigExpectedException
                ("Mandatory SceneJS.assets.collada parameter missing: uri");
    }


    var logging = SceneJS._backends.getBackend("logging");

    return SceneJS.load({
        
        uri: params.uri,

        serverParams: {
            format: "xml"
        },

        parser: function(xml, onError) {
            return SceneJS._utils.__ColladaParser.parse(
                    logging.getLogger(),
                    params.uri, // Used in paths to texture images
                    xml,
                    params.node);       // Optional cherry-picked asset in Collada file
        }
    });

};