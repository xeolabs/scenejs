SceneJS._utils.ns("SceneJS.assets");

/**
 * Provides a SceneJS.assets.collada node by wrapping a call to the core SceneJS.asset node.
 *
 * As are provided by this node, a asset node takes URIs to the asset file and the proxy that will get it for us.
 */
SceneJS.assets.collada = function() {
    var logging = SceneJS._backends.getBackend("logging");

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of ScejeJS.assets.collada nodes is not supported");
    }

    var params = cfg.getParams();
    if (!params.uri) {
        throw new SceneJS.exceptions.NodeConfigExpectedException
                ("Mandatory SceneJS.assets.collada parameter missing: uri");
    }
    if (!params.proxy) {
        throw new SceneJS.exceptions.NodeConfigExpectedException
                ("Mandatory SceneJS.assets.collada parameter missing: proxy");
    }

    return SceneJS.asset.apply(
            this,
            SceneJS._utils.extendNodeArgs
                    (arguments, {

                        serverParams: {
                            format: "xml"
                        },

                        parser: function(xml, onError) {
                            return SceneJS.assets._ColladaParser.parse(
                                    logging.getLogger(),
                                    params.uri, // Used in paths to texture images
                                    xml,
                                    params.node);     // Optional cherry-picked asset in Collada file
                        }
                    }, true)); // Override params
};
