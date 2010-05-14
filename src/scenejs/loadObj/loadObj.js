/**
 * @class A scene node that asynchronously loads its subgraph from a COLLADA file.
 * <p>This node is configured with the location of the COLLADA file, which it can load-cross domain when the location of
 * a proxy is specified on the SceneJS.Scene node. When first visited during scene traversal, it will begin the load and
 * allow traversal to continue at its next sibling node. When on a subsequent visit its subgraph has been loaded, it
 * will then allow traversal to descend into that subgraph to render it.</p>
 * <p>You can monitor loads by registering "process-started" and "process-killed" listeners with SceneJS.addListener().</p>
 * <p><b>Usage Example</b></p><p>The SceneJS.LoadOBJ node shown below loads an .OBJ file "vacuum-cleaner.dae" stored
 * on a server at "foo.com". The transfer is routed via the JSONP proxy located by the <b>uri</b> property on the
 * SceneJS.Scene node.</b></p>
 * <pre><code>
 * var exampleScene = new SceneJS.Scene({
 *
 *       // JSONP proxy location - needed only for cros-domain load
 *       proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" });
 *
 *       new SceneJS.LoadOBJ({
 *                  uri: "http://foo.com/vacuum-cleaner.dae"
 *            })
 *  );
 *  </pre></code>
 *
 * @extends SceneJS.load
 */

SceneJS.LoadOBJ = function() {
    SceneJS.Load.apply(this, arguments);
    this._nodeType = "load-obj";
};

SceneJS._inherit(SceneJS.LoadOBJ, SceneJS.Load);

// @private
SceneJS.LoadOBJ.prototype._init = function(params) {
    if (!params.uri) {   // Already checked in SceneJS.Load - do it again here for explicit error message
        SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                ("SceneJS.LoadOBJ parameter expected: uri"));
    }
    SceneJS.Load.prototype._init.call(this, params);
    this._uri = params.uri;
    this._serverParams = {
        format: "xml"
    };
    this._parser = function(text, onError) {
        return SceneJS_objParserModule.parse(text);
    };
};


/** Returns a new SceneJS.LoadOBJ instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.LoadOBJ constructor
 * @returns {SceneJS.LoadOBJ}
 */
SceneJS.loadOBJ = function() {
    var n = new SceneJS.LoadOBJ();
    SceneJS.LoadOBJ.prototype.constructor.apply(n, arguments);
    return n;
};
