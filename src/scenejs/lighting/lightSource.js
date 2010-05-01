/*
 class SceneJS.LightSource

 A light source for containment within a SceneJS.Lights node.

 @constructor
 Create a new SceneJS.LightSource
 @param {Object} cfg The config object
 */
SceneJS.LightSource = function(cfg) {
    this._type = "point";
    this._color = [1.0, 1.0, 1.0];
    this._diffuse = true;
    this._specular = true;
    this._pos = [0.0, 0.0, 0.0];
    this._viewPos = [0.0, 0.0, 0.0]; // Transformed view-space pos - accessed by lights module and shading module
    this._dir = [0.0, 0.0, 0.0];
    this._constantAttenuation = 1.0;
    this._linearAttenuation = 0.0;
    this._quadraticAttenuation = 0.0;

    if (cfg) {
        this._init(cfg);
    }
};

/** Sets the light source type
 * @param {String} type Light source type - "dir" or "point"
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setType = function(type) {
    if (type != "dir" && type != "point") {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                "SceneJS.LightSource unsupported type - should be 'dir' or 'point'"));
    }
    this._type = type;
    return this;
};

/** Gets the light source type
 * @return {String} Light source type - "dir" or "point"
 */
SceneJS.LightSource.prototype.getType = function() {
    return this._type;
};

/** Sets the light source color
 *
 * @param color {Object} - Eg. {r: 1.0, g: 1.0, b: 1.0 }
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setColor = function(color) {
    this._color = [
        color.r != undefined ? color.r : 1.0,
        color.g != undefined ? color.g : 1.0,
        color.b != undefined ? color.b : 1.0
    ];
    return this;
};

/** Gets the light source color
 * @return {Object} Eg. {r: 1.0, g: 1.0, b: 1.0 }
 */
SceneJS.LightSource.prototype.getColor = function() {
    return {
        r: this._color[0],
        g: this._color[1],
        b: this._color[2] };
};

/** Sets whether the light source contributes to diffuse lighting or not
 *
 * @param diffuse {boolean}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setDiffuse = function (diffuse) {
    this._diffuse = diffuse;
    return this;
};

/** Gets whether the light source contributes to diffuse lighting or not
 *
 * @return {boolean}
 */
SceneJS.LightSource.prototype.getDiffuse = function() {
    return this._diffuse;
};

/** Sets whether the light source contributes to specular lighting or not
 *
 * @param specular {boolean}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setSpecular = function (specular) {
    this._specular = specular;
    return this;
};

/** Gets whether the light source contributes to specular lighting or not
 *
 * @return {boolean}
 */
SceneJS.LightSource.prototype.getSpecular = function() {
    return this._specular;
};

/** Sets the light source object-space position.
 * This is only used when the source is of type "point".
 *
 * @param pos {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setPos = function(pos) {
    this._pos = [ pos.x || 0.0, pos.y || 0.0, pos.z || 0.0 ];
    return this;
};

/** Gets the light source object-space position
 *
 * @return {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 */
SceneJS.LightSource.prototype.getPos = function() {
    return { x: this._pos[0], y: this._pos[1], z: this._pos[2] };
};

/** Sets the light source object-space direction vector.
 * This is only used when the source is of type "dir".
 *
 * @param dir {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setDir = function(dir) {
    this._dir = [ dir.x || 0.0, dir.y || 0.0, dir.z || 0.0 ];
    return this;
};

/** Gets the light source object-space direction vector
 *
 * @return {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 */
SceneJS.LightSource.prototype.getDir = function() {
    return { x: this._dir[0], y: this._dir[1], z: this._dir[2] };
};

/** Sets the light source constant attenuation factor.
 * This is only used wen the source is of type "point".
 *
 * @param constantAttenuation {double}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setConstantAttenuation = function (constantAttenuation) {
    this._constantAttenuation = constantAttenuation;
    return this;
};

/** Gets the light source constant attenuation factor
 *
 * @return {double}
 */
SceneJS.LightSource.prototype.getConstantAttenuation = function() {
    return this._constantAttenuation;
};

/** Sets the light source linear attenuation factor.
 * This is only used wen the source is of type "point".
 *
 * @param linearAttenuation {double}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setLinearAttenuation = function (linearAttenuation) {
    this._linearAttenuation = linearAttenuation;
    return this;
};

/** Gets the light source linear attenuation factor
 *
 * @return {double}
 */
SceneJS.LightSource.prototype.getLinearAttenuation = function() {
    return this._linearAttenuation;
};

/** Sets the light source quadratic attenuation factor.
 * This is only used wen the source is of type "point".
 *
 * @param quadraticAttenuation {double}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setQuadraticAttenuation = function (quadraticAttenuation) {
    this._quadraticAttenuation = quadraticAttenuation;
    return this;
};

/** Gets the light source quadratic attenuation factor
 *
 * @return {double}
 */
SceneJS.LightSource.prototype.getQuadraticAttenuation = function() {
    return this._quadraticAttenuation;
};


// @private
SceneJS.LightSource.prototype._init = function(cfg) {
    if (cfg) {
        if (cfg.type) {
            this.setType(cfg.type);
        }
        if (cfg.color) {
            this.setColor(cfg.color);
        }
        if (cfg.diffuse != undefined) {
            this._diffuse = cfg.diffuse;
        }
        if (cfg.specular != undefined) {
            this._specular = cfg.specular;
        }
        if (cfg.pos) {
            this.setPos(cfg.pos);
        }
        if (cfg.dir) {
            this.setDir(cfg.dir);
        }
        if (cfg.constantAttenuation) {
            this.setConstantAttenuation(cfg.constantAttenuation);
        }
        if (cfg.linearAttenuation) {
            this.setLinearAttenuation(cfg.linearAttenuation);
        }
        if (cfg.quadraticAttenuation) {
            this.setQuadraticAttenuation(cfg.quadraticAttenuation);
        }
    }
};


/** Function wrapper to support functional scene definition
 */
SceneJS.lightSource = function() {
    var n = new SceneJS.LightSource();
    SceneJS.LightSource.prototype.constructor.apply(n, arguments);
    return n;
};
