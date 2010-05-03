/**
 * @class A scene node that defines vector text.
 * <p>.</p>
 * <p><b>Example Usage</b></p><p>Definition of text:</b></p><pre><code>
 * var c = new SceneJS.Text({
 *          text : "in morning sunlight\nrising steam from the cats yawn\n a smell of salmon"
 *     })
 * </pre></code>
 * @extends SceneJS.Geometry
 * @constructor
 * Create a new SceneJS.Text
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Text = function() {
    SceneJS.Geometry.apply(this, arguments);
    this._nodeType = "text";
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Text, SceneJS.Geometry);

// @private
SceneJS.Text.prototype._init = function(params) {

    /* Callback that creates the text geometry
     */
    this._create = function() {
        var geo = SceneJS_vectorTextModule.getGeometry(1, 0, 0, params.text); // Unit size
        return {
            primitive : "lines",
            positions : geo.positions,
            normals: [],
            uv : [],
            indices : geo.indices,
            colors:[]
        };
    };
};

/** Returns a new SceneJS.Text instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Text constructor
 * @returns {SceneJS.Text}
 */
SceneJS.text = function() {
    var n = new SceneJS.Text();
    SceneJS.Text.prototype.constructor.apply(n, arguments);
    return n;
};
