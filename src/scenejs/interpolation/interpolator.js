(function() {

    var Interpolator = SceneJS.createNodeType("interpolator");

    Interpolator.prototype._init = function(params) {
        this.attr.target = params.target;
        this.attr.targetProperty = params.targetProperty;

        this._timeStarted = null;
        this._outputValue = null;
        this.attr.repeat = params.repeat || 1;

        /* Whether to remove this node when finished or keep in scene
         */
        this.attr.autoDestroy = params.autoDestroy;

        /* Keys and values - verify them if supplied
         */
        if (params.keys) {
            if (!params.values) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "Interpolator configuration incomplete: " +
                        "keys supplied but no values - must supply a value for each key");
            }
            for (var i = 1; i < params.keys.length; i++) {
                if (params.keys[i - 1] >= params.keys[i]) {
                    throw SceneJS_errorModule.fatalError(
                            SceneJS.errors.ILLEGAL_NODE_CONFIG,
                            "Interpolator configuration invalid: " +
                            "two invalid keys found ("
                                    + (i - 1) + " and " + i + ") - key list should contain distinct values in ascending order");
                }
            }
        } else if (params.values) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Interpolator configuration incomplete: " +
                    "values supplied but no keys - must supply a key for each value");
        }
        this.attr.keys = params.keys || [];
        this.attr.values = params.values || [];
        this._key1 = 0;
        this._key2 = 1;

        /* Interpolation mode
         */
        params.mode = params.mode || 'linear';
        switch (params.mode) {
            case 'linear':
                break;
            case 'constant':
                break;
            case 'cosine':
                break;
            case 'cubic':
                if (params.keys.length < 4) {
                    throw SceneJS_errorModule.fatalError(
                            SceneJS.errors.ILLEGAL_NODE_CONFIG,
                            "Interpolator configuration invalid: minimum of four keyframes " +
                            "required for cubic - only "
                                    + params.keys.length
                                    + " are specified");
                }
                break;
            case 'slerp':
                break;
            default:
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "Interpolator configuration invalid:  mode not supported - " +
                        "only 'linear', 'cosine', 'cubic', 'constant' and 'slerp' are supported");
            /*


             case 'hermite':
             break;
             */
        }
        this.attr.mode = params.mode;
    };

    Interpolator.prototype._resetTime = function() {
        this._key1 = 0;
        this._key2 = 1;
        this._timeStarted = null;
    }

    Interpolator.prototype.STATE_OUTSIDE = "outside";    // Alpha outside of key sequence

    Interpolator.prototype.STATE_BEFORE = "pending";     // Alpha before first key

    Interpolator.prototype.STATE_AFTER = "complete";     // Alpha after last key

    Interpolator.prototype.STATE_RUNNING = "running";    // Found keys before and after alpha

    Interpolator.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Interpolator.prototype._preCompile = function(traversalContext) {

        /* Not bound to a target node setter mode yet.
         *
         * Attempt to bind - if target not found, just try again
         * next render, since it might appear in the scene later.
         */

        if (!this.attr.target) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "Interpolator config expected: target");
        }

        if (!this.attr.targetProperty) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "Interpolator config expected: targetProperty");
        }

        /* Generate next value
         */
        if (!this._timeStarted) {
            this._timeStarted = SceneJS_timeModule.getTime();
        }
        this._update((SceneJS_timeModule.getTime() - this._timeStarted) * 0.001);

        if (this._outputValue != null // Null when interpolation outside of time range
                && this.scene.nodeMap.items[this.attr.target]) {

            this._setTargetValue();
        }
    };

    Interpolator.prototype._setTargetValue = function() {
        var propName = this.attr.targetProperty;
        var d = propName.split(".");
        if (d.length == 1) {
            SceneJS.scene(this.scene.attr.id).findNode(this.attr.target).set(propName, this._outputValue);

        } else {
            var root = {};
            var o = root;
            for (var j = 0, len = d.length; j < len; j++) {
                if (j < len - 1) {
                    o[d[j]] = {};
                    o = o[d[j]];
                } else {
                    o[d[j]] = this._outputValue;
                }
            }
            SceneJS.scene(this.scene.attr.id).findNode(this.attr.target).set(root);
        }
    };

    Interpolator.prototype._postCompile = function(traversalContext) {
    };

    Interpolator.prototype._update = function(key) {
        switch (this._findEnclosingFrame(key)) {
            case this.STATE_OUTSIDE:
                break;

            case this.STATE_BEFORE:  // Before first key

                /* Need at least one more scene render to find first key
                 */
                SceneJS_compileModule.nodeUpdated(this, "before");
                break;  // Time delay before interpolation begins

            case this.STATE_AFTER:
                if (this.attr.repeat > 1) {
                    this._resetTime();
                    this.attr.repeat = this.attr.repeat - 1;
                } else if (this.attr.repeat === -1) { // repeat forever
                    this._resetTime();
                } else {
                    //this._outputValue = null;
                    this._outputValue = this.attr.values[this.attr.values.length - 1];
                    if (this.attr._autoDestroy) {
                        this.destroy();
                    }
                }
                break;

            case this.STATE_RUNNING:  // Found key pair
                this._outputValue = this._interpolate((key));   // Do interpolation

                /* Flag recompile for this interpolator. Recompile will be flagged
                 * for target as that is updated.
                 */
                SceneJS_compileModule.nodeUpdated(this, "running");
                break;
            default:
                break;
        }
    };

    Interpolator.prototype._findEnclosingFrame = function(key) {
        if (this.attr.keys.length == 0) {
            return this.STATE_OUTSIDE;
        }
        if (key < this.attr.keys[0]) {
            return this.STATE_BEFORE;
        }
        if (key > this.attr.keys[this.attr.keys.length - 1]) {
            return this.STATE_AFTER;
        }
        while (this.attr.keys[this._key1] > key) {
            this._key1--;
            this._key2--;
        }
        while (this.attr.keys[this._key2] < key) {
            this._key1++;
            this._key2++;
        }
        return this.STATE_RUNNING;
    };

    Interpolator.prototype._interpolate = function(k) {
        switch (this.attr.mode) {
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
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ERROR,
                        "Interpolator internal error - interpolation mode not switched: '"
                                + this.attr.mode + "'");
        }
    };

    Interpolator.prototype._linearInterpolate = function(k) {
        var u = this.attr.keys[this._key2] - this.attr.keys[this._key1];
        var v = k - this.attr.keys[this._key1];
        var w = this.attr.values[this._key2] - this.attr.values[this._key1];
        return this.attr.values[this._key1] + ((v / u) * w);
    };

    Interpolator.prototype._constantInterpolate = function(k) {
        if (Math.abs((k - this.attr.keys[this._key1])) < Math.abs((k - this.attr.keys[this._key2]))) {
            return this.attr.values[this._key1];
        } else {
            return this.attr.values[this._key2];
        }
    };

    // @private
    Interpolator.prototype._cosineInterpolate = function(k) {
        var mu2 = (1 - Math.cos(k * Math.PI) / 2.0);
        return (this.attr.keys[this._key1] * (1 - mu2) + this.attr.keys[this._key2] * mu2);
    };

    Interpolator.prototype._cubicInterpolate = function(k) {
        if (this._key1 == 0 || this._key2 == (this.attr.keys.length - 1)) {

            /* Between first or last pair of keyframes - need four keyframes for cubic, so fall back on cosine
             */
            return this._cosineInterpolate(k);
        }
        var y0 = this.attr.keys[this._key1 - 1];
        var y1 = this.attr.keys[this._key1];
        var y2 = this.attr.keys[this._key2];
        var y3 = this.attr.keys[this._key2 + 1];
        var mu2 = k * k;
        var a0 = y3 - y2 - y0 + y1;
        var a1 = y0 - y1 - a0;
        var a2 = y2 - y0;
        var a3 = y1;
        return (a0 * k * mu2 + a1 * mu2 + a2 * k + a3);
    };

    Interpolator.prototype._slerp = function(k) {
        var u = this.attr.keys[this._key2] - this.attr.keys[this._key1];
        var v = k - this.attr.keys[this._key1];
        return SceneJS_math_slerp((v / u), this.attr.values[this._key1], this.attr.values[this._key2]);
    };

    Interpolator.prototype._changeState = function(newState, params) {
        params = params || {};
        params.oldState = this._state;
        params.newState = newState;
        this._state = newState;
        if (this.listeners["state-changed"]) {
            this._fireEvent("state-changed", params);
        }
    };

})();