/**
 * @class A scene node that defines a light source.
 * <p>Multiple instances of this  node may appear at any location in a scene graph, to define multiple sources of
 * light, the number of which is only limited by video memory.</p>
 * <p>note that SceneJS does not create any default light sources for you, so if you have non-emissive
 * {@link SceneJS.Material}s with no lights you may not see anything in your scene until you add a light.</p>
 * <p>Currently, two modes of light are supported: point and directional. Point lights have a location, like a lightbulb,
 * while directional only have a vector that describes their direction, where they have no actual location since they
 * are an infinite distance away.</p>
 * <p>Therefore, each of these two light modes have slightly different properties, as shown in the usage example below.</p>

 * <p><b>Example Usage</b></p><p>This example defines a cube that is illuminated by two light sources, point and directional.
 * The cube has a {@link SceneJS.Material} that define how it reflects the light.</b></p><pre><code>
 *  var l = new SceneJS.Node(
 *
 *         new SceneJS.Light({
 *              mode: "point",
 *              pos: { x: 100.0, y: 30.0, z: -100.0 }, // Position
 *              color: { r: 0.0, g: 1.0, b: 1.0 },
 *              diffuse: true,   // Contribute to diffuse lighting
 *              specular: true,  // Contribute to specular lighting
 *
 *              // Since this light source has a position, it therefore has
 *              // a distance over which its intensity can attenuate.
 *              // Consult any OpenGL book for how to use these factors.
 *
 *              constantAttenuation: 1.0,
 *              quadraticAttenuation: 0.0,
 *              linearAttenuation: 0.0
 *         }),
 *
 *         new SceneJS.Light({
 *              mode: "dir",
 *              color: { r: 1.0, g: 1.0, b: 0.0 },
 *              diffuse: true,
 *              specular: true,
 *              dir: { x: 1.0, y: 2.0, z: 0.0 } // Direction - default is { x: 0, y: 0, z: -1 }
 *         }),
 *
 *         new SceneJS.material({
 *              baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *              specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *              emit:           0.0,
 *              specular:       0.9,
 *              shine:          6.0
 *          },
 *
 *          new SceneJS.cube()))
 *</pre></code>
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Light
 * @param {Object} [cfg] Static configuration object (see class overview comments)
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */

SceneJS.Light = SceneJS.createNodeType("light");

// @private
SceneJS.Light.prototype._init = function(params) {
    params = params || {};
    this._light = {};
    this.setMode(params.mode);
    this.setColor(params.color);
    this.setDiffuse(params.diffuse);
    this.setSpecular(params.specular);
    this.setPos(params.pos);
    this.setDir(params.dir);
    this.setConstantAttenuation(params.constantAttenuation);
    this.setLinearAttenuation(params.linearAttenuation);
    this.setQuadraticAttenuation(params.quadraticAttenuation);
};

/** Sets the lighting mode - eg. "dir" or "point"
 * @param {String} mode Lighting mode - "dir" or "point"
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setMode = function(mode) {
    mode = mode || "dir";
    if (mode != "dir" && mode != "point") {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "SceneJS.Light unsupported mode - should be 'dir' or 'point' or 'ambient'"));
    }
    this._light.mode = mode;
    return this;
};

/** Gets the lighting mode - eg. "dir" or "point"
 * @return {String} Light source mode - "dir" or "point"
 */
SceneJS.Light.prototype.getMode = function() {
    return this._light.mode;
};

/** Sets the light source color
 *
 * @param color {Object} - Eg. {r: 1.0, g: 1.0, b: 1.0 }
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setColor = function(color) {
    color = color || {};
    this._light.color = [
        color.r != undefined ? color.r : 1.0,
        color.g != undefined ? color.g : 1.0,
        color.b != undefined ? color.b : 1.0
    ];
    return this;
};

/** Gets the light source color
 * @return {Object} Eg. {r: 1.0, g: 1.0, b: 1.0 }
 */
SceneJS.Light.prototype.getColor = function() {
    return {
        r: this._light.color[0],
        g: this._light.color[1],
        b: this._light.color[2] };
};

/** Sets whether the light source contributes to diffuse lighting or not
 *
 * @param diffuse {boolean}
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setDiffuse = function (diffuse) {
    this._light.diffuse = (diffuse != undefined) ? diffuse : true;
    return this;
};

/** Gets whether the light source contributes to diffuse lighting or not
 *
 * @return {boolean}
 */
SceneJS.Light.prototype.getDiffuse = function() {
    return this._light.diffuse;
};

/** Sets whether the light source contributes to specular lighting or not
 *
 * @param specular {boolean}
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setSpecular = function (specular) {
    this._light.specular = specular || false;
    return this;
};

/** Gets whether the light source contributes to specular lighting or not
 *
 * @return {boolean}
 */
SceneJS.Light.prototype.getSpecular = function() {
    return this._light.specular;
};

/** Sets the light source object-space position.
 * This is only used when the source is of mode "point".
 *
 * @param pos {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setPos = function(pos) {
    pos = pos || {};
    this._light.pos = [ pos.x || 0.0, pos.y || 0.0, pos.z || 0.0 ];
    return this;
};

/** Gets the light source object-space position
 *
 * @return {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 */
SceneJS.Light.prototype.getPos = function() {
    return { x: this._light.pos[0], y: this._light.pos[1], z: this._light.pos[2] };
};

/** Sets the light source object-space direction vector.
 * This is only used when the source is of mode "dir".
 * Components will fall back on defaults of { x: 0, y: 0, z: -1 } where not supplied;
 * <pre><code>
 * myLight.setDir({  });       // Sets direction of { x : 0.0, y: 0.0, z: -1.0 }
 * myLight.setDir({ y: 2.0 }); // Sets direction of { x : 0.0, y: 2.0, z: -1.0 }
 * </pre></code>
 *
 * @param dir {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setDir = function(dir) {
    dir = dir || {};
    this._light.dir = [ dir.x || 0.0, dir.y || 0.0, (dir.z == undefined || dir.z == null) ? -1 : dir.z ];
    return this;
};

/** Gets the light source object-space direction vector
 *
 * @return {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 */
SceneJS.Light.prototype.getDir = function() {
    return { x: this._light.dir[0], y: this._light.dir[1], z: this._light.dir[2] };
};

/** Sets the light source constant attenuation factor.
 * This is only used wen the source is of mode "point".
 *
 * @param constantAttenuation {double}
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setConstantAttenuation = function (constantAttenuation) {
    this._light.constantAttenuation = (constantAttenuation != undefined) ? constantAttenuation : 1.0;
    return this;
};

/** Gets the light source constant attenuation factor
 *
 * @return {double}
 */
SceneJS.Light.prototype.getConstantAttenuation = function() {
    return this._light.constantAttenuation;
};

/** Sets the light source linear attenuation factor.
 * This is only used wen the source is of mode "point".
 *
 * @param linearAttenuation {double}
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setLinearAttenuation = function (linearAttenuation) {
    this._light.linearAttenuation = linearAttenuation || 0.0;
    return this;
};

/** Gets the light source linear attenuation factor
 *
 * @return {double}
 */
SceneJS.Light.prototype.getLinearAttenuation = function() {
    return this._light.linearAttenuation;
};

/** Sets the light source quadratic attenuation factor.
 * This is only used wen the source is of mode "point".
 *
 * @param quadraticAttenuation {double}
 * @return {SceneJS.Light} this
 */
SceneJS.Light.prototype.setQuadraticAttenuation = function (quadraticAttenuation) {
    this._light.quadraticAttenuation = quadraticAttenuation || 0.0;
    return this;
};

/** Gets the light source quadratic attenuation factor
 *
 * @return {double}
 */
SceneJS.Light.prototype.getQuadraticAttenuation = function() {
    return this._light.quadraticAttenuation;
};

// @private
SceneJS.Light.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.Light.prototype._preCompile = function(traversalContext) {
    SceneJS._lightingModule.pushLight(this._attr.id, this._light);
};

// @private
SceneJS.Light.prototype._postCompile = function(traversalContext) {
};