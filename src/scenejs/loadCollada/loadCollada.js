/**
 * Scene node that asynchronously loads its subgraph, cross-domain from a COLLADA file. This node is configured with the
 * location of the COLLADA file. When first visited during scene traversal, it will begin the load and allow traversal
 * to cintinue at its next sibling node. When on a subsequent visit its subgraph has been loaded, it will then allow
 * traversal to descend into that subgraph to render it.
 *
 * @class SceneJS.load
 * @extends SceneJS.load
 */

SceneJS.loadCollada = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    var params = cfg.getParams();
    if (!params.uri) {
        SceneJS_errorModule.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                ("Mandatory SceneJS.assets.collada parameter missing: uri"));
    }

    var modes = {
        loadCamera: params.loadCamera,
        loadLights: params.loadLights,
        showBoundingBoxes : params.showBoundingBoxes
    };

    return SceneJS.load({
        uri: params.uri,

        /* Uniquely ID different assets loaded from different nodes of same COLLADA file
         */
        id: params.node ? (params.uri + ":" + params.node) : params.uri,

        serverParams: {
            format: "xml"
        },

        parser: function(xml, onError) {
            return SceneJS_colladaParserModule.parse(
                    params.uri, // Used in paths to texture images
                    xml,
                    params.node, // Optional cherry-picked asset
                    modes
                    );
        }
    });

};