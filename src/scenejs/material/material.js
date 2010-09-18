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
 *              baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *              specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *              emit:           0.0,
 *              specular:       0.9,
 *              shine:          6.0
 *          },
 *
 *          new SceneJS.Cube()
 *     )
 * )
 * </pre></code>
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
    this.setBaseColor(params.baseColor);
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
    color = color || {};
    this._baseColor = {
        r: color.r != undefined && color.r != null ? color.r : 0.0,
        g: color.g != undefined && color.g != null ? color.g : 0.0,
        b: color.b != undefined && color.b != null ? color.b : 0.0
    };
    this._setDirty();
    return this;
};

/**
 Returns the base color
 @function {Object} getBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getBaseColor = function() {
    return {
        r: this._baseColor.r,
        g: this._baseColor.g,
        b: this._baseColor.b
    };
};

/**
 * Sets the material specular
 * @function {SceneJS.Material} setSpecularColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setSpecularColor = function(color) {
    color = color || {};
    this._specularColor = {
        r: color.r != undefined && color.r != null ? color.r : 0.5,
        g: color.g != undefined && color.g != null ? color.g : 0.5,
        b: color.b != undefined && color.b != null ? color.b : 0.5
    };
    this._setDirty();
    return this;
};

/**
 Returns the specular color
 @function {Object} getSpecularColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getSpecularColor = function() {
    return {
        r: this._specularColor.r,
        g: this._specularColor.g,
        b: this._specularColor.b
    };
};

/**
 * Sets the specular reflection factor
 * @function {SceneJS.Material} setSpecular
 * @param {float} specular
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setSpecular = function(specular) {
    this._specular = specular || 0;
    this._setDirty();
    return this;
};

/**
 Returns the specular reflection factor
 @function {float} getSpecular
 @returns {float}
 */
SceneJS.Material.prototype.getSpecular = function() {
    return this._specular;
};

/**
 * Sets the shininess factor
 * @function {SceneJS.Material} setShine
 * @param {float} shine
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setShine = function(shine) {
    this._shine = shine || 0;
    this._setDirty();
    return this;
};

/**
 Returns the shininess factor
 @function {float} getShine
 @returns {float}
 */
SceneJS.Material.prototype.getShine = function() {
    return this._shine;
};

/**
 * Sets the reflectivity factor
 * @function {SceneJS.Material} setReflect
 * @param {float} reflect
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setReflect = function(reflect) {
    this._reflect = reflect || 0;
    this._setDirty();
    return this;
};

/**
 Returns the reflectivity factor
 @function {float} getReflect
 @returns {float}
 */
SceneJS.Material.prototype.getReflect = function() {
    return this._reflect;
};

/**
 * Sets the emission factor
 * @function {SceneJS.Material} setEmit
 * @param {float} emit
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setEmit = function(emit) {
    this._emit = emit || 0;
    this._setDirty();
    return this;
};

/**
 Returns the emission factor
 @function {float} getEmit
 @returns {float}
 */
SceneJS.Material.prototype.getEmit = function() {
    return this._emit;
};

/**
 * Sets the amount of alpha
 * @function {SceneJS.Material} setAlpha
 * @param {float} alpha
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setAlpha = function(alpha) {
    this._alpha = alpha == undefined ? 1.0 : alpha;
    this._setDirty();
    return this;
};

/**
 Returns the amount of alpha
 @function {float} getAlpha
 @returns {float}
 */
SceneJS.Material.prototype.getAlpha = function() {
    return this._alpha;
};

/**
 * Sets the opacity factor
 * @function {SceneJS.Material} setOpacity
 * @param {float} opacity
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setOpacity = function(opacity) {
    this._opacity = opacity == undefined ? 1.0 : opacity;
    this._setDirty();
    return this;
};

/**
 Returns the amount of alpha
 @function {float} getAlpha
 @returns {float}
 */
SceneJS.Material.prototype.getAlpha = function() {
    return this._alpha;
};


// @private
SceneJS.Material.prototype._render = function(traversalContext) {
    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {

        /* No need for materials in a picking traversal
         */
        this._renderNodes(traversalContext);
    } else {
        var saveMaterial = SceneJS._materialModule.getMaterial();

        /* Set a copy because it will be retained for state sorting
         */
        SceneJS._materialModule.setMaterial({
            baseColor : [ this._baseColor.r, this._baseColor.g, this._baseColor.b ],
            specularColor: [ this._specularColor.r, this._specularColor.g, this._specularColor.b ],
            specular : this._specular,
            shine : this._shine,
            reflect : this._reflect,
            alpha : this._alpha,
            emit : this._emit
        });
        this._renderNodes(traversalContext);
        SceneJS._materialModule.setMaterial(saveMaterial);
    }
};
