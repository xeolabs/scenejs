/**
 * @class A scene node that defines vector text.
 * <p>.</p>
 * <p><b>Example Usage</b></p><p>Definition of text:</b></p><pre><code>
 * var c = new SceneJS.Text({
 *          text : "in morning sunlight\nrising steam from the cats yawn\n a smell of salmon"
 *     })
 * </pre></code>
 * @extends SceneJS.Geometry
 * @since Version 0.7.4
 * @constructor
 * Create a new SceneJS.Text
 * @param {Object} [cfg] Static configuration object
 * @param {String} cfg.text The string of text
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
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
        var geo = SceneJS._vectorTextModule.getGeometry(1, 0, 0, params.text); // Unit size
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
 * @param {Object} [cfg] Static configuration object
 * @param {String} cfg.text The string of text
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.Text}
 *  @since Version 0.7.3
 */
SceneJS.text = function() {
    var n = new SceneJS.Text();
    SceneJS.Text.prototype.constructor.apply(n, arguments);
    return n;
};

SceneJS.registerNodeType("text", SceneJS.text);

