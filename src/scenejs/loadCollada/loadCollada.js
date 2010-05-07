/**
 * @class A scene node that asynchronously loads its subgraph from a COLLADA file.
 * <p>This node is configured with the location of the COLLADA file, which it can load-cross domain when a proxy is
 * provided. When first visited during scene traversal, it will
 * begin the load and allow traversal to continue at its next sibling node. When on a subsequent visit its subgraph has
 * been loaded, it will then allow traversal to descend into that subgraph to render it.</p>
 * <p>You can monitor loads by registering "process-started" and "process-killed" listeners with SceneJS.onEvent().</p>
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-collada-load-seymour">Seymour Plane</a></li>
 * <li><a target = "other" href="http://bit.ly/scenejs-tron-tank">Tron Tank</a></li>
 * </ul>
 * <p><b>Usage Example</b></p><p>The SceneJS.LoadCollada node shown below loads a target asset cross-domain, from
 * the <node> with ID "propeller" in a Collada file "airplane.dae" stored on a server at "foo.com". The transfer is
 * routed via the JSONP proxy located by the <b>uri</b> property on the SceneJS.Scene node.</b></p>
 * <pre><code>
 * var exampleScene = new SceneJS.Scene({
 *
 *       // JSONP proxy location - needed only for cros-domain load
 *       proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" });
 *
 *       new SceneJS.LoadCollada({
 *                  uri: "http://foo.com/airplane.dae",
 *                  node: "propeller"
 *            })
 *  );
 *  </pre></code>
 *
 * @extends SceneJS.load
 */

SceneJS.LoadCollada = function() {
    SceneJS.Load.apply(this, arguments);
    this._nodeType = "loadCollada";
};

SceneJS._inherit(SceneJS.LoadCollada, SceneJS.Load);

// @private
SceneJS.LoadCollada.prototype._init = function(params) {
    if (!params.uri) {
        SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
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


/** Returns a new SceneJS.LoadCollada instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.LoadCollada constructor
 * @returns {SceneJS.LoadCollada}
 */
SceneJS.loadCollada = function() {
    var n = new SceneJS.LoadCollada();
    SceneJS.LoadCollada.prototype.constructor.apply(n, arguments);
    return n;
};
