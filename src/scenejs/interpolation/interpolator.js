/**
 * @class A scene node that interpolates a scalar value by interpolating within a sequence of key values.
 * <p>This node begins interpolating as a function of the system clock as soon as it is rendered, sending its output
 * to a property of a selected target node each time.</p>
 * <p><b>Example Usage</b></p><p>This example defines a {@link SceneJS.Cube} with rotation that is animated by
 * a SceneJS.Interpolator.
 * If we thought of <em>alpha</em> as elapsed seconds, then this cube will rotate 360 degrees over one second, then
 * rotate 180 in the reverse direction over the next 0.5 seconds. In this example however, the alpha is actually fixed,
 * where the cube is stuck at 180 degrees - you would need to vary the "alpha" property on the WithData node to actually
 * animate it.</p><pre><code>
 *
 * // ...
 *
 *      new SceneJS.Rotate({
 *              id: "myRotate",
 *              angle 0.0
 *          },
 *          new SceneJS.Cube())),
 *
 *      new SceneJS.Interpolator({
 *              type:"linear",   // or 'cosine', 'cubic' or 'constant'
 *              target: "myRotate",
 *              targetProperty: "angle",
 *              keys: [0.0, 1.0, 1.5],       // Instants in time in seconds
 *              values: [0.0, 360.0, 180.0]
 *          })
 *
 * // ...
 *
 *  </pre></code>
 *
 * @extends SceneJS.Node
 * @since Version 0.7.4
 * @constructor
 * Create a new SceneJS.Interpolator
 * @param {Object} [cfg] Static configuration object
 * @param {String} [cfg.type="linear"] Interpolation type - "linear", "cosine", "cubic" or "constant"
 * @param {String} [cfg.target] ID of target node whose property we'll interpolate
 * @param {String} [cfg.targetProperty] Name of target property on target node
 * @param {double[]} [cfg.keys=[]] Time key values in seconds
 * @param {double[]} [cfg.values=[]] Output key values
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Interpolator = SceneJS.createNodeType("interpolator");


// @private
SceneJS.Interpolator.prototype._init = function(params) {
    this._timeStarted = null;
    this._target = params.target;
    this._targetProperty = params.targetProperty;
    this._outputValue = null;

    /* Whether to remove this node when finished or keep in scene
     */
    this._once = params.once;

    /* Keys and values - verify them if supplied
     */
    if (params.keys) {
        if (!params.values) {
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.InvalidNodeConfigException(
                            "SceneJS.Interpolator configuration incomplete: " +
                            "keys supplied but no values - must supply a value for each key"));
        }
        for (var i = 1; i < params.keys.length; i++) {
            if (params.keys[i - 1] >= params.keys[i]) {
                throw SceneJS._errorModule.fatalError(
                        new SceneJS.errors.InvalidNodeConfigException(
                                "SceneJS.Interpolator configuration invalid: " +
                                "two invalid keys found ("
                                        + (i - 1) + " and " + i + ") - key list should contain distinct values in ascending order"));
            }
        }
    } else if (params.values) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidNodeConfigException(
                        "SceneJS.Interpolator configuration incomplete: " +
                        "values supplied but no keys - must supply a key for each value"));
    }
    this._keys = params.keys || [];
    this._values = params.values || [];
    this._key1 = 0;
    this._key2 = 1;

    /* Interpolation type
     */
    params.type = params.type || 'linear';
    switch (params.type) {
        case 'linear':
            break;
        case 'constant':
            break;
        case 'cosine':
            break;
        case 'cubic':
            if (params.keys.length < 4) {
                throw SceneJS._errorModule.fatalError(
                        new SceneJS.errors.InvalidNodeConfigException(
                                "SceneJS.Interpolator configuration invalid: minimum of four keyframes " +
                                "required for cubic - only "
                                        + params.keys.length
                                        + " are specified"));
            }
            break;
        case 'slerp':
            break;
        default:
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.InvalidNodeConfigException(
                            "SceneJS.Interpolator configuration invalid:  type not supported - " +
                            "only 'linear', 'cosine', 'cubic', 'constant' and 'slerp' are supported"));
        /*


         case 'hermite':
         break;
         */
    }
    this._type = params.type;
    this._once = false;
};

// @private
SceneJS.Interpolator.prototype._NOT_FOUND = 0;        // Alpha outside of key sequence

// @private
SceneJS.Interpolator.prototype._BEFORE_FIRST = 1;     // Alpha before first key

// @private
SceneJS.Interpolator.prototype._AFTER_LAST = 2;       // Alpha after last key

// @private
SceneJS.Interpolator.prototype._FOUND = 3;            // Found keys before and after alpha

// @private
SceneJS.Interpolator.prototype._render = function(traversalContext) {
    if (!this._targetFunc) {

        /* Not bound to a target node setter method yet.
         *
         * Attempt to bind - if target not found, just try again
         * next render, since it might appear in the scene later.
         */

        if (!this._target) {
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.NodeConfigExpectedException(
                            "SceneJS.Interpolator config expected: target"));
        }

        if (!this._targetProperty) {
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.NodeConfigExpectedException(
                            "SceneJS.Interpolator config expected: targetProperty"));
        }

        this._targetNode = SceneJS.getNode(this._target);
        if (this._targetNode) {

            /* Found target node - bind to setter
             */
            var funcName = "set" + this._targetProperty.substr(0, 1).toUpperCase() + this._targetProperty.substr(1)
            if (this._targetNode[funcName] instanceof Function) {
                this._targetFunc = this._targetNode[funcName];
            }
        }
    }
    if (this._targetFunc) {

        /* Have target node method - start timer if not started,
         * update interpolation, feed result into target node setter
         */
        if (!this._timeStarted) {
            this._timeStarted = SceneJS._timeModule.getTime();
        }
        this._update((SceneJS._timeModule.getTime() - this._timeStarted) * 0.001);
        this._targetFunc.call(this._targetNode, this._outputValue);
    }

    /* Render child nodes regardless of target aquisition
     */
    this._renderNodes(traversalContext);
};

// @private
SceneJS.Interpolator.prototype._update = function(key) {
    switch (this._findEnclosingFrame(key)) {
        case this._NOT_FOUND:
            break;

        case this._BEFORE_FIRST:                            // Before first key
            this._setDirty();                               // Need at least one more scene render to find first key
            break;                                          // Time delay before interpolation begins

        case this._AFTER_LAST:
            this._outputValue = this._values[this._values.length - 1];
            if (this._once) {
                this.destroy();
            }
            break;

        case this._FOUND:                                   // Found key pair
            this._outputValue = this._interpolate((key));   // Do interpolation
            this._setDirty();                               // Need at least one more scene render to apply output
            break;
        default:
            break;
    }
};

// @private
SceneJS.Interpolator.prototype._findEnclosingFrame = function(key) {
    if (this._keys.length == 0) {
        return this._NOT_FOUND;
    }
    if (key < this._keys[0]) {
        return this._BEFORE_FIRST;
    }
    if (key > this._keys[this._keys.length - 1]) {
        return this._AFTER_LAST;
    }
    while (this._keys[this._key1] > key) {
        this._key1--;
        this._key2--;
    }
    while (this._keys[this._key2] < key) {
        this._key1++;
        this._key2++;
    }
    return this._FOUND;
};

// @private
SceneJS.Interpolator.prototype._interpolate = function(k) {
    switch (this._type) {
        case 'linear':
            return this._linearInterpolate(k);
        case 'cosine':
            return this._cosineInterpolate(k);
        case 'cubic':
            return this._cubicInterpolate(k);
        case 'constant':
            return this._constantInterpolate(k);
        case 'slerp':
            return this._slerp(k);
        default:
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.InternalException("SceneJS.Interpolator internal error - interpolation type not switched: '"
                            + this._type + "'"));
    }
};

// @private
SceneJS.Interpolator.prototype._linearInterpolate = function(k) {
    var u = this._keys[this._key2] - this._keys[this._key1];
    var v = k - this._keys[this._key1];
    var w = this._values[this._key2] - this._values[this._key1];
    return this._values[this._key1] + ((v / u) * w);
};

// @private
SceneJS.Interpolator.prototype._constantInterpolate = function(k) {
    if (Math.abs((k - this._keys[this._key1])) < Math.abs((k - this._keys[this._key2]))) {
        return this._keys[this._key1];
    } else {
        return this._keys[this._key2];
    }
};

// @private
SceneJS.Interpolator.prototype._cosineInterpolate = function(k) {
    var mu2 = (1 - Math.cos(k * Math.PI) / 2.0);
    return (this._keys[this._key1] * (1 - mu2) + this._keys[this._key2] * mu2);
};

// @private
SceneJS.Interpolator.prototype._cubicInterpolate = function(k) {
    if (this._key1 == 0 || this._key2 == (this._keys.length - 1)) {

        /* Between first or last pair of keyframes - need four keyframes for cubic, so fall back on cosine
         */
        return this._cosineInterpolate(k);
    }
    var y0 = this._keys[this._key1 - 1];
    var y1 = this._keys[this._key1];
    var y2 = this._keys[this._key2];
    var y3 = this._keys[this._key2 + 1];
    var mu2 = k * k;
    var a0 = y3 - y2 - y0 + y1;
    var a1 = y0 - y1 - a0;
    var a2 = y2 - y0;
    var a3 = y1;
    return (a0 * k * mu2 + a1 * mu2 + a2 * k + a3);
};

// @private
SceneJS.Interpolator.prototype._slerp = function(k) {
    var u = this._keys[this._key2] - this._keys[this._key1];
    var v = k - this._keys[this._key1];
    return SceneJS._math_slerp((v / u), this._values[this._key1], this._values[this._key2]);
};


