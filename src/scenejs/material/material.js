/**
 * @class A scene node that defines how light is reflected by the geometry within its subgraph.
 * <p> These may be defined anywhere within a scene graph and may be nested. When nested, the properties on an inner material
 * node will override those on outer material nodes for the inner node's subgraph. These nodes are to be defined either
 * above or below {@link SceneJS.Lights} nodes, which provide light for geometry to reflect.</p>
 * <p><b>Default Material</b></p>
 * <p>When you have not specified any SceneJS.Material nodes in your scene, then SceneJS will apply these default
 * material properties in order to make your geometry visible until you do:</p>
 * <table>
 * <tr><td>baseColor</td><td>{ r: 1.0, g: 1.0, b: 1.0 }</td></tr>
 * <tr><td>specularColor</td><td>{ r: 1.0, g: 1.0, b: 1.0 }</td></tr>
 * <tr><td>specular</td><td>0</td></tr>
 * <tr><td>shine</td><td>0</td></tr>
 * <tr><td>reflect</td><td>0</td></tr>
 * <tr><td>alpha</td><td>1.0</td></tr>
 * <tr><td>emit</td><td>1.0</td></tr>
 * </table>
 * <p><b>Usage Example</b></p><p>A cube illuminated by a directional light source and wrapped
 * with material properties that define how it reflects the light.</b></p><pre><code>
 * var l = new SceneJS.Light({
 *              type: "dir",
 *              color: { r: 1.0, g: 1.0, b: 0.0 },
 *              diffuse: true,
 *              specular: true,
 *              dir: { x: 1.0, y: 2.0, z: 0.0 } // Direction of light from coordinate space origin
 *      },
 *
 *      new SceneJS.Material({
 *              baseColor:               { r: 0.6, g: 0.2, b: 0.2 },
 *              specularColor:           { r: 0.9, g: 0.9, b: 0.2 },
 *              emit:                     0.0,
 *              specular:                 0.9,
 *              shine:                    6.0
 *          },
 *
 *          new SceneJS.Cube()
 *     )
 * )
 * </pre></code>
 * <p><b>Highlighting</b></p>
 * You can also specify a color for the material to highlight with, when a higher {@link SceneJS.Highlight} node
 * current enables highlighting. The cube below will be rendered bright red:
 * <pre><code>
 * new SceneJS.Highlight{ highlight: true },
 *      new SceneJS.Material({
 *              baseColor:               { r: 0.6, g: 0.2, b: 0.2 },
 *              highlightBaseColor:      { r: 1.0, g: 0.2, b: 0.2 }, // Optional highlight color
 *              specularColor:           { r: 0.9, g: 0.9, b: 0.2 },
 *              emit:                     0.0,
 *              specular:                 0.9,
 *              shine:                    6.0
 *          },
 *
 *          new SceneJS.Cube()))
 * </code></pre>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Material
 * @param {Object} config The config object or function, followed by zero or more child nodes
 *
 */
SceneJS.Material = SceneJS.createNodeType("material");

// @private
SceneJS.Material.prototype._init = function(params) {
    this._nodeType = "material";
    this._material = {};
    this.setBaseColor(params.baseColor);
    this.setHighlightBaseColor(params.highlightBaseColor);
    this.setSpecularColor(params.specularColor);
    this.setSpecular(params.specular);
    this.setShine(params.shine);
    this.setReflect(params.reflect);
    this.setEmit(params.emit);
    this.setAlpha(params.alpha);
    this.setOpacity(params.opacity);
};

/**
 * Sets the material base color
 * @function {SceneJS.Material} setBaseColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setBaseColor = function(color) {
    this._material.baseColor = color ? {
        r: color.r != undefined && color.r != null ? color.r : 0.0,
        g: color.g != undefined && color.g != null ? color.g : 0.0,
        b: color.b != undefined && color.b != null ? color.b : 0.0
    } : null;
    this._setDirty();
    return this;
};

/**
 Returns the base color
 @function {Object} getBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getBaseColor = function() {
    return this._material.baseColor ? {
        r: this._material.baseColor.r,
        g: this._material.baseColor.g,
        b: this._material.baseColor.b
    } : null;
};

/**
 * Sets the material base color for when highlighted
 * @function {SceneJS.Material} setHighlightBaseColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setHighlightBaseColor = function(color) {
    this._material.highlightBaseColor = color ? {
        r: color.r != undefined && color.r != null ? color.r : 0.0,
        g: color.g != undefined && color.g != null ? color.g : 0.0,
        b: color.b != undefined && color.b != null ? color.b : 0.0
    } : null;
    this._setDirty();
    return this;
};

/**
 Returns the highlight base color
 @function {Object} getHighlightBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getHighlightBaseColor = function() {
    return this._material.highlightBaseColor ? {
        r: this._material.highlightBaseColor.r,
        g: this._material.highlightBaseColor.g,
        b: this._material.highlightBaseColor.b
    } : null;
};

/**
 * Sets the material specular
 * @function {SceneJS.Material} setSpecularColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setSpecularColor = function(color) {
    this._material.specularColor = color ? {
        r: color.r != undefined && color.r != null ? color.r : 0.5,
        g: color.g != undefined && color.g != null ? color.g : 0.5,
        b: color.b != undefined && color.b != null ? color.b : 0.5
    } : null;
    this._setDirty();
    return this;
};


/**
 Returns the base color
 @function {Object} getBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getBaseColor = function() {
    return this._material.baseColor ? {
        r: this._material.baseColor.r,
        g: this._material.baseColor.g,
        b: this._material.baseColor.b
    } : null;
};


/**
 Returns the specular color
 @function {Object} getSpecularColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getSpecularColor = function() {
    return this._material.specularColor ? {
        r: this._material.specularColor.r,
        g: this._material.specularColor.g,
        b: this._material.specularColor.b
    } : null;
};

/**
 * Sets the specular reflection factor
 * @function {SceneJS.Material} setSpecular
 * @param {float} specular
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setSpecular = function(specular) {
    this._specular = specular;
    this._setDirty();
    return this;
};

/**
 Returns the specular reflection factor
 @function {float} getSpecular
 @returns {float}
 */
SceneJS.Material.prototype.getSpecular = function() {
    return this._material.specular;
};

/**
 * Sets the shininess factor
 * @function {SceneJS.Material} setShine
 * @param {float} shine
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setShine = function(shine) {
    this._material.shine = shine;
    this._setDirty();
    return this;
};

/**
 Returns the shininess factor
 @function {float} getShine
 @returns {float}
 */
SceneJS.Material.prototype.getShine = function() {
    return this._material.shine;
};

/**
 * Sets the reflectivity factor
 * @function {SceneJS.Material} setReflect
 * @param {float} reflect
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setReflect = function(reflect) {
    this._material.reflect = reflect;
    this._setDirty();
    return this;
};

/**
 Returns the reflectivity factor
 @function {float} getReflect
 @returns {float}
 */
SceneJS.Material.prototype.getReflect = function() {
    return this._material.reflect;
};

/**
 * Sets the emission factor
 * @function {SceneJS.Material} setEmit
 * @param {float} emit
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setEmit = function(emit) {
    this._material.emit = emit;
    this._setDirty();
    return this;
};

/**
 Returns the emission factor
 @function {float} getEmit
 @returns {float}
 */
SceneJS.Material.prototype.getEmit = function() {
    return this._material.emit;
};

/**
 * Sets the amount of alpha
 * @function {SceneJS.Material} setAlpha
 * @param {float} alpha
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setAlpha = function(alpha) {
    this._material.alpha = alpha;
    this._setDirty();
    return this;
};

/**
 Returns the amount of alpha
 @function {float} getAlpha
 @returns {float}
 */
SceneJS.Material.prototype.getAlpha = function() {
    return this._material.alpha;
};

/**
 * Sets the opacity factor
 * @function {SceneJS.Material} setOpacity
 * @param {float} opacity
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setOpacity = function(opacity) {
    this._material.opacity = opacity;
    this._setDirty();
    return this;
};

/**
 Returns the amount of alpha
 @function {float} getAlpha
 @returns {float}
 */
SceneJS.Material.prototype.getAlpha = function() {
    return this._material.alpha;
};


// @private
SceneJS.Material.prototype._render = function(traversalContext) {
    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext);  // no need for materials when picking
    } else {
        SceneJS._materialModule.pushMaterial(this._material);
        this._renderNodes(traversalContext);
        SceneJS._materialModule.popMaterial();
    }
};
