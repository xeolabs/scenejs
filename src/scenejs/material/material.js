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
 * var l = new SceneJS.Lights({
 *          sources: [
 *              {
 *                  type: "dir",
 *                  color: { r: 1.0, g: 1.0, b: 0.0 },
 *                  diffuse: true,
 *                  specular: true,
 *                  dir: { x: 1.0, y: 2.0, z: 0.0 } // Direction of light from coordinate space origin
 *              }
 *          ]
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
 *          new SceneJS.objects.Cube()
 *     )
 * )
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Material
 * @param {Object} config The config object or function, followed by zero or more child nodes
 *
 */
SceneJS.Material = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "material";
    this._material = {
        baseColor : [ 0.0, 0.0, 0.0 ],
        specularColor: [ 0.0,  0.0,  0.0 ],
        specular : 0,
        shine : 0,
        reflect : 0,
        alpha : 1.0,
        emit : 0.0
    };
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Material, SceneJS.Node);

/**
 * Sets the material base color
 * @function {SceneJS.Material} setBaseColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setBaseColor = function(color) {
    this._material.baseColor = [
        color.r != undefined && color.r != null ? color.r : 0.0,
        color.g != undefined && color.g != null ? color.g : 0.0,
        color.b != undefined && color.b != null ? color.b : 0.0
    ];
    return this;
};

/**
 Returns the base color
 @function {Object} getBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getBaseColor = function() {
    return {
        r: this._material.baseColor[0],
        g: this._material.baseColor[1],
        b: this._material.baseColor[2]
    };
};

/**
 * Sets the material specular
 * @function {SceneJS.Material} setSpecularColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setSpecularColor = function(color) {
    this._material.specularColor = [
        color.r != undefined && color.r != null ? color.r : 0.5,
        color.g != undefined && color.g != null ? color.g : 0.5,
        color.b != undefined && color.b != null ? color.b : 0.5
    ];
    return this;
};

/**
 Returns the specular color
 @function {Object} getSpecularColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getSpecularColor = function() {
    return {
        r: this._material.specularColor[0],
        g: this._material.specularColor[1],
        b: this._material.specularColor[2]
    };
};

/**
 * Sets the specular reflection factor
 * @function {SceneJS.Material} setSpecular
 * @param {float} specular
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setSpecular = function(specular) {
    this._material.specular = specular || 0;
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
    this._material.shine = shine || 0;
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
    this._material.reflect = reflect || 0;
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
    this._material.emit = emit || 0;
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
    this._material.alpha = alpha == undefined ? 1.0 : alpha;
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
SceneJS.Material.prototype._init = function(params) {
    if (params.baseColor) {
        this.setBaseColor(params.baseColor);
    }
    if (params.specularColor) {
        this.setSpecularColor(params.specularColor);
    }
    if (params.specular) {
        this.setSpecular(params.specular);
    }
    if (params.shine) {
        this.setShine(params.shine);
    }
    if (params.reflect) {
        this.setReflect(params.reflect);
    }
    if (params.emit) {
        this.setEmit(params.emit);
    }
    if (params.alpha) {
        this.setAlpha(params.alpha);
    }
};

// @private
SceneJS.Material.prototype._render = function(traversalContext, data) {
    if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        }

        var saveMaterial = SceneJS._materialModule.getMaterial();
        SceneJS._materialModule.setMaterial(this._material);
        this._renderNodes(traversalContext, data);
        SceneJS._materialModule.setMaterial(saveMaterial);
    }
};

/** Factory function that returns a new {@link SceneJS.Material} instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Material constructor
 * @returns {SceneJS.Material}
 */
SceneJS.material = function() {
    var n = new SceneJS.Material();
    SceneJS.Material.prototype.constructor.apply(n, arguments);
    return n;
};

