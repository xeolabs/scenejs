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
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Text = SceneJS.createNodeType("text", "geometry");

// @private
SceneJS.Text.prototype._init = function(params) {

    /* Callback that creates the text geometry
     */
    this._create = function() {
        var geo = SceneJS._vectorTextModule.getGeometry(1, 0, 0, params.text); // Unit size
        return {
            resource: this._id, // Assuming text geometry varies a lot - don't try to share VBOs
            primitive : "lines",
            positions : geo.positions,
            normals: [],
            uv : [],
            indices : geo.indices,
            colors:[]
        };
    };
};