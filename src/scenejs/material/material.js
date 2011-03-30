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
 *              shine:                    6.0,
 *              alpha: 1.0
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
 */
SceneJS.Material.prototype.setBaseColor = function(color) {
    this._attr.baseColor = color ? {
        r: color.r != undefined && color.r != null ? color.r : 0.0,
        g: color.g != undefined && color.g != null ? color.g : 0.0,
        b: color.b != undefined && color.b != null ? color.b : 0.0
    } : null;
};

/**
 Returns the base color
 @function {Object} getBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getBaseColor = function() {
    return this._attr.baseColor ? {
        r: this._attr.baseColor.r,
        g: this._attr.baseColor.g,
        b: this._attr.baseColor.b
    } : null;
};

/**
 * Sets the material base color for when highlighted
 * @function {SceneJS.Material} setHighlightBaseColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.setHighlightBaseColor = function(color) {
    this._attr.highlightBaseColor = color ? {
        r: color.r != undefined && color.r != null ? color.r : 0.0,
        g: color.g != undefined && color.g != null ? color.g : 0.0,
        b: color.b != undefined && color.b != null ? color.b : 0.0
    } : null;
};

/**
 Returns the highlight base color
 @function {Object} getHighlightBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getHighlightBaseColor = function() {
    return this._attr.highlightBaseColor ? {
        r: this._attr.highlightBaseColor.r,
        g: this._attr.highlightBaseColor.g,
        b: this._attr.highlightBaseColor.b
    } : null;
};

/**
 * Sets the material specular
 * @function {SceneJS.Material} setSpecularColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.setSpecularColor = function(color) {
    this._attr.specularColor = color ? {
        r: color.r != undefined && color.r != null ? color.r : 0.0,
        g: color.g != undefined && color.g != null ? color.g : 0.0,
        b: color.b != undefined && color.b != null ? color.b : 0.0
    } : null;
};


/**
 Returns the base color
 @function {Object} getBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getBaseColor = function() {
    return this._attr.baseColor ? {
        r: this._attr.baseColor.r,
        g: this._attr.baseColor.g,
        b: this._attr.baseColor.b
    } : null;
};


/**
 Returns the specular color
 @function {Object} getSpecularColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getSpecularColor = function() {
    return this._attr.specularColor ? {
        r: this._attr.specularColor.r,
        g: this._attr.specularColor.g,
        b: this._attr.specularColor.b
    } : null;
};

/**
 * Sets the specular reflection factor
 * @function {SceneJS.Material} setSpecular
 * @param {float} specular
 */
SceneJS.Material.prototype.setSpecular = function(specular) {
    this._attr.specular = specular;
};

/**
 Returns the specular reflection factor
 @function {float} getSpecular
 @returns {float}
 */
SceneJS.Material.prototype.getSpecular = function() {
    return this._attr.specular;
};

/**
 * Sets the shininess factor
 * @function {SceneJS.Material} setShine
 * @param {float} shine
 */
SceneJS.Material.prototype.setShine = function(shine) {
    this._attr.shine = shine;
};

/**
 Returns the shininess factor
 @function {float} getShine
 @returns {float}
 */
SceneJS.Material.prototype.getShine = function() {
    return this._attr.shine;
};

/**
 * Sets the reflectivity factor
 * @function {SceneJS.Material} setReflect
 * @param {float} reflect
 */
SceneJS.Material.prototype.setReflect = function(reflect) {
    this._attr.reflect = reflect;
};

/**
 Returns the reflectivity factor
 @function {float} getReflect
 @returns {float}
 */
SceneJS.Material.prototype.getReflect = function() {
    return this._attr.reflect;
};

/**
 * Sets the emission factor
 * @function {SceneJS.Material} setEmit
 * @param {float} emit
 */
SceneJS.Material.prototype.setEmit = function(emit) {
    this._attr.emit = emit;
};

/**
 Returns the emission factor
 @function {float} getEmit
 @returns {float}
 */
SceneJS.Material.prototype.getEmit = function() {
    return this._attr.emit;
};

/**
 * Sets the amount of alpha
 * @function {SceneJS.Material} setAlpha
 * @param {float} alpha
 */
SceneJS.Material.prototype.setAlpha = function(alpha) {
    this._attr.alpha = alpha;
};

/**
 Returns the amount of alpha
 @function {float} getAlpha
 @returns {float}
 */
SceneJS.Material.prototype.getAlpha = function() {
    return this._attr.alpha;
};

/**
 * Sets the opacity factor
 * @function {SceneJS.Material} setOpacity
 * @param {float} opacity
 */
SceneJS.Material.prototype.setOpacity = function(opacity) {
    this._attr.opacity = opacity;
};

/**
 Returns the opacity factor
 @function {float} getOpacity
 @returns {float}
 */
SceneJS.Material.prototype.getOpacity = function() {
    return this._attr.opacity;
};

// @private
SceneJS.Material.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.Material.prototype._preCompile = function(traversalContext) {
    SceneJS._materialModule.pushMaterial(this._attr.id, this._attr);
};

// @private
SceneJS.Material.prototype._postCompile = function(traversalContext) {
    SceneJS._materialModule.popMaterial();
};