/**
 * @class A scene node that asynchronously loads material definitions from a WaveFront MTL file.
 *
 * @extends SceneJS.Load
 */

SceneJS.LoadMTL = function() {
    SceneJS.Load.apply(this, arguments);
    this._nodeType = "load-mtl";
};

SceneJS._inherit(SceneJS.LoadMTL, SceneJS.Load);

// @private
SceneJS.LoadMTL.prototype._init = function(params) {
    if (!params.uri) {   // Already checked in SceneJS.Load - do it again here for explicit error message
        throw SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                ("SceneJS.LoadMTL parameter expected: uri"));
    }
    SceneJS.Load.prototype._init.call(this, params);
    this._uri = params.uri;
    this._serverParams = {
        format: "xml"
    };
    this._parse = function(text, onError) {
        return SceneJS_mtlParserModule.parse(text);
    };
};


/** Returns a new SceneJS.LoadMTL instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.LoadMTL constructor
 * @returns {SceneJS.LoadMTL}
 */
SceneJS.loadMTL = function() {
    var n = new SceneJS.LoadMTL();
    SceneJS.LoadMTL.prototype.constructor.apply(n, arguments);
    return n;
};
