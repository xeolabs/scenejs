/**
 @class SceneJS.Locality
 @extends SceneJS.Node
 <p>Defines inner and outer spheres of locality centered about the viewpoint.</p>
 <p>The subgraphs of contained SceneJS.BoundingBox nodes will only be rendered when their SceneJS.BoundingBox intersects
 the inner radius.</p><p>When a SceneJS.BoundingBox intersects the outer radius, its subgraph stages (pre-loads)
 content for when it will be rendered.</p>
 <p>You can have as many of these as neccessary throughout your scene.</p>
 <p><b>Example:</b></p><p>Defining a locality</b></p><pre><code>
 var locality = new SceneJS.Locality({
 inner: 1000,  // Default values, override these where needed
 outer: 2000
 },

 // ... child nodes containing SceneJS.BoundingBox nodes ...
 )
 </pre></code>

 @constructor
 Create a new SceneJS.Locality
 @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Locality = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "locality";
    this._radii = {
        inner : 1000,
        outer : 2000
    };
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._utils.inherit(SceneJS.Locality, SceneJS.Node);

/**
 Sets the inner radius
 @function setInner
 @param {double} inner
 @returns {SceneJS.Locality} this
 */
SceneJS.Locality.prototype.setInner = function(inner) {
    this._radii.inner = inner;
    return this;
};

/**
 Returns the inner radius
 @function {double} getInner
 @returns {double} Inner radius
 */
SceneJS.Locality.prototype.getInner = function() {
    return this._radii.inner;
};

/**
 Sets the outer radius
 @function setOuter
 @param {int} outer
 @returns {SceneJS.Locality} this
 */
SceneJS.Locality.prototype.setOuter = function(outer) {
    this._radii.outer = outer;
    return this;
};

/**
 Returns the outer radius
 @function {double} getOuter
 @returns {double} Outer radius
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
    $._renderNodes(traversalContext, data);
    SceneJS_localityModule.setRadii(prevRadii);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.locality = function() {
    var n = new SceneJS.Locality();
    SceneJS.Locality.prototype.constructor.apply(n, arguments);
    return n;
};
