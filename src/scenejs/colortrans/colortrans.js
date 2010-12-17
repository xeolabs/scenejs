/**
 * @class A scene node that defines color transforms to apply to materials.

 *
 */
SceneJS.Colortrans = SceneJS.createNodeType("colortrans");

// @private
SceneJS.Colortrans.prototype._init = function(params) {
    this._nodeType = "colortrans";
    this._attr = {};
    this.setScale(params.scale);
    this.setAdd(params.add);
    this.setSaturation(params.saturation);
};

/**
 * Sets the amount of saturation as a factor between -1.0 and +1.0
 * @function {SceneJS.Colortrans} setSaturation
 * @param {float} saturation
 */
SceneJS.Colortrans.prototype.setSaturation = function(saturation) {
    this._attr.saturation = saturation;
    this._setDirty();
};

/**
 Returns the amount of saturation as a factor between -1.0 and +1.0
 @function {float} getSaturation
 @returns {float}
 */
SceneJS.Colortrans.prototype.getSaturation = function() {
    return this._attr.saturation;
};


/**
 * Sets the scale
 * @function {SceneJS.Colortrans} setScale
 * @param {float} scale
 */
SceneJS.Colortrans.prototype.setScale = function(scale) {
    scale = scale || {};
    this._attr.scale = {
        r: scale.r != undefined ? scale.r : 1,
        g: scale.g != undefined ? scale.g : 1,
        b: scale.b != undefined ? scale.b : 1,
        a: scale.a != undefined ? scale.a : 1
    };
    this._setDirty();
};

/**
 Returns the scale
 @function {float} getScale
 @returns {float}
 */
SceneJS.Colortrans.prototype.getScale = function() {
    return this._attr.scale;
};

/**
 * Sets the colour addition
 * @function {SceneJS.Colortrans} setAdd
 * @param {float} add
 */
SceneJS.Colortrans.prototype.setAdd = function(add) {
    add = add || {};
    this._attr.add = {
        r: add.r != undefined ? add.r : 0,
        g: add.g != undefined ? add.g : 0,
        b: add.b != undefined ? add.b : 0,
        a: add.a != undefined ? add.a : 0
    };
    this._setDirty();
};

/**
 Returns the colour addition
 @function {float} getAdd
 @returns {float}
 */
SceneJS.Colortrans.prototype.getAdd = function() {
    return this._attr.add;
};

// @private
SceneJS.Colortrans.prototype._render = function(traversalContext) {
    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext);  // no need for colortrans when picking
    } else {
        SceneJS._colortransModule.pushColortrans(this._attr);
        this._renderNodes(traversalContext);
        SceneJS._colortransModule.popColortrans();
    }
};
