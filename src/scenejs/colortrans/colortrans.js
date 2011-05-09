/**
 * @class A scene node that defines color transforms to apply to materials.

 *
 */
SceneJS.Colortrans = SceneJS.createNodeType("colortrans");

// @private
SceneJS.Colortrans.prototype._init = function(params) {
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
};

/**
 * Mutiplies the amount of saturation
 * @param {float} saturation
 */
SceneJS.Colortrans.prototype.mulSaturation = function(saturation) {
    this._attr.saturation *= saturation;
};

/**
 * Increments/decrements the amount of saturation
 * @param {float} saturation
 */
SceneJS.Colortrans.prototype.incSaturation = function(saturation) {
    this._attr.saturation += saturation;
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
 * @param {{r:Number, g: Number, b:Number, a: Number}} scale
 */
SceneJS.Colortrans.prototype.setScale = function(scale) {
    scale = scale || {};
    this._attr.scale = {
        r: scale.r != undefined ? scale.r : 1,
        g: scale.g != undefined ? scale.g : 1,
        b: scale.b != undefined ? scale.b : 1,
        a: scale.a != undefined ? scale.a : 1
    };
};

/**
 * Adds to the scale
 * @param {{r:Number, g: Number, b:Number, a: Number}} scale
 */
SceneJS.Colortrans.prototype.incScale = function(scale) {
    scale = scale || {};
    var s = this._attr.scale;
    if (scale.r) {
        s.r += scale.r;
    }
    if (scale.g) {
        s.g += scale.g;
    }
    if (scale.b) {
        s.b += scale.b;
    }
    if (scale.a) {
        s.a += scale.a;
    }
};

/**
 * Multiplies the scale
 * @param {{r:Number, g: Number, b:Number, a: Number}} scale
 */
SceneJS.Colortrans.prototype.mulScale = function(scale) {
    scale = scale || {};
    var s = this._attr.scale;
    if (scale.r) {
        s.r *= scale.r;
    }
    if (scale.g) {
        s.g *= scale.g;
    }
    if (scale.b) {
        s.b *= scale.b;
    }
    if (scale.a) {
        s.a *= scale.a;
    }
};

/**
 Returns the scale
 @function {float} getScale
 @returns {{r:Number, g: Number, b:Number, a: Number}}
 */
SceneJS.Colortrans.prototype.getScale = function() {
    return this._attr.scale;
};

/**
 * Sets the colour addition
 * @function {SceneJS.Colortrans} setAdd
 * @param {{r:Number, g: Number, b:Number, a: Number}} add
 */
SceneJS.Colortrans.prototype.setAdd = function(add) {
    add = add || {};
    this._attr.add = {
        r: add.r != undefined ? add.r : 0,
        g: add.g != undefined ? add.g : 0,
        b: add.b != undefined ? add.b : 0,
        a: add.a != undefined ? add.a : 0
    };
};

/**
 * Adds to the add
 * @param {{r:Number, g: Number, b:Number, a: Number}} add
 */
SceneJS.Colortrans.prototype.incAdd = function(add) {
    add = add || {};
    var s = this._attr.add;
    if (add.r) {
        s.r += add.r;
    }
    if (add.g) {
        s.g += add.g;
    }
    if (add.b) {
        s.b += add.b;
    }
    if (add.a) {
        s.a += add.a;
    }
};


/**
 * Multiplies the add
 * @param {{r:Number, g: Number, b:Number, a: Number}} add
 */
SceneJS.Colortrans.prototype.mulAdd = function(add) {
    add = add || {};
    var s = this._attr.add;
    if (add.r) {
        s.r *= add.r;
    }
    if (add.g) {
        s.g *= add.g;
    }
    if (add.b) {
        s.b *= add.b;
    }
    if (add.a) {
        s.a *= add.a;
    }
};

/**
 Returns the colour addition
 @returns {{r:Number, g: Number, b:Number, a: Number}}
 */
SceneJS.Colortrans.prototype.getAdd = function() {
    return this._attr.add;
};

// @private
SceneJS.Colortrans.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.Colortrans.prototype._preCompile = function(traversalContext) {
    SceneJS_colortransModule.pushColortrans(this._attr.id, this._attr);
};

// @private
SceneJS.Colortrans.prototype._postCompile = function(traversalContext) {
    SceneJS_colortransModule.popColortrans();
};

