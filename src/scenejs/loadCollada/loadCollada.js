/**
 * Scene node that asynchronously loads its subgraph, cross-domain from a COLLADA file. This node is configured with the
 * location of the COLLADA file. When first visited during scene traversal, it will begin the load and allow traversal
 * to cintinue at its next sibling node. When on a subsequent visit its subgraph has been loaded, it will then allow
 * traversal to descend into that subgraph to render it.
 *
 * @class SceneJS.load
 * @extends SceneJS.load
 */

SceneJS.LoadCollada = function() {
    SceneJS.Load.apply(this, arguments);
    this._nodeType = "loadCollada";
};

SceneJS._utils.inherit(SceneJS.LoadCollada, SceneJS.Load);

// @private
SceneJS.LoadCollada.prototype._init = function(params) {
    if (!params.uri) {
        SceneJS_errorModule.fatalError(new SceneJS.exceptions.NodeConfigExpectedException
                ("SceneJS.LoadCollada parameter expected: uri"));
    }
    this._uri = params.uri;
    this._serverParams = {
        format: "xml"
    };
    var modes = {
        loadCamera: params.loadCamera,
        loadLights: params.loadLights,
        showBoundingBoxes : params.showBoundingBoxes
    };
    this._parser = function(xml, onError) {
        return SceneJS_colladaParserModule.parse(
                params.uri, // Used in paths to texture images
                xml,
                params.node, // Optional cherry-picked asset
                modes
                );
    };
};


/** Function wrapper to support functional scene definition
 */
SceneJS.loadCollada = function() {
    var n = new SceneJS.LoadCollada();
    SceneJS.LoadCollada.prototype.constructor.apply(n, arguments);
    return n;
};
