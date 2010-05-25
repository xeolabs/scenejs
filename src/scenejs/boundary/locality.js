/**
 *@class A scene node that defines inner and outer spheres of locality centered about the viewpoint.
 *<p>The subgraphs of contained {@link SceneJS.BoundingBox} nodes will only be rendered when their boundaries intersect
 *the inner radius.</p><p>The outer radius is used internally by SceneJS to support content staging strategies.</p>
 *<p>You can have as many of these as neccessary throughout your scene.</p>
 * <p>When you don't specify a Locality node, SceneJS has default inner and outer radii of 100000
 * and 200000, respectively.</p>
 *<p><b>Example:</b></p><p>Defining a locality</b></p><pre><code>
 *  var locality = new SceneJS.Locality({
 *      inner: 100000,  // Default node values, override these where needed
 *      outer: 200000
 *      },
 *
 *      // ... child nodes containing SceneJS.BoundingBox nodes ...
 *  )
 *</pre></code>
 * @extends SceneJS.Node
 * @since Version 0.7.3
 * @constructor
 * Create a new SceneJS.Locality
 * @param {Object} [cfg] Static configuration object
 * @param {double} [cfg.inner = 100000] Inner radius
 * @param {double} [cfg.outer = 200000] Outer radius
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Locality = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "locality";
    this._radii = {
        inner : 100000,
        outer : 200000
    };
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Locality, SceneJS.Node);

/**
 Sets the inner radius
 @function setInner
 @param {double} inner
 @returns {SceneJS.Locality} this
 @since Version 0.7.4
 */
SceneJS.Locality.prototype.setInner = function(inner) {
    this._radii.inner = inner;
    return this;
};

/**
 Returns the inner radius
 @function {double} getInner
 @returns {double} Inner radius
 @since Version 0.7.4
 */
SceneJS.Locality.prototype.getInner = function() {
    return this._radii.inner;
};

/**
 Sets the outer radius
 @function setOuter
 @param {double} outer
 @returns {SceneJS.Locality} this
 @since Version 0.7.4
 */
SceneJS.Locality.prototype.setOuter = function(outer) {
    this._radii.outer = outer;
    return this;
};

/**
 Returns the outer radius
 @function {double} getOuter
 @returns {double} Outer radius
 @since Version 0.7.4
 */
SceneJS.Locality.prototype.getOuter = function() {
    return this._radii.outer;
};

// @private
SceneJS.Locality.prototype._init = function(params) {
    if (params.inner) {
        this.setInner(params.inner);
    }
    if (params.outer) {
        this.setOuter(params.outer);
    }
};

// @private
SceneJS.Locality.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    var prevRadii = SceneJS_localityModule.getRadii();
    SceneJS_localityModule.setRadii(this._radii);
    this._renderNodes(traversalContext, data);
    SceneJS_localityModule.setRadii(prevRadii);
};

/** Returns a new SceneJS.Locality instance
 * @param {Object} [cfg] Static configuration object
 * @param {double} [cfg.inner = 100000] Inner radius
 * @param {double} [cfg.outer = 200000] Outer radius
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.Locality}
 * @since Version 0.7.3
 */
SceneJS.locality = function() {
    var n = new SceneJS.Locality();
    SceneJS.Locality.prototype.constructor.apply(n, arguments);
    return n;
};
