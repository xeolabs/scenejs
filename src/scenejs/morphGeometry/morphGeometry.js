/**
 * @class A scene node that defines morphing of geometry positions
 */
SceneJS.MorphGeometry = SceneJS.createNodeType("morphGeometry");

// @private
SceneJS.MorphGeometry.prototype._init = function(params) {
    this._attr = {};

    /*--------------------------------------------------------------------------
     * 1. Check we have enough targets for interpolation
     *-------------------------------------------------------------------------*/

    var targets = params.targets || [];
    if (targets.length < 2) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidNodeConfigException(
                        "morphGeometry node should have at least two targets"));
    }

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

    this._attr.targets = targets;
    this._attr.factor = 0;
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
SceneJS.MorphGeometry.prototype._render = function(traversalContext) {
    if (this._handle) { // Was created before - test if not evicted since
        if (!SceneJS._morphGeometryModule.testMorphGeometryExists(this._handle)) {
            this._handle = null;
        }
    }
    if (!this._handle) { // Either not created yet or has been evicted
        this._handle = SceneJS._morphGeometryModule.createMorphGeometry(this._resource, this._attr);
    }
    SceneJS._morphGeometryModule.pushMorphGeometry(this._handle, this._attr.factor);
    this._renderNodes(traversalContext);
    SceneJS._morphGeometryModule.popMorphGeometry();
};