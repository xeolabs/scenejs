/**
 * @class A scene node that defines morphing of geometry positions
 */
SceneJS.MorphGeometry = SceneJS.createNodeType("morphGeometry");

// @private
SceneJS.MorphGeometry.prototype._init = function(params) {

    this._state = SceneJS.Geometry.STATE_INITIAL;

    if (params.create instanceof Function) {

        /* Factory function
         */
        this._create = params.create;

    } else if (params.stream) {

        /* Binary Stream
         */
        this._stream = params.stream;

    } else {

        this._setMorph(params);
    }

    this._attr.factor = params.factor || 0;
    this._attr.clamp = (params.clamp === false) ? false : true;
};

SceneJS.MorphGeometry.prototype._setMorph = function(params) {

    /*--------------------------------------------------------------------------
     * 1. Check we have enough targets for interpolation
     *-------------------------------------------------------------------------*/

    var targets = params.targets || [];
    if (targets.length < 2) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "morphGeometry node should have at least two targets");
    }

    var keys = params.keys || [];
    if (keys.length != targets.length) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "morphGeometry node mismatch in number of keys and targets");
    }

    /*--------------------------------------------------------------------------
     * 2. First target's arrays are defaults for where not given
     * on subsequent targets
     *-------------------------------------------------------------------------*/

    var positions;
    var normals;
    var uv;
    var uv2;
    var target;

    for (var i = 0, len = targets.length; i < len; i++) {
        target = targets[i];
        if (!positions && target.positions) {
            positions = target.positions.slice(0);
        }
        if (!normals && target.normals) {
            normals = target.normals.slice(0);
        }
        if (!uv && target.uv) {
            uv = target.uv.slice(0);
        }
        if (!uv2 && target.uv2) {
            uv2 = target.uv2.slice(0);
        }
    }

    for (var i = 0, len = targets.length; i < len; i++) {
        target = targets[i];
        if (!target.positions) {
            target.positions = positions;  // Can be undefined
        }
        if (!target.normals) {
            target.normals = normals;
        }
        if (!target.uv) {
            target.uv = uv;
        }
        if (!target.uv2) {
            target.uv2 = uv2;
        }
    }

    this._attr.keys = keys;
    this._attr.targets = targets;
};

/** Ready to create MorphGeometry
 */
SceneJS.MorphGeometry.STATE_INITIAL = "init";

/** MorphGeometry in the process of loading
 */
SceneJS.MorphGeometry.STATE_LOADING = "loading";

/** MorphGeometry loaded - MorphGeometry initailised from JSON arrays is immediately in this state and stays here
 */
SceneJS.MorphGeometry.STATE_LOADED = "loaded";

/**
 * Returns the node's current state. Possible states are {@link #STATE_INITIAL},
 * {@link #STATE_LOADING}, {@link #STATE_LOADED}.
 * @returns {int} The state
 */
SceneJS.MorphGeometry.prototype.getState = function() {
    return this._state;
};

// @private
SceneJS.MorphGeometry.prototype._changeState = function(newState, params) {
    params = params || {};
    params.oldState = this._state;
    params.newState = newState;
    this._state = newState;
    if (this._listeners["state-changed"]) {
        this._fireEvent("state-changed", params);
    }
};

/** Returns this MorphGeometry's stream ID, if any
 * @return {String} ID of stream
 */
SceneJS.MorphGeometry.prototype.getStream = function() {
    return this._stream;
};


/**
 Sets the morph factor, a value between [0.0 - 1.0]
 @param {Number} factor - Morph interpolation factor
 @since Version 0.8
 */
SceneJS.MorphGeometry.prototype.setFactor = function(factor) {
    this._attr.factor = factor || 0.0;
};

/**
 Returns the morph factor, a value between [0.0 - 1.0]
 @return {Number}  Morph interpolation factor
 @since Version 0.8
 */
SceneJS.MorphGeometry.prototype.getFactor = function() {
    return this._attr.factor;
};

// @private
SceneJS.MorphGeometry.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// @private
SceneJS.MorphGeometry.prototype._preCompile = function(traversalContext) {

    if (!this._handle) { // Not created yet

        this._handle = SceneJS_morphGeometryModule.createMorphGeometry(this._resource, this._attr);

        this._changeState(SceneJS.MorphGeometry.STATE_LOADED);
    }
    SceneJS_morphGeometryModule.pushMorphGeometry(this._attr.id, this._handle, this._attr.factor);
};

SceneJS.MorphGeometry.prototype._preCompile = function(traversalContext) {
    if (!this._handle) {

        var options = {
            clamp: this._attr.clamp
        };

        /* Morph VBOs not created yet
         */
        if (this._create) {

            /* Targets supplied via callback
             */
            var params = this._create();

            this._setMorph(params);

            this._handle = SceneJS_morphGeometryModule.createMorphGeometry(
                    this._resource,
                    this._attr,
                    options);

            this._changeState(SceneJS.MorphGeometry.STATE_LOADED);

        } else if (this._stream) {

            /* Targets loaded from stream(s)
             */

            this._changeState(SceneJS.MorphGeometry.STATE_LOADING);

            var self = this;

            SceneJS_morphGeometryModule.createMorphGeometry(
                    this._resource,
                    this._stream,
                    options,

                    function(handle) {

                        self._handle = handle;

                        self._changeState(SceneJS.MorphGeometry.STATE_LOADED);

                        /**
                         * Need another compilation to apply freshly-loaded morphGeometry
                         */
                        SceneJS_compileModule.nodeUpdated(self, "loaded");
                    });

        } else { // Arrays

            this._handle = SceneJS_morphGeometryModule.createMorphGeometry(
                    this._resource,
                    this._attr,
                    options);

            this._changeState(SceneJS.MorphGeometry.STATE_LOADED);
        }
    }

    if (this._handle) {

        /* Apply morphGeometry
         */
        SceneJS_morphGeometryModule.pushMorphGeometry(
                this._attr.id,
                this._handle,
                this._attr.factor);
    }
};

// @private
SceneJS.MorphGeometry.prototype._postCompile = function(traversalContext) {
    if (this._handle) {
        SceneJS_morphGeometryModule.popMorphGeometry();
    }
};

// @private
SceneJS.MorphGeometry.prototype._destroy = function() {
    if (this._handle) { // Not created yet
        SceneJS_morphGeometryModule.destroyMorphGeometry(this._handle);
    }
    this._handle= null;
};
